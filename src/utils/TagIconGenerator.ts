/**
 * Generate colored folder/tag icons for tag groups
 */
export class TagIconGenerator {
  private cache: Map<string, string>;
  
  // Color palette for different tag codes (A-Z). Index 0 -> 'A'
  private static readonly tagColorsPalette = [
    { primary: '#4285f4', secondary: '#1a73e8' }, // A
    { primary: '#ea4335', secondary: '#c5221f' }, // B
    { primary: '#34a853', secondary: '#188038' }, // C
    { primary: '#fbbc05', secondary: '#f9ab00' }, // D
    { primary: '#a142f4', secondary: '#7627bb' }, // E
    { primary: '#24c1e0', secondary: '#0097a7' }, // F
    { primary: '#ff6d01', secondary: '#e65100' }, // G
    { primary: '#9aa0a6', secondary: '#5f6368' }, // H
    { primary: '#00bfa5', secondary: '#00897b' }, // I
    { primary: '#6200ea', secondary: '#4a148c' }, // J
    { primary: '#e91e63', secondary: '#c2185b' }, // K
    { primary: '#00acc1', secondary: '#00838f' }, // L
    { primary: '#8bc34a', secondary: '#689f38' }, // M
    { primary: '#ff9800', secondary: '#f57c00' }, // N
    { primary: '#9c27b0', secondary: '#7b1fa2' }, // O
    { primary: '#009688', secondary: '#00796b' }, // P
    { primary: '#ff5722', secondary: '#e64a19' }, // Q
    { primary: '#795548', secondary: '#5d4037' }, // R
    { primary: '#607d8b', secondary: '#455a64' }, // S
    { primary: '#cddc39', secondary: '#afb42b' }, // T
    { primary: '#3f51b5', secondary: '#303f9f' }, // U
    { primary: '#f44336', secondary: '#d32f2f' }, // V
    { primary: '#2196f3', secondary: '#1976d2' }, // W
    { primary: '#4caf50', secondary: '#388e3c' }, // X
    { primary: '#ffc107', secondary: '#ffa000' }, // Y
    { primary: '#673ab7', secondary: '#512da8' }  // Z
  ];
  
  constructor() {
    this.cache = new Map();
  }
  
  /**
   * Generate a colored tag/folder icon
   * @param tagCode Tag code (A, B, C, AA, AB, etc.)
   * @returns Data URI string for the icon
   */
  generateTagIcon(tagCode: string): string {
    // Check cache first
    if (this.cache.has(tagCode)) {
      const cached = this.cache.get(tagCode);
      if (cached) return cached;
    }
    
    // Get colors for this tag code
    // For multi-char codes (AA, AB), use first character's color
    const firstChar = tagCode.charAt(0);
    const idx = /^[A-Z]$/.test(firstChar) ? firstChar.charCodeAt(0) - 65 : -1;
    const colors = idx >= 0 ? TagIconGenerator.tagColorsPalette[idx] : { primary: '#9aa0a6', secondary: '#5f6368' };
    
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
        font-size="${tagCode.length > 1 ? '5' : '7'}" 
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
