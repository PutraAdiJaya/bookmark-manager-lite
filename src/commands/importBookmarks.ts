import * as vscode from 'vscode';
import * as fs from 'fs';
import { IBookmarkService } from '../services/IBookmarkService';

export async function importBookmarksCommand(bookmarkService: IBookmarkService): Promise<void> {
  try {
    // Get file path from user
    const uri = await vscode.window.showOpenDialog({
      filters: { 'JSON': ['json'] },
      openLabel: 'Import Bookmarks',
      title: 'Import Bookmarks from JSON',
      canSelectMany: false
    });

    if (!uri || uri.length === 0) {
      return; // User cancelled
    }

    const filePath = uri[0].fsPath;

    // Read file content
    const jsonData = fs.readFileSync(filePath, 'utf8');

    // Import bookmarks
    const importedCount = await bookmarkService.importBookmarks(jsonData);

    vscode.window.showInformationMessage(`Successfully imported ${importedCount} bookmark(s) from ${filePath}`);
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to import bookmarks: ${error.message}`);
  }
}