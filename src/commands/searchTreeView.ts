import * as vscode from 'vscode';
import { BookmarkTreeProvider } from '../views/BookmarkTreeProvider';
import { TodoBookmarkTreeProvider } from '../views/TodoBookmarkTreeProvider';

export async function searchTreeViewCommand(
  treeProvider: BookmarkTreeProvider | null, 
  todoTreeProvider: TodoBookmarkTreeProvider | null
): Promise<void> {
  try {
    const viewName = treeProvider ? 'Bookmarks' : 'TODO Bookmarks';
    
    // Get search query from user
    const query = await vscode.window.showInputBox({
      prompt: `Search ${viewName}`,
      placeHolder: 'Search by title, description, file path, or tags'
    });

    if (query === undefined) {
      // User cancelled - clear search
      if (treeProvider) {
        treeProvider.clearSearch();
      }
      if (todoTreeProvider) {
        todoTreeProvider.clearSearch();
      }
      return;
    }

    if (query.trim() === '') {
      // Empty query - clear search
      if (treeProvider) {
        treeProvider.clearSearch();
      }
      if (todoTreeProvider) {
        todoTreeProvider.clearSearch();
      }
      vscode.window.showInformationMessage('Search cleared');
    } else {
      // Set search query for the specific tree provider
      if (treeProvider) {
        treeProvider.setSearchQuery(query);
      }
      if (todoTreeProvider) {
        todoTreeProvider.setSearchQuery(query);
      }
      vscode.window.showInformationMessage(`Searching ${viewName} for: ${query}`);
    }
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to search bookmarks: ${error.message}`);
  }
}