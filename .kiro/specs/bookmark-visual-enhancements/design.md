# Design Document

## Overview

Bookmark Visual Enhancements adalah peningkatan visual untuk Bookmark Manager Lite extension yang fokus pada dua area utama: (1) redesign icon extension dengan style modern dan gradient colors, dan (2) implementasi sistem penomoran visual pada bookmark items di tree view. Design ini mempertahankan backward compatibility penuh dengan data structure yang ada dan hanya mengubah presentation layer.

### Key Design Principles

1. **Visual First** - Prioritas pada peningkatan visual appeal tanpa mengubah functionality
2. **Non-Breaking Changes** - Tidak ada perubahan pada data model atau storage format
3. **Performance Conscious** - Icon generation harus efficient dan tidak memperlambat UI
4. **Theme Aware** - Icons harus terlihat baik di light dan dark themes
5. **Scalable Design** - Support untuk berbagai jumlah bookmarks (1-99+)

## Architecture

### High-Level Changes

```
┌─────────────────────────────────────────────────────────┐
│                    VS Code Extension                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │         BookmarkTreeProvider (Modified)          │   │
│  │  - Add numbering logic                           │   │
│  │  - Generate numbered icons                       │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                         │
│  ┌──────────────▼───────────────────────────────────┐   │
│  │         IconGenerator (New)                      │   │
│  │  - Generate SVG icons with numbers               │   │
│  │  - Cache generated icons                         │   │
│  │  - Support theme variations                      │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │         resources/icon.svg (Updated)             │   │
│  │  - New gradient design                           │   │
│  │  - Modern bookmark ribbon style                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### Component Changes

1. **Extension Icon** (`resources/icon.svg`)
   - Complete redesign dengan gradient colors
   - Modern bookmark ribbon shape
   - Depth dan shadow effects

2. **IconGenerator** (New: `src/utils/IconGenerator.ts`)
   - Generate SVG data URIs untuk numbered icons
   - Cache icons untuk performance
   - Support light/dark theme variations

3. **BookmarkTreeProvider** (Modified: `src/views/BookmarkTreeProvider.ts`)
   - Add numbering logic untuk bookmarks
   - Integrate dengan IconGenerator
   - Update tree item creation

4. **BookmarkTreeItem** (Modified: `src/views/TreeItems.ts`)
   - Accept numbered icon path
   - Display numbered title

## Components and Interfaces

### New Icon Generator

```typescript
// src/utils/IconGenerator.ts

interface IconGeneratorOptions {
  number: number;
  theme: 'light' | 'dark';
  size?: number;
}

interface IconCache {
  key: string;
  dataUri: string;
}

class IconGenerator {
  private cache: Map<string, string>;
  
  constructor() {
    this.cache = new Map();
  }
  
  /**
   * Generate a numbered bookmark icon as SVG data URI
   * @param options Icon generation options
   * @returns Data URI string for the icon
   */
  generateNumberedIcon(options: IconGeneratorOptions): string;
  
  /**
   * Clear the icon cache
   */
  clearCache(): void;
  
  /**
   * Get cache key for icon options
   */
  private getCacheKey(options: IconGeneratorOptions): string;
  
  /**
   * Generate SVG string for numbered icon
   */
  private generateSVG(options: IconGeneratorOptions): string;
  
  /**
   * Convert SVG string to data URI
   */
  private svgToDataUri(svg: string): string;
}
```

### Modified Tree Provider

```typescript
// src/views/BookmarkTreeProvider.ts (additions)

export class BookmarkTreeProvider implements vscode.TreeDataProvider<BookmarkTreeItem | TagGroupTreeItem> {
  private iconGenerator: IconGenerator;
  
  constructor(private bookmarkService: IBookmarkService) {
    this.iconGenerator = new IconGenerator();
    // ... existing code
  }
  
