import * as vscode from 'vscode';
import { IBookmarkService } from '../services/IBookmarkService';
import { Bookmark } from '../models';
import { IconGenerator } from '../utils/IconGenerator';

export class DecorationManager implements vscode.Disposable {
  private readonly decorationType: vscode.TextEditorDecorationType;
  private readonly todoDecorationType: vscode.TextEditorDecorationType;
  private readonly numberedDecorationTypes: Map<string, vscode.TextEditorDecorationType>;
  private readonly titleDecorationType: vscode.TextEditorDecorationType;
  private readonly disposables: vscode.Disposable[] = [];
  private tagCodeMap: Map<string, string> = new Map();
  private nextCodeIndex = 0;
  private iconGenerator: IconGenerator;
  private refreshTimeout?: NodeJS.Timeout;

  constructor(private bookmarkService: IBookmarkService) {
    this.iconGenerator = new IconGenerator();
    this.decorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: new vscode.ThemeColor('editor.findMatchHighlightBackground'),
      isWholeLine: true,
      overviewRulerColor: new vscode.ThemeColor('editorOverviewRuler.findMatchForeground'),
      overviewRulerLane: vscode.OverviewRulerLane.Center,
      gutterIconPath: vscode.Uri.parse('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text x="0" y="14" font-size="14">📖</text></svg>'),
      gutterIconSize: 'contain'
    });

  // Use an encoded data URI for the TODO gutter icon (emoji SVG) so it renders reliably
    // Use a small vector flame icon (SVG path) instead of relying on emoji glyphs.
    // This ensures the gutter icon renders consistently across platforms.
    const todoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <defs>
        <linearGradient id="todoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff6b3c"/>
          <stop offset="100%" stop-color="#ff3d00"/>
        </linearGradient>
      </defs>
      <path d="M4 2 L12 2 C13 2 14 3 14 4 L14 11 L13 11 L8 14 L3 11 L2 11 L2 4 C2 3 3 2 4 2 Z" fill="url(#todoGradient)" stroke="#cc3300" stroke-width="0.5"/>
      <text x="8" y="8" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">TODO</text>
    </svg>`;
  const svgBuffer = Buffer.from(todoSvg, 'utf-8');
  const base64Svg = svgBuffer.toString('base64');
  this.todoDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: new vscode.ThemeColor('editor.findMatchHighlightBackground'),
    isWholeLine: true,
    overviewRulerColor: new vscode.ThemeColor('editorOverviewRuler.findMatchForeground'),
    overviewRulerLane: vscode.OverviewRulerLane.Center,
    gutterIconPath: vscode.Uri.parse(`data:image/svg+xml;base64,${base64Svg}`),
    gutterIconSize: 'contain'
  });

    // Map to store decoration types for numbered bookmarks
    this.numberedDecorationTypes = new Map();

    // Create decoration type for bookmark titles at the beginning of the bookmarked line
    this.titleDecorationType = vscode.window.createTextEditorDecorationType({
      before: {
        contentText: '',
        color: new vscode.ThemeColor('editorLineNumber.foreground'),
        fontStyle: 'italic',
        fontWeight: 'normal'
      },
      isWholeLine: true
    });

    this.initialize();
  }

  private initialize(): void {
    // Apply decorations to all visible editors
    vscode.window.visibleTextEditors.forEach(editor => {
      this.applyDecorations(editor);
    });

    // Subscribe to bookmark changes with debouncing
    this.disposables.push(
      this.bookmarkService.onBookmarksChanged(() => {
        // Debounce refresh to avoid excessive updates
        if (this.refreshTimeout) {
          clearTimeout(this.refreshTimeout);
        }
        this.refreshTimeout = setTimeout(() => {
          // Refresh tag code mapping when bookmarks change
          this.refreshTagCodeMap();
          this.refreshAllDecorations();
        }, 100); // 100ms debounce
      })
    );

    // Subscribe to editor changes
    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
          this.applyDecorations(editor);
        }
      })
    );

    this.disposables.push(
      vscode.window.onDidChangeVisibleTextEditors(editors => {
        editors.forEach(editor => this.applyDecorations(editor));
      })
    );
    
    // Initialize tag code mapping
    this.refreshTagCodeMap();
  }

  private refreshTagCodeMap(): void {
    // Reset the tag code map and index
    this.tagCodeMap.clear();
    this.nextCodeIndex = 0;
    
    // Get all tag groups and assign unique codes
    const tagGroups = this.bookmarkService.getTagGroups();
    tagGroups.forEach(group => {
      if (!this.tagCodeMap.has(group.tag)) {
        this.tagCodeMap.set(group.tag, this.getNextTagCode());
      }
    });
  }

  private getNextTagCode(): string {
    // Convert index to letter (0->A, 1->B, 2->C, etc.)
    const code = String.fromCharCode(65 + this.nextCodeIndex); // 65 is ASCII code for 'A'
    this.nextCodeIndex++;
    return code;
  }

  private getNumberedDecorationType(numberPrefix: string, isTodo = false): vscode.TextEditorDecorationType {
    const cacheKey = isTodo ? `todo-${numberPrefix}` : numberPrefix;
    
    if (!this.numberedDecorationTypes.has(cacheKey)) {
      // Extract number from prefix (e.g., "A1" -> 1)
      const numberMatch = numberPrefix.match(/[A-Z](\d+)/);
      const number = numberMatch ? parseInt(numberMatch[1]) : 1;
      
      let svg: string;
      
      if (isTodo) {
        // Fire gradient colors for TODO bookmarks
        const fireColors = { start: '#ff4444', middle: '#ff8800', end: '#ffcc00' };
        
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <defs>
    <linearGradient id="fireGradient-${numberPrefix}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${fireColors.start};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${fireColors.middle};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${fireColors.end};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fire circle background -->
  <circle cx="8" cy="8" r="7" 
          fill="url(#fireGradient-${numberPrefix})"
          stroke="none"/>
  
  <!-- Number text -->
  <text x="8" y="8.5" 
        font-family="Arial, sans-serif" 
        font-size="${number > 9 ? '9' : '11'}" 
        font-weight="bold" 
        fill="#ffffff" 
        text-anchor="middle" 
        dominant-baseline="middle">
    ${number > 99 ? '99+' : number}
  </text>
</svg>`;
      } else {
        // Get the tag code (first character) to determine color
        const tagCode = numberPrefix.charAt(0);
        
        // Color palette for multi-color support (A-Z). Index 0 -> 'A', 1 -> 'B', etc.
        const colorPalette: { start: string; end: string }[] = [
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
        ];

        // Map tagCode letter to index (A->0). Default to first palette entry if out of range.
        const idx = tagCode && /^[A-Z]$/.test(tagCode) ? tagCode.charCodeAt(0) - 65 : 0;
        const colors = colorPalette[idx] || { start: '#4285f4', end: '#1a73e8' };
        
        // Generate SVG with numbered bookmark icon using gradient colors
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <defs>
    <linearGradient id="iconGradient-${numberPrefix}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.start};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.end};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background bookmark shape -->
  <path d="M 3 1 L 13 1 L 13 14 L 8 11 L 3 14 Z" 
        fill="url(#iconGradient-${numberPrefix})"
        stroke="#ffffff"
        stroke-width="0.5"/>
  
  <!-- Number text -->
  <text x="8" y="8.5" 
        font-family="Arial, sans-serif" 
        font-size="${number > 9 ? '9' : '11'}" 
        font-weight="bold" 
        fill="#ffffff" 
        text-anchor="middle" 
        dominant-baseline="middle">
    ${number > 99 ? '99+' : number}
  </text>
</svg>`;
      }
      
      const decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: new vscode.ThemeColor('editor.findMatchHighlightBackground'),
        isWholeLine: true,
        overviewRulerColor: new vscode.ThemeColor('editorOverviewRuler.findMatchForeground'),
        overviewRulerLane: vscode.OverviewRulerLane.Center,
        gutterIconPath: vscode.Uri.parse(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`),
        gutterIconSize: 'contain'
      });
      
      this.numberedDecorationTypes.set(cacheKey, decorationType);
      this.disposables.push(decorationType);
    }
    
    const result = this.numberedDecorationTypes.get(cacheKey);
    return result ? result : this.decorationType;
  }

  private applyDecorations(editor: vscode.TextEditor): void {
    // Clear all decorations that this manager might have set in this editor.
    // This is necessary because decoration types are created dynamically and might persist
    // if not explicitly cleared.
    editor.setDecorations(this.todoDecorationType, []);
    editor.setDecorations(this.titleDecorationType, []);
    this.numberedDecorationTypes.forEach(type => {
        editor.setDecorations(type, []);
    });

    const filePath = vscode.workspace.asRelativePath(editor.document.uri);
    const allBookmarks = this.bookmarkService.getAllBookmarks();
    
    const fileBookmarks = allBookmarks.filter(bookmark => {
      const normalizedBookmarkPath = bookmark.filePath.replace(/\\/g, '/');
      const normalizedFilePath = filePath.replace(/\\/g, '/');
      return normalizedBookmarkPath === normalizedFilePath;
    });

    const bookmarksByTag = new Map<string, Bookmark[]>();
    fileBookmarks.forEach(bookmark => {
      const primaryTag = bookmark.tags.length > 0 ? bookmark.tags[0] : 'untagged';
      if (!bookmarksByTag.has(primaryTag)) {
        bookmarksByTag.set(primaryTag, []);
      }
      const arr = bookmarksByTag.get(primaryTag);
      if (arr) {
        arr.push(bookmark);
      }
    });

    const bookmarkNumbering = new Map<string, { numberPrefix: string; number: number; tagCode: string }>();
    bookmarksByTag.forEach((bookmarks, tag) => {
      const tagCode = this.tagCodeMap.get(tag) || 'A';
      bookmarks.forEach((bookmark, index) => {
        const number = index + 1;
        const numberPrefix = `${tagCode}${number}`;
        bookmarkNumbering.set(bookmark.id, { numberPrefix, number, tagCode });
      });
    });

    const decorationsMap = new Map<vscode.TextEditorDecorationType, vscode.DecorationOptions[]>();
    
    fileBookmarks.forEach(bookmark => {
      const numbering = bookmarkNumbering.get(bookmark.id);
      const isTodo = bookmark.tags.some(tag => tag.toLowerCase() === 'todo');

      // Use numbered decoration for all bookmarks, with fire icon for TODO
      const decorationType = numbering ? this.getNumberedDecorationType(numbering.numberPrefix, isTodo) : null;

      if (decorationType) {
        if (!decorationsMap.has(decorationType)) {
            decorationsMap.set(decorationType, []);
        }

        const hoverMessage = numbering
          ? `**${numbering.numberPrefix}. ${bookmark.title}**\n\n${bookmark.description}`
          : `**${bookmark.title}**\n\n${bookmark.description}`;

        const list = decorationsMap.get(decorationType);
        if (list) {
          list.push({
            range: new vscode.Range(bookmark.line, 0, bookmark.line, Number.MAX_SAFE_INTEGER),
            hoverMessage: hoverMessage
          });
        }
      }
    });

    // Apply all gutter icon decorations
    for (const [decorationType, decorations] of decorationsMap.entries()) {
      editor.setDecorations(decorationType, decorations);
    }

    // Create and apply title decorations
    const titleDecorations: vscode.DecorationOptions[] = fileBookmarks.map(bookmark => {
      const isTodo = bookmark.tags.some(tag => tag.toLowerCase() === 'todo');
      const numbering = bookmarkNumbering.get(bookmark.id);
      
      let contentText = '';
      if (isTodo) {
          const prefix = numbering ? `${numbering.numberPrefix}. ` : '';
          contentText = `🔥: ${prefix} ${bookmark.title}`;
      } else {
          contentText = numbering 
            ? `📖: ${numbering.numberPrefix}. ${bookmark.title}` 
            : `📖: ${bookmark.title}`;
      }
      
      return {
        range: new vscode.Range(bookmark.line, 0, bookmark.line, 0),
        renderOptions: {
          before: {
            contentText: contentText,
            color: new vscode.ThemeColor('editorLineNumber.foreground'),
            fontStyle: 'italic',
            fontWeight: 'normal'
          }
        }
      } as vscode.DecorationOptions;
    });

    editor.setDecorations(this.titleDecorationType, titleDecorations);
  }

  private refreshAllDecorations(): void {
    vscode.window.visibleTextEditors.forEach(editor => {
      this.applyDecorations(editor);
    });
  }

  dispose(): void {
    // Clear any pending refresh
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    
    this.decorationType.dispose();
    this.todoDecorationType.dispose();
    this.titleDecorationType.dispose();
    // Dispose all numbered decoration types
    for (const decorationType of this.numberedDecorationTypes.values()) {
      decorationType.dispose();
    }
    this.numberedDecorationTypes.clear();
    this.disposables.forEach(d => d.dispose());
  }
}