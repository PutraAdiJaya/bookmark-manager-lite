import * as vscode from 'vscode';

export class TodoIconGenerator {
  private iconCache: Map<string, vscode.Uri> = new Map();

  /**
   * Generate a fire icon with number for TODO bookmarks
   */
  generateTodoIcon(options: {
    number: number | string;
    theme: 'light' | 'dark';
  }): vscode.Uri {
    const { number, theme } = options;
    const cacheKey = `todo-${number}-${theme}`;

    // Check cache first
    if (this.iconCache.has(cacheKey)) {
      return this.iconCache.get(cacheKey)!;
    }

    // Generate SVG with fire colors
    const svg = this.generateFireSvg(number.toString(), theme);
    const uri = this.svgToDataUri(svg);

    // Cache the icon
    if (this.iconCache.size < 500) {
      this.iconCache.set(cacheKey, uri);
    }

    return uri;
  }

  /**
   * Generate SVG with fire gradient colors (red-orange-yellow)
   */
  private generateFireSvg(number: string, theme: 'light' | 'dark'): string {
    const size = 16;
    const fontSize = number.length > 2 ? 8 : 10;
    
    // Fire colors: red to orange to yellow gradient
    const gradientColors = theme === 'dark' 
      ? { start: '#ff4444', middle: '#ff8800', end: '#ffcc00' }
      : { start: '#cc0000', middle: '#ff6600', end: '#ff9900' };

    return `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fireGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${gradientColors.start};stop-opacity:1" />
            <stop offset="50%" style="stop-color:${gradientColors.middle};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${gradientColors.end};stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" 
                fill="url(#fireGradient)" stroke="none"/>
        <text x="${size / 2}" y="${size / 2}" 
              font-family="Arial, sans-serif" 
              font-size="${fontSize}" 
              font-weight="bold" 
              fill="white" 
              text-anchor="middle" 
              dominant-baseline="central">${number}</text>
      </svg>
    `.trim();
  }

  /**
   * Convert SVG string to data URI
   */
  private svgToDataUri(svg: string): vscode.Uri {
    const encoded = Buffer.from(svg).toString('base64');
    return vscode.Uri.parse(`data:image/svg+xml;base64,${encoded}`);
  }

  /**
   * Generate a fire icon with tag code letter for TODO tag groups
   */
  generateTodoTagIcon(tagCode: string, theme: 'light' | 'dark'): vscode.Uri {
    const cacheKey = `todo-tag-${tagCode}-${theme}`;

    // Check cache first
    if (this.iconCache.has(cacheKey)) {
      return this.iconCache.get(cacheKey)!;
    }

    // Generate SVG with fire colors for tag group
    const svg = this.generateFireTagSvg(tagCode, theme);
    const uri = this.svgToDataUri(svg);

    // Cache the icon
    if (this.iconCache.size < 500) {
      this.iconCache.set(cacheKey, uri);
    }

    return uri;
  }

  /**
   * Generate SVG with fire gradient for tag group
   */
  private generateFireTagSvg(tagCode: string, theme: 'light' | 'dark'): string {
    const size = 16;
    const fontSize = 11;
    
    // Fire colors: red to orange to yellow gradient
    const gradientColors = theme === 'dark' 
      ? { start: '#ff4444', middle: '#ff8800', end: '#ffcc00' }
      : { start: '#cc0000', middle: '#ff6600', end: '#ff9900' };

    return `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fireTagGradient-${tagCode}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${gradientColors.start};stop-opacity:1" />
            <stop offset="50%" style="stop-color:${gradientColors.middle};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${gradientColors.end};stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" 
                fill="url(#fireTagGradient-${tagCode})" stroke="none"/>
        <text x="${size / 2}" y="${size / 2}" 
              font-family="Arial, sans-serif" 
              font-size="${fontSize}" 
              font-weight="bold" 
              fill="white" 
              text-anchor="middle" 
              dominant-baseline="central">${tagCode}</text>
      </svg>
    `.trim();
  }

  /**
   * Clear the icon cache (useful when theme changes)
   */
  clearCache(): void {
    this.iconCache.clear();
  }
}