  getChildren(element?: TagGroupTreeItem): Thenable<(BookmarkTreeItem | TagGroupTreeItem)[]> {
    // ... existing code with modifications
    
    // When creating BookmarkTreeItem, pass numbered icon
    const numberedBookmarks = bookmarks.map((bookmark, index) => {
      const number = index + 1;
      const icon = this.iconGenerator.generateNumberedIcon({
        number,
        theme: this.getCurrentTheme()
      });
      
      return new BookmarkTreeItem(
        bookmark,
        vscode.TreeItemCollapsibleState.None,
        number,
        icon
      );
    });
  }
  
  private getCurrentTheme(): 'light' | 'dark' {
    const theme = vscode.window.activeColorTheme.kind;
    return theme === vscode.ColorThemeKind.Light ? 'light' : 'dark';
  }
}
```

### Modified Tree Item

```typescript
// src/views/TreeItems.ts (modifications)

export class BookmarkTreeItem extends vscode.TreeItem {
  constructor(
    public readonly bookmark: Bookmark,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly number?: number,
    public readonly numberedIcon?: string
  ) {
    // Add number prefix to title if provided
    const displayTitle = number ? `${number}. ${bookmark.title}` : bookmark.title;
    super(displayTitle, collapsibleState);
    
    this.tooltip = `${bookmark.filePath}:${bookmark.line + 1}`;
    this.description = `Line ${bookmark.line + 1}`;
    
    // Use numbered icon if provided, otherwise use default
    if (numberedIcon) {
      this.iconPath = vscode.Uri.parse(numberedIcon);
    } else {
      this.iconPath = new vscode.ThemeIcon('bookmark');
    }
    
    this.contextValue = 'bookmark';
    this.command = {
      command: 'bookmarkLite.open',
      title: 'Open Bookmark',
      arguments: [bookmark]
    };
  }
}
```

## Data Models

### No Changes to Storage

Storage format tetap sama - tidak ada perubahan pada `Bookmark`, `BookmarkData`, atau `BookmarkMetadata` interfaces. Numbering adalah purely presentational dan tidak disimpan.

### Runtime Data

```typescript
// Runtime only - not persisted
interface NumberedBookmarkDisplay {
  bookmark: Bookmark;
  displayNumber: number;
  displayTitle: string;
  iconDataUri: string;
}
```

## Visual Design Specifications

### Extension Icon Design

**New Icon Specifications:**

```svg
<!-- resources/icon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <!-- Gradient definitions -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="ribbonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#ffd89b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#19547b;stop-opacity:1" />
    </linearGradient>
    
    <!-- Shadow filter -->
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="0" dy="2" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.3"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background with rounded corners -->
  <rect width="128" height="128" fill="url(#bgGradient)" rx="20"/>
  
  <!-- Bookmark ribbon with shadow -->
  <g filter="url(#shadow)">
    <path d="M 40 20 L 88 20 L 88 100 L 64 85 L 40 100 Z" 
          fill="url(#ribbonGradient)" 
          stroke="#ffffff" 
          stroke-width="2"/>
    <!-- Fold effect at bottom -->
    <path d="M 40 100 L 64 85 L 64 90 L 40 105 Z" 
          fill="#000000" 
          opacity="0.2"/>
    <path d="M 88 100 L 64 85 L 64 90 L 88 105 Z" 
          fill="#000000" 
          opacity="0.2"/>
  </g>
  
  <!-- Decorative lines on ribbon -->
  <line x1="50" y1="35" x2="78" y2="35" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
  <line x1="50" y1="50" x2="78" y2="50" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
  <line x1="50" y1="65" x2="78" y2="65" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
