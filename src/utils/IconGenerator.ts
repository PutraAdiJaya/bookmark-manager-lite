/**
 * Options for generating numbered bookmark icons
 */
export interface IconGeneratorOptions {
  number: number;
  theme: 'light' | 'dark';
  size?: number;
  tagCode?: string; // Optional tag code for multi-color support (A, B, C, etc.)
}

/**
 * Configuration for icon appearance
 */
const ICON_CONFIG = {
  size: 16, // Default size for tree view
  backgroundColor: {
    light: { start: '#667eea', end: '#764ba2' },
    dark: { start: '#764ba2', end: '#667eea' }
  },
  // Multi-color mapping for different tag codes (A-Z)
  // Multi-color palette for different tag codes (A-Z). Index 0 -> 'A'
  tagColors: [
    { start: '#4285f4', end: '#1a73e8' }, // A Blue
    { start: '#ea4335', end: '#c5221f' }, // B Red
    { start: '#34a853', end: '#188038' }, // C Green
    { start: '#fbbc05', end: '#f9ab00' }, // D Yellow
    { start: '#a142f4', end: '#7627bb' }, // E Purple
    { start: '#24c1e0', end: '#0097a7' }, // F Cyan
    { start: '#ff6d01', end: '#e65100' }, // G Orange
    { start: '#9aa0a6', end: '#5f6368' }, // H Gray
    { start: '#00bfa5', end: '#00897b' }, // I Teal
    { start: '#6200ea', end: '#4a148c' }, // J Deep Purple
    { start: '#e91e63', end: '#c2185b' }, // K Pink
    { start: '#00acc1', end: '#00838f' }, // L Light Blue
    { start: '#8bc34a', end: '#689f38' }, // M Light Green
    { start: '#ff9800', end: '#f57c00' }, // N Amber
    { start: '#9c27b0', end: '#7b1fa2' }, // O Deep Purple
    { start: '#009688', end: '#00796b' }, // P Teal
    { start: '#ff5722', end: '#e64a19' }, // Q Deep Orange
    { start: '#795548', end: '#5d4037' }, // R Brown
    { start: '#607d8b', end: '#455a64' }, // S Blue Gray
    { start: '#cddc39', end: '#afb42b' }, // T Lime
    { start: '#3f51b5', end: '#303f9f' }, // U Indigo
    { start: '#f44336', end: '#d32f2f' }, // V Red
    { start: '#2196f3', end: '#1976d2' }, // W Blue
    { start: '#4caf50', end: '#388e3c' }, // X Green
    { start: '#ffc107', end: '#ffa000' }, // Y Amber
    { start: '#673ab7', end: '#512da8' }  // Z Deep Purple
  ],
  numberColor: {
    light: '#ffffff',
    dark: '#ffffff'
  },
  fontSize: {
    single: 11,  // For numbers 1-9
    double: 9,   // For numbers 10-99
    overflow: 7  // For 99+
  },
  borderRadius: 3,
  padding: 2
};

/**
 * Generates numbered SVG icons for bookmarks with caching support
 */
export class IconGenerator {
  private cache: Map<string, string>;
  
  constructor() {
    this.cache = new Map();
  }
  
  /**
   * Generate a numbered bookmark icon as SVG data URI
   * @param options Icon generation options
   * @returns Data URI string for the icon
   */
  generateNumberedIcon(options: IconGeneratorOptions): string {
    // Check cache first
    const cacheKey = this.getCacheKey(options);
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    // Generate new icon
    const svg = this.generateSVG(options);
    const dataUri = this.svgToDataUri(svg);
    
    // Store in cache with LRU-style management
    if (this.cache.size >= 500) {
      // Remove oldest entry (first key)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(cacheKey, dataUri);
    
    return dataUri;
  }
  
  /**
   * Clear the icon cache
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache key for icon options
   */
  private getCacheKey(options: IconGeneratorOptions): string {
    return `${options.number}-${options.theme}-${options.tagCode || 'default'}`;
  }
  
  /**
   * Generate SVG string for numbered icon
   */
  private generateSVG(options: IconGeneratorOptions): string {
    const size = options.size || ICON_CONFIG.size;
    
    // Use tag-specific colors if tagCode is provided, otherwise use default
    let colors: { start: string; end: string };
    if (options.tagCode && /^[A-Z]$/.test(options.tagCode)) {
      const idx = options.tagCode.charCodeAt(0) - 65; // A -> 0
      colors = ICON_CONFIG.tagColors[idx] || ICON_CONFIG.backgroundColor[options.theme];
    } else {
      colors = ICON_CONFIG.backgroundColor[options.theme];
    }
    
    const numberColor = ICON_CONFIG.numberColor[options.theme];
    
    // Determine display text and font size based on number
    let displayText: string;
    let fontSize: number;
    
    if (options.number <= 9) {
      displayText = options.number.toString();
      fontSize = ICON_CONFIG.fontSize.single;
    } else if (options.number <= 99) {
      displayText = options.number.toString();
      fontSize = ICON_CONFIG.fontSize.double;
    } else {
      displayText = '99+';
      fontSize = ICON_CONFIG.fontSize.overflow;
    }
    
    // Generate unique gradient ID
    const gradientId = `iconGradient-${options.number}-${options.theme}-${options.tagCode || 'default'}`;
    
    // Generate SVG with bookmark shape and number
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 16 16">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.start};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.end};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background bookmark shape -->
  <path d="M 3 1 L 13 1 L 13 14 L 8 11 L 3 14 Z" 
        fill="url(#${gradientId})"
        stroke="#ffffff"
        stroke-width="0.5"/>
  
  <!-- Number text -->
  <text x="8" y="8.5" 
        font-family="Arial, sans-serif" 
        font-size="${fontSize}" 
        font-weight="bold" 
        fill="${numberColor}" 
        text-anchor="middle" 
        dominant-baseline="middle">
    ${displayText}
  </text>
</svg>`;
    
    return svg;
  }
  
  /**
   * Convert SVG string to data URI
   */
  private svgToDataUri(svg: string): string {
    // Encode SVG to base64
    const base64 = Buffer.from(svg, 'utf-8').toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }
}
