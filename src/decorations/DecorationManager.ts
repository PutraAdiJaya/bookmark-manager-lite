import * as vscode from 'vscode';
import { IBookmarkService } from '../services/IBookmarkService';
import { Bookmark } from '../models';
import { IconGenerator } from '../utils/IconGenerator';

export class DecorationManager implements vscode.Disposable {
  private readonly decorationType: vscode.TextEditorDecorationType;
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

  private getNumberedDecorationType(numberPrefix: string): vscode.TextEditorDecorationType {
    if (!this.numberedDecorationTypes.has(numberPrefix)) {
      // Extract number from prefix (e.g., "A1" -> 1)
      const numberMatch = numberPrefix.match(/[A-Z](\d+)/);
      const number = numberMatch ? parseInt(numberMatch[1]) : 1;
      
      // Get the tag code (first character) to determine color
      const tagCode = numberPrefix.charAt(0);
      
      // Define color mapping for multi-color support (A-Z)
      const colorMap: { [key: string]: { start: string; end: string } } = {
        'A': { start: '#4285f4', end: '#1a73e8' }, // Blue
        'B': { start: '#ea4335', end: '#c5221f' }, // Red
        'C': { start: '#34a853', end: '#188038' }, // Green
        'D': { start: '#fbbc05', end: '#f9ab00' }, // Yellow
        'E': { start: '#a142f4', end: '#7627bb' }, // Purple
        'F': { start: '#24c1e0', end: '#0097a7' }, // Cyan
        'G': { start: '#ff6d01', end: '#e65100' }, // Orange
        'H': { start: '#9aa0a6', end: '#5f6368' }, // Gray
        'I': { start: '#00bfa5', end: '#00897b' }, // Teal
        'J': { start: '#6200ea', end: '#4a148c' }, // Deep Purple
        'K': { start: '#e91e63', end: '#c2185b' }, // Pink
        'L': { start: '#00acc1', end: '#00838f' }, // Light Blue
        'M': { start: '#8bc34a', end: '#689f38' }, // Light Green
        'N': { start: '#ff9800', end: '#f57c00' }, // Amber
        'O': { start: '#9c27b0', end: '#7b1fa2' }, // Deep Purple
        'P': { start: '#009688', end: '#00796b' }, // Teal
        'Q': { start: '#ff5722', end: '#e64a19' }, // Deep Orange
        'R': { start: '#795548', end: '#5d4037' }, // Brown
        'S': { start: '#607d8b', end: '#455a64' }, // Blue Gray
        'T': { start: '#cddc39', end: '#afb42b' }, // Lime
        'U': { start: '#3f51b5', end: '#303f9f' }, // Indigo
        'V': { start: '#f44336', end: '#d32f2f' }, // Red
        'W': { start: '#2196f3', end: '#1976d2' }, // Blue
        'X': { start: '#4caf50', end: '#388e3c' }, // Green
        'Y': { start: '#ffc107', end: '#ffa000' }, // Amber
        'Z': { start: '#673ab7', end: '#512da8' }  // Deep Purple
      };
      
      // Default to blue if tag code not found
      const colors = colorMap[tagCode] || { start: '#4285f4', end: '#1a73e8' };
      
      // Get current theme
      const theme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Light ? 'light' : 'dark';
      
      // Generate SVG with numbered bookmark icon using gradient colors
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
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
      
      const decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: new vscode.ThemeColor('editor.findMatchHighlightBackground'),
        isWholeLine: true,
        overviewRulerColor: new vscode.ThemeColor('editorOverviewRuler.findMatchForeground'),
        overviewRulerLane: vscode.OverviewRulerLane.Center,
        gutterIconPath: vscode.Uri.parse(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`),
        gutterIconSize: 'contain'
      });
      
      this.numberedDecorationTypes.set(numberPrefix, decorationType);
      this.disposables.push(decorationType);
    }
    
    return this.numberedDecorationTypes.get(numberPrefix)!;
  }

  private applyDecorations(editor: vscode.TextEditor): void {
    const filePath = vscode.workspace.asRelativePath(editor.document.uri);
    const allBookmarks = this.bookmarkService.getAllBookmarks();
    
    // Filter bookmarks for this file
    const fileBookmarks = allBookmarks.filter(bookmark => {
      const normalizedBookmarkPath = bookmark.filePath.replace(/\\/g, '/');
      const normalizedFilePath = filePath.replace(/\\/g, '/');
      return normalizedBookmarkPath === normalizedFilePath;
    });

    // Group bookmarks by tag to calculate numbering
    const bookmarksByTag = new Map<string, Bookmark[]>();
    fileBookmarks.forEach(bookmark => {
      // Get primary tag (first tag or 'untagged')
      const primaryTag = bookmark.tags.length > 0 ? bookmark.tags[0] : 'untagged';
      
      if (!bookmarksByTag.has(primaryTag)) {
        bookmarksByTag.set(primaryTag, []);
      }
      bookmarksByTag.get(primaryTag)!.push(bookmark);
    });

    // Calculate numbering for each bookmark
    const bookmarkNumbering = new Map<string, { numberPrefix: string; number: number; tagCode: string }>();
    
    bookmarksByTag.forEach((bookmarks, tag) => {
      // Get tag code from tagCodeMap
      const tagCode = this.tagCodeMap.get(tag) || 'A';
      
      bookmarks.forEach((bookmark, index) => {
        const number = index + 1;
        const numberPrefix = `${tagCode}${number}`;
        bookmarkNumbering.set(bookmark.id, { numberPrefix, number, tagCode });
      });
    });

    // Apply decorations for numbered bookmarks
    const numberedDecorationsMap = new Map<vscode.TextEditorDecorationType, vscode.DecorationOptions[]>();
    
    fileBookmarks.forEach(bookmark => {
      const numbering = bookmarkNumbering.get(bookmark.id);
      if (numbering) {
        const decorationType = this.getNumberedDecorationType(numbering.numberPrefix);
        if (!numberedDecorationsMap.has(decorationType)) {
          numberedDecorationsMap.set(decorationType, []);
        }
        
        numberedDecorationsMap.get(decorationType)!.push({
          range: new vscode.Range(bookmark.line, 0, bookmark.line, Number.MAX_SAFE_INTEGER),
          hoverMessage: `**${numbering.numberPrefix}. ${bookmark.title}**\n\n${bookmark.description}`
        });
      }
    });

    // Set decorations for numbered bookmarks
    for (const [decorationType, decorations] of numberedDecorationsMap.entries()) {
      editor.setDecorations(decorationType, decorations);
    }

    // Create decoration ranges for titles at the beginning of the bookmarked line
    const titleDecorations: vscode.DecorationOptions[] = fileBookmarks.map(bookmark => {
      const numbering = bookmarkNumbering.get(bookmark.id);
      const contentText = numbering 
        ? `${numbering.numberPrefix}. Bookmark: ${bookmark.title}` 
        : `Bookmark: ${bookmark.title}`;
      
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
    this.titleDecorationType.dispose();
    // Dispose all numbered decoration types
    for (const decorationType of this.numberedDecorationTypes.values()) {
      decorationType.dispose();
    }
    this.numberedDecorationTypes.clear();
    this.disposables.forEach(d => d.dispose());
  }
}