import * as vscode from 'vscode';
import { IBookmarkService } from '../services/IBookmarkService';

export async function searchBookmarksCommand(bookmarkService: IBookmarkService): Promise<void> {
  try {
    // Get search query from user
    const query = await vscode.window.showInputBox({
      prompt: 'Enter search term',
      placeHolder: 'Search by title, description, file path, or tags'
    });

    if (query === undefined) {
      return; // User cancelled
    }

    // Perform search
    const results = bookmarkService.searchBookmarks(query);

    if (results.length === 0) {
      vscode.window.showInformationMessage('No bookmarks found matching your search criteria');
      return;
    }

    // Show results in QuickPick
    const items: vscode.QuickPickItem[] = results.map(bookmark => ({
      label: bookmark.title,
      description: `${bookmark.filePath}:${bookmark.line + 1}`,
      detail: bookmark.description || bookmark.tags.join(', ') || 'No description'
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: `Found ${results.length} bookmark(s). Select one to open.`
    });

    if (selected) {
      // Find the actual bookmark from the selection
      const selectedBookmark = results.find(b => 
        b.title === selected.label && 
        `${b.filePath}:${b.line + 1}` === selected.description
      );
      
      if (selectedBookmark) {
        // Open the bookmark
        const uri = vscode.Uri.file(selectedBookmark.filePath);
        const document = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(document);
        const position = new vscode.Position(selectedBookmark.line, selectedBookmark.column);
        editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
        editor.selection = new vscode.Selection(position, position);
      }
    }
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to search bookmarks: ${error.message}`);
  }
}