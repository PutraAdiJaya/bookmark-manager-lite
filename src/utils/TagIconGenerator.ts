/**
 * Generate colored folder/tag icons for tag groups
 */
export class TagIconGenerator {
  private cache: Map<string, string>;
  
  // Color mapping for different tag codes
  private static readonly TAG_COLORS = {
    'A': { primary: '#4285f4', secondary: '#1a73e8' }, // Blue
    'B': { primary: '#ea4335', secondary: '#c5221f' }, // Red
    'C': { primary: '#34a853', secondary: '#188038' }, // Green
    'D': { primary: '#fbbc05', secondary: '#f9ab00' }, // Yellow
    'E': { primary: '#a142f4', secondary: '#7627bb' }, // Purple
    'F': { primary: '#24c1e0', secondary: '#0097a7' }, // Cyan
    'G': { primary: '#ff6d01', secondary: '#e65100' }, // Orange
    'H': { primary: '#9aa0a6', secondary: '#5f6368' }, // Gray
    'I': { primary: '#00bfa5', secondary: '#00897b' }, // Teal
    'J': { primary: '#6200ea', secondary: '#4a148c' }  // Deep Purple
  };
  
  constructor() {
    this.cache = new Map();
  }
  
  /**
   * Generate a colored tag/folder icon
   * @param tagCode Tag code (A, B, C, etc.)
   * @returns Data URI string for the icon
   */
  generateTagIcon(tagCode: string): string {
    // Check cache first
    if (this.cache.has(tagCode)) {
      return this.cache.get(tagCode)!;
    }
    
    // Get colors for this tag code
    const colors = tagCode in TagIconGenerator.TAG_COLORS
      ? TagIconGenerator.TAG_COLORS[tagCode as keyof typeof TagIconGenerator.TAG_COLORS]
      : { primary: '#9aa0a6', secondary: '#5f6368' }; // Default gray
    
    // Generate SVG with folder/tag icon
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <defs>
    <linearGradient id="tagGradient-${tagCode}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow-${tagCode}">
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Folder/Tag shape with gradient -->
  <path d="M 1 3 L 6 3 L 7 5 L 15 5 L 15 14 L 1 14 Z" 
        fill="url(#tagGradient-${tagCode})"
        filter="url(#shadow-${tagCode})"
        stroke="#ffffff"
        stroke-width="0.5"
        opacity="0.9"/>
  
  <!-- Folder tab -->
  <path d="M 6 3 L 7 5 L 15 5 L 15 6 L 1 6 L 1 3 Z" 
        fill="${colors.secondary}"
        opacity="0.7"/>
  
  <!-- Tag code label -->
  <text x="8" y="11" 
        font-family="Arial, sans-serif" 
        font-size="7" 
        font-weight="bold" 
        fill="#ffffff" 
        text-anchor="middle" 
        dominant-baseline="middle">
    ${tagCode}
  </text>
</svg>`;
    
    // Convert to data URI
    const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`;
    
    // Cache and return
    this.cache.set(tagCode, dataUri);
    return dataUri;
  }
  
  /**
   * Clear the icon cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
