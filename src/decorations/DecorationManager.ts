import * as vscode from 'vscode';
import { IBookmarkService } from '../services/IBookmarkService';

export class DecorationManager implements vscode.Disposable {
  private readonly decorationType: vscode.TextEditorDecorationType;
  private readonly disposables: vscode.Disposable[] = [];

  constructor(private bookmarkService: IBookmarkService) {
    this.decorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: new vscode.ThemeColor('editor.findMatchHighlightBackground'),
      isWholeLine: true,
      overviewRulerColor: new vscode.ThemeColor('editorOverviewRuler.findMatchForeground'),
      overviewRulerLane: vscode.OverviewRulerLane.Center,
      gutterIconPath: vscode.Uri.parse('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text x="0" y="14" font-size="14">📖</text></svg>'),
      gutterIconSize: 'contain'
    });

    this.initialize();
  }

  private initialize(): void {
    // Apply decorations to all visible editors
    vscode.window.visibleTextEditors.forEach(editor => {
      this.applyDecorations(editor);
    });

    // Subscribe to bookmark changes
    this.disposables.push(
      this.bookmarkService.onBookmarksChanged(() => {
        this.refreshAllDecorations();
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

    // Create decoration ranges
    const decorations: vscode.DecorationOptions[] = fileBookmarks.map(bookmark => ({
      range: new vscode.Range(bookmark.line, 0, bookmark.line, Number.MAX_SAFE_INTEGER),
      hoverMessage: `**${bookmark.title}**\n\n${bookmark.description}`
    }));

    editor.setDecorations(this.decorationType, decorations);
  }

  private refreshAllDecorations(): void {
    vscode.window.visibleTextEditors.forEach(editor => {
      this.applyDecorations(editor);
    });
  }

  dispose(): void {
    this.decorationType.dispose();
    this.disposables.forEach(d => d.dispose());
  }
}
