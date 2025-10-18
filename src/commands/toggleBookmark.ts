import * as vscode from 'vscode';
import { IBookmarkService } from '../services/IBookmarkService';

export async function toggleBookmarkCommand(
  bookmarkService: IBookmarkService,
  viewId?: string
): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }

  const document = editor.document;
  const position = editor.selection.active;
  const filePath = vscode.workspace.asRelativePath(document.uri);
  const line = position.line;
  const column = position.character;

  // Check if bookmark already exists at this location
  const existingBookmarks = bookmarkService.getAllBookmarks();
  const existingBookmark = existingBookmarks.find(
    b => b.filePath === filePath && b.line === line
  );

  if (existingBookmark) {
    // Remove existing bookmark
    await bookmarkService.deleteBookmark(existingBookmark.id);
    vscode.window.showInformationMessage('Bookmark removed');
  } else {
    // Add new bookmark
    const lineText = document.lineAt(line).text.trim();
    const title = lineText.substring(0, 50) || `Line ${line + 1}`;
    
    // Determine tags based on which view the button was clicked from
    let tags: string[] = [];
    if (viewId === 'bookmarkTodoExplorer') {
      tags = ['TODO'];
    }
    
    await bookmarkService.addBookmark({
      title,
      description: '',
      filePath,
      line,
      column,
      tags
    });
    
    const tagInfo = tags.length > 0 ? ` (${tags.join(', ')})` : '';
    vscode.window.showInformationMessage(`Bookmark added${tagInfo}`);
  }
}
