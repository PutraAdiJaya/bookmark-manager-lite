import * as vscode from 'vscode';
import { Bookmark } from '../models';
import { IBookmarkService } from '../services/IBookmarkService';

export async function editBookmarkTagsCommand(
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
        detail: `Tags: ${bm.tags.length > 0 ? bm.tags.join(', ') : 'none'}`,
        bookmark: bm
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a bookmark to edit tags'
      });

      if (!selected) {
        return; // User cancelled
      }

      targetBookmark = selected.bookmark;
    }

    // Get new tags from user
    const currentTags = targetBookmark.tags.join(', ');
    const tagsInput = await vscode.window.showInputBox({
      prompt: 'Enter tags (comma or space separated)',
      placeHolder: 'e.g., important, todo, bug-fix',
      value: currentTags
    });

    if (tagsInput === undefined) {
      return; // User cancelled
    }

    // Parse tags
    const newTags = tagsInput
      .split(/[,\s]+/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    // Update bookmark tags
    await bookmarkService.updateBookmarkTags(targetBookmark.id, newTags);
    
    const tagsText = newTags.length > 0 ? newTags.join(', ') : 'none';
    vscode.window.showInformationMessage(`Bookmark tags updated: ${tagsText}`);
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to edit bookmark tags: ${error.message}`);
  }
}
