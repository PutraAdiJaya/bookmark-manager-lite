import * as vscode from 'vscode';
import { IBookmarkService } from '../services/IBookmarkService';

export async function clearAllBookmarksCommand(bookmarkService: IBookmarkService): Promise<void> {
  try {
    const allBookmarks = bookmarkService.getAllBookmarks();
    
    if (allBookmarks.length === 0) {
      vscode.window.showInformationMessage('No bookmarks to clear');
      return;
    }

    // Show confirmation dialog with warning
    const answer = await vscode.window.showWarningMessage(
      `Are you sure you want to remove all ${allBookmarks.length} bookmark(s)? This action cannot be undone.`,
      { modal: true },
      'Clear All'
    );

    if (answer !== 'Clear All') {
      return;
    }

    // Clear all bookmarks
    await bookmarkService.clearAllBookmarks();
    vscode.window.showInformationMessage('All bookmarks cleared successfully');
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to clear bookmarks: ${error.message}`);
  }
}
