import * as vscode from 'vscode';
import { Bookmark } from '../models';
import { IBookmarkService } from '../services/IBookmarkService';
import { getAbsolutePath } from '../utils/pathUtils';
import { BookmarkTreeItem } from '../views/TreeItems';

export async function openBookmarkCommand(
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
        detail: bm.description,
        bookmark: bm
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a bookmark to open'
      });

      if (!selected) {
        return; // User cancelled
      }

      targetBookmark = selected.bookmark;
    }

    // Validate that we have a bookmark with required properties
    if (!targetBookmark || !targetBookmark.filePath) {
      vscode.window.showErrorMessage('Invalid bookmark selected');
      return;
    }

    // Get workspace root
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('No workspace folder open');
      return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const absolutePath = getAbsolutePath(targetBookmark.filePath, workspaceRoot);
    const uri = vscode.Uri.file(absolutePath);

    // Open document
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);

    // Move cursor to bookmark position
    const position = new vscode.Position(targetBookmark.line, targetBookmark.column);
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(
      new vscode.Range(position, position),
      vscode.TextEditorRevealType.InCenter
    );
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to open bookmark: ${error.message}`);
  }
}