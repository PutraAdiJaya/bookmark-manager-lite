import * as vscode from 'vscode';
import { Bookmark } from '../models';
import { IBookmarkService } from '../services/IBookmarkService';
import { getAbsolutePath } from '../utils/pathUtils';

export async function openBookmarkCommand(
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
        placeHolder: 'Select a bookmark to open'
      });

      if (!selected) {
        return; // User cancelled
      }

      targetBookmark = selected.bookmark;
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
    if (error.code === 'ENOENT') {
      vscode.window.showErrorMessage(`Cannot open bookmark: File not found at ${bookmark?.filePath}`);
    } else {
      vscode.window.showErrorMessage(`Failed to open bookmark: ${error.message}`);
    }
  }
}
