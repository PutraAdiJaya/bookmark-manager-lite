import * as vscode from 'vscode';
import { Bookmark } from '../models';
import { IBookmarkService } from '../services/IBookmarkService';

export async function removeBookmarkCommand(
  bookmarkService: IBookmarkService,
  bookmark?: Bookmark
): Promise<void> {
  try {
    let targetBookmark = bookmark;

    // If no bookmark provided, show quick pick
    if (!targetBookmark) {
      const allBookmarks = bookmarkService.getAllBookmarks();
      
      if (allBookmarks.length === 0) {
        vscode.window.showInformationMessage('No bookmarks found');
        return;
      }

      const items = allBookmarks.map(bm => ({
        label: bm.title,
        description: `${bm.filePath}:${bm.line + 1}`,
        detail: bm.description,
        bookmark: bm
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a bookmark to remove'
      });

      if (!selected) {
        return; // User cancelled
      }

      targetBookmark = selected.bookmark;
    }

    // Show confirmation dialog
    const answer = await vscode.window.showWarningMessage(
      `Are you sure you want to remove bookmark "${targetBookmark.title}"?`,
      { modal: true },
      'Remove'
    );

    if (answer !== 'Remove') {
      return;
    }

    // Remove bookmark
    await bookmarkService.deleteBookmark(targetBookmark.id);
    vscode.window.showInformationMessage(`Bookmark "${targetBookmark.title}" removed successfully`);
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to remove bookmark: ${error.message}`);
  }
}
