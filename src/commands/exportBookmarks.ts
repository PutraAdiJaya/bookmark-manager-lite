import * as vscode from 'vscode';
import * as fs from 'fs';
import { IBookmarkService } from '../services/IBookmarkService';

export async function exportBookmarksCommand(bookmarkService: IBookmarkService): Promise<void> {
  try {
    // Get file path from user
    const uri = await vscode.window.showSaveDialog({
      filters: { 'JSON': ['json'] },
      saveLabel: 'Export Bookmarks',
      title: 'Export Bookmarks to JSON'
    });

    if (!uri) {
      return; // User cancelled
    }

    // Export bookmarks
    const jsonData = bookmarkService.exportBookmarks();

    // Write to file
    const filePath = uri.fsPath;
    fs.writeFileSync(filePath, jsonData, 'utf8');

    vscode.window.showInformationMessage(`Bookmarks exported successfully to ${filePath}`);
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to export bookmarks: ${error.message}`);
  }
}