</svg>
```

**Color Palette:**

- Background: Purple gradient (#667eea → #764ba2)
- Ribbon: Gold to blue gradient (#ffd89b → #19547b)
- Accents: White with opacity
- Shadows: Soft drop shadows for depth

### Numbered Icon Design

**Icon Specifications:**

```typescript
// Icon generation parameters
const ICON_CONFIG = {
  size: 16, // Default size for tree view
  backgroundColor: {
    light: '#667eea',
    dark: '#764ba2'
  },
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
```

**SVG Template for Numbered Icons:**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <defs>
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background bookmark shape -->
  <path d="M 3 1 L 13 1 L 13 14 L 8 11 L 3 14 Z" 
        fill="url(#iconGradient)"/>
  
  <!-- Number text -->
  <text x="8" y="9" 
        font-family="Arial, sans-serif" 
        font-size="${fontSize}" 
        font-weight="bold" 
        fill="${numberColor}" 
        text-anchor="middle" 
        dominant-baseline="middle">
    ${number}
  </text>
</svg>
```

## Implementation Details

### Icon Generation Algorithm

```typescript
// Pseudo-code for icon generation
function generateNumberedIcon(number: number, theme: 'light' | 'dark'): string {
  // 1. Check cache
  const cacheKey = `${number}-${theme}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  // 2. Determine display text
  let displayText: string;
  let fontSize: number;
  
  if (number <= 9) {
    displayText = number.toString();
    fontSize = ICON_CONFIG.fontSize.single;
  } else if (number <= 99) {
    displayText = number.toString();
    fontSize = ICON_CONFIG.fontSize.double;
  } else {
    displayText = '99+';
    fontSize = ICON_CONFIG.fontSize.overflow;
  }
  
  // 3. Generate SVG
  const svg = generateSVGTemplate({
    number: displayText,
    fontSize,
    colors: ICON_CONFIG.backgroundColor[theme],
    numberColor: ICON_CONFIG.numberColor[theme]
  });
  
  // 4. Convert to data URI
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  
  // 5. Cache and return
  cache.set(cacheKey, dataUri);
  return dataUri;
}
```

### Numbering Logic

```typescript
// Numbering within tag groups
function getNumberedBookmarks(tagGroup: TagGroup): NumberedBookmarkDisplay[] {
  const bookmarks = bookmarkService.getBookmarksByTag(tagGroup.tag);
  
  return bookmarks.map((bookmark, index) => {
    const number = index + 1;
    const displayTitle = `${number}. ${bookmark.title}`;
    const iconDataUri = iconGenerator.generateNumberedIcon({
      number,
      theme: getCurrentTheme()
    });
    
    return {
      bookmark,
      displayNumber: number,
      displayTitle,
      iconDataUri
    };
  });
}
```

### Theme Change Handling

```typescript
// Listen to theme changes and refresh icons
vscode.window.onDidChangeActiveColorTheme((theme) => {
  // Clear icon cache since theme changed
  iconGenerator.clearCache();
  
  // Refresh tree view to regenerate icons
  treeProvider.refresh();
});
```

## Performance Considerations

### Icon Caching Strategy

1. **In-Memory Cache**
   - Cache generated SVG data URIs
   - Key format: `${number}-${theme}`
   - Clear cache on theme change
   - Maximum cache size: 200 entries (100 numbers × 2 themes)

2. **Lazy Generation**
   - Generate icons only when tree items are created
   - Don't pre-generate all possible icons

3. **Cache Invalidation**
   - Clear cache on theme change
   - Clear cache on extension reload
   - No need to clear on bookmark changes (numbers may change but icons are reused)

### Tree View Performance

1. **Efficient Numbering**
   - Calculate numbers during tree item creation
   - No additional data structure needed
   - O(n) complexity where n = bookmarks in group

2. **Minimal Re-renders**
   - Only refresh tree view when bookmarks change
   - Theme changes trigger full refresh (necessary for icon updates)

## Testing Strategy

### Visual Testing

1. **Icon Appearance**
   - Test extension icon at different sizes (16px, 32px, 64px, 128px)
   - Test in VS Code marketplace preview
   - Test in sidebar at different zoom levels
   - Test in light and dark themes

2. **Numbered Icons**
   - Test single digit numbers (1-9)
   - Test double digit numbers (10-99)
   - Test overflow display (99+)
   - Test in light and dark themes
   - Test at different DPI settings

### Functional Testing

1. **Numbering Logic**
   - Test sequential numbering within groups
   - Test renumbering after bookmark deletion
   - Test renumbering after bookmark addition
   - Test multiple tag groups with independent numbering

2. **Icon Generation**
   - Test cache hit/miss scenarios
   - Test cache clearing on theme change
   - Test memory usage with many bookmarks
   - Test data URI generation

3. **Integration Tests**
   - Test complete flow: add bookmark → see numbered item
   - Test theme switching → icons update
   - Test bookmark deletion → numbers update
   - Test tag changes → numbers update in new group

### Unit Tests

```typescript
// Example test structure
describe('IconGenerator', () => {
  describe('generateNumberedIcon', () => {
    it('should generate icon for single digit', () => {});
    it('should generate icon for double digit', () => {});
    it('should generate 99+ for numbers over 99', () => {});
    it('should cache generated icons', () => {});
    it('should generate different icons for different themes', () => {});
  });
  
  describe('cache management', () => {
    it('should clear cache', () => {});
    it('should reuse cached icons', () => {});
  });
});

