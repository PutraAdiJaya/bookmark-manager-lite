import * as vscode from 'vscode';
import { Bookmark } from '../models';
import { IBookmarkService } from '../services/IBookmarkService';
import { BookmarkTreeItem } from '../views/TreeItems';

export async function editBookmarkDetailsCommand(
  bookmarkService: IBookmarkService,
  bookmarkOrTreeItem?: Bookmark | BookmarkTreeItem
): Promise<void> {
  try {
    let targetBookmark: Bookmark | undefined;

    // Handle both Bookmark and BookmarkTreeItem
    if (bookmarkOrTreeItem) {
      if ('bookmark' in bookmarkOrTreeItem) {
        // It's a BookmarkTreeItem
        targetBookmark = bookmarkOrTreeItem.bookmark;
      } else if ('id' in bookmarkOrTreeItem) {
        // It's a Bookmark
        targetBookmark = bookmarkOrTreeItem as Bookmark;
      }
    }

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
        detail: bm.description || 'No description',
        bookmark: bm
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a bookmark to edit'
      });

      if (!selected) {
        return; // User cancelled
      }

      targetBookmark = selected.bookmark;
    }

    // Validate that we have a bookmark with an ID
    if (!targetBookmark || !targetBookmark.id) {
      vscode.window.showErrorMessage('Invalid bookmark selected');
      return;
    }

    // Ask what to edit
    const editChoice = await vscode.window.showQuickPick([
      { label: 'Edit Title', value: 'title' },
      { label: 'Edit Description', value: 'description' },
      { label: 'Edit Both', value: 'both' }
    ], {
      placeHolder: 'What would you like to edit?'
    });

    if (!editChoice) {
      return; // User cancelled
    }

    let newTitle = targetBookmark.title;
    let newDescription = targetBookmark.description;

    // Edit title
    if (editChoice.value === 'title' || editChoice.value === 'both') {
      const titleInput = await vscode.window.showInputBox({
        prompt: 'Enter new title',
        placeHolder: 'Bookmark title',
        value: targetBookmark.title,
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Title cannot be empty';
          }
          return null;
        }
      });

      if (titleInput === undefined) {
        return; // User cancelled
      }

      newTitle = titleInput.trim();
    }

    // Edit description
    if (editChoice.value === 'description' || editChoice.value === 'both') {
      const descriptionInput = await vscode.window.showInputBox({
        prompt: 'Enter new description (optional)',
        placeHolder: 'Additional details...',
        value: targetBookmark.description
      });

      if (descriptionInput === undefined) {
        return; // User cancelled
      }

      newDescription = descriptionInput.trim();
    }

    // Update bookmark
    await bookmarkService.updateBookmark(targetBookmark.id, {
      title: newTitle,
      description: newDescription
    });
    
    vscode.window.showInformationMessage(`Bookmark updated: ${newTitle}`);
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to edit bookmark: ${error.message}`);
  }
}
