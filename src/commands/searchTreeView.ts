import * as vscode from 'vscode';
import { BookmarkTreeProvider } from '../views/BookmarkTreeProvider';

export async function searchTreeViewCommand(treeProvider: BookmarkTreeProvider): Promise<void> {
  try {
    // Get search query from user
    const query = await vscode.window.showInputBox({
      prompt: 'Enter search term',
      placeHolder: 'Search by title, description, file path, or tags'
    });

    if (query === undefined) {
      // User cancelled - clear search
      treeProvider.clearSearch();
      return;
    }

    if (query.trim() === '') {
      // Empty query - clear search
      treeProvider.clearSearch();
      vscode.window.showInformationMessage('Search cleared');
    } else {
      // Set search query
      treeProvider.setSearchQuery(query);
      vscode.window.showInformationMessage(`Searching for: ${query}`);
    }
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to search bookmarks: ${error.message}`);
  }
}