describe('BookmarkTreeProvider numbering', () => {
  it('should number bookmarks sequentially within group', () => {});
  it('should start numbering from 1 for each group', () => {});
  it('should update numbers when bookmarks are added', () => {});
  it('should update numbers when bookmarks are removed', () => {});
});
```

## Backward Compatibility

### Data Compatibility

- **No changes to storage format** - `bookmark.json` structure remains identical
- **No migration needed** - Existing bookmarks work immediately
- **No data loss** - All existing bookmark data preserved

### Functional Compatibility

- **All existing commands work** - No changes to command behavior
- **All existing features work** - Navigation, editing, deletion unchanged
- **Keyboard shortcuts unchanged** - All keybindings remain the same

### Visual Compatibility

- **Graceful degradation** - If icon generation fails, fall back to default icon
- **Theme compatibility** - Works with all VS Code themes
- **Accessibility** - Numbers in title ensure screen reader compatibility

## Error Handling

### Icon Generation Errors

```typescript
try {
  const icon = iconGenerator.generateNumberedIcon(options);
  return icon;
} catch (error) {
  console.error('Failed to generate numbered icon:', error);
  // Fall back to default bookmark icon
  return new vscode.ThemeIcon('bookmark');
}
```

### SVG Generation Errors

- Validate number input (must be positive integer)
- Validate theme input (must be 'light' or 'dark')
- Handle SVG encoding errors
- Handle data URI conversion errors

## Future Extensibility

### Potential Enhancements

1. **Custom Icon Styles**
   - Allow users to choose icon style (flat, gradient, minimal)
   - Configuration setting for icon appearance

2. **Custom Numbering Formats**
   - Roman numerals option
   - Alphabetic numbering option
   - Custom prefix/suffix

3. **Icon Customization**
   - User-defined colors
   - User-defined icon shapes
   - Import custom icon sets

4. **Advanced Numbering**
   - Global numbering across all groups
   - Hierarchical numbering (A1, A2, B1, B2)
   - Custom numbering schemes per tag

## Configuration

### No New Settings Required

This enhancement works out-of-the-box without requiring any user configuration. However, future versions could add:

```json
{
  "bookmarkLite.visual.iconStyle": {
    "type": "string",
    "enum": ["gradient", "flat", "minimal"],
    "default": "gradient",
    "description": "Visual style for bookmark icons"
  },
  "bookmarkLite.visual.numberingFormat": {
    "type": "string",
    "enum": ["numeric", "alphabetic", "roman"],
    "default": "numeric",
    "description": "Format for bookmark numbering"
  },
  "bookmarkLite.visual.showNumbers": {
    "type": "boolean",
    "default": true,
    "description": "Show numbers on bookmark items"
  }
}
```

## Security Considerations

### SVG Generation

- **No user input in SVG** - Only controlled number values
- **No external resources** - All SVG generated inline
- **No script injection** - Pure SVG without scripts
- **Safe data URIs** - Base64 encoded, no executable content

### Performance Limits

- **Cache size limit** - Prevent memory exhaustion
- **Number range limit** - Cap at 999 to prevent rendering issues
- **Generation timeout** - Fail fast if generation takes too long
