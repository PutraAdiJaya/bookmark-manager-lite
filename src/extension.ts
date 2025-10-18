import * as vscode from "vscode";
import { StorageManager } from "./storage/StorageManager";
import { BookmarkService } from "./services/BookmarkService";
import { BookmarkTreeProvider } from "./views/BookmarkTreeProvider";
import { TodoBookmarkTreeProvider } from "./views/TodoBookmarkTreeProvider";
import { DecorationManager } from "./decorations/DecorationManager";
import { addBookmarkCommand } from "./commands/addBookmark";
import { addBookmarkWithTagsCommand } from "./commands/addBookmarkWithTags";
import { openBookmarkCommand } from "./commands/openBookmark";
import { removeBookmarkCommand } from "./commands/removeBookmark";
import { editBookmarkTagsCommand } from "./commands/editBookmarkTags";
import { editBookmarkDetailsCommand } from "./commands/editBookmarkDetails";
import { clearAllBookmarksCommand } from "./commands/clearAllBookmarks";
import {
  collapseAllCommand,
  expandAllCommand,
} from "./commands/collapseExpandAll";
import { searchBookmarksCommand } from "./commands/searchBookmarks";
import { exportBookmarksCommand } from "./commands/exportBookmarks";
import { importBookmarksCommand } from "./commands/importBookmarks";
import { validateBookmarksCommand } from "./commands/validateBookmarks";
import { showStatisticsCommand } from "./commands/showStatistics";
import { searchTreeViewCommand } from "./commands/searchTreeView";
import { toggleBookmarkCommand } from "./commands/toggleBookmark";
import { addTodoBookmarkCommand } from "./commands/addTodoBookmark";

export async function activate(context: vscode.ExtensionContext) {
  // Get workspace root
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showWarningMessage(
      "Bookmark Manager Lite requires a workspace to be opened"
    );
    return;
  }

  const workspaceRoot = workspaceFolders[0].uri.fsPath;

  // Initialize services
  const storageManager = new StorageManager(workspaceRoot);
  const bookmarkService = new BookmarkService(storageManager);

  // Initialize bookmark service (load bookmarks from storage)
  await bookmarkService.initialize();

  // Register TreeView Providers
  const treeProvider = new BookmarkTreeProvider(bookmarkService);
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("bookmarkExplorer", treeProvider)
  );

  const todoTreeProvider = new TodoBookmarkTreeProvider(bookmarkService);
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("bookmarkTodoExplorer", todoTreeProvider)
  );

  // Initialize DecorationManager
  const decorationManager = new DecorationManager(bookmarkService);
  context.subscriptions.push(decorationManager);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("bookmarkLite.add", () =>
      addBookmarkCommand(bookmarkService)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("bookmarkLite.addWithTags", () =>
      addBookmarkWithTagsCommand(bookmarkService)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("bookmarkLite.open", (bookmark) =>
      openBookmarkCommand(bookmarkService, bookmark)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("bookmarkLite.remove", (bookmark) =>
      removeBookmarkCommand(bookmarkService, bookmark)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("bookmarkLite.editTags", (bookmark) =>
      editBookmarkTagsCommand(bookmarkService, bookmark)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("bookmarkLite.editDetails", (bookmark) =>
      editBookmarkDetailsCommand(bookmarkService, bookmark)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("bookmarkLite.clearAll", () =>
      clearAllBookmarksCommand(bookmarkService)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("bookmarkLite.collapseAll", () =>
      collapseAllCommand()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("bookmarkLite.expandAll", () =>
      expandAllCommand()
    )
  );

  // Register search command
  context.subscriptions.push(
    vscode.commands.registerCommand("bookmarkLite.search", () =>
      searchBookmarksCommand(bookmarkService)
    )
  );

  // Register search tree view commands
  context.subscriptions.push(
    vscode.commands.registerCommand("bookmarkLite.searchTreeView", () =>
      searchTreeViewCommand(treeProvider, null)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("bookmarkLite.searchTodoTreeView", () =>
      searchTreeViewCommand(null, todoTreeProvider)
    )
  );

  // Register toggle bookmark commands
  context.subscriptions.push(
    vscode.commands.registerCommand("bookmarkLite.toggleBookmark", () =>
      toggleBookmarkCommand(bookmarkService, 'bookmarkExplorer')
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("bookmarkLite.toggleTodoBookmark", () =>
      toggleBookmarkCommand(bookmarkService, 'bookmarkTodoExplorer')
    )
  );

  // Register add TODO bookmark command
  context.subscriptions.push(
    vscode.commands.registerCommand("bookmarkLite.addTodo", () =>
      addTodoBookmarkCommand(bookmarkService)
    )
  );

  // Register export/import commands
  context.subscriptions.push(
    vscode.commands.registerCommand("bookmarkLite.export", () =>
      exportBookmarksCommand(bookmarkService)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("bookmarkLite.import", () =>
      importBookmarksCommand(bookmarkService)
    )
  );

  // Register validate command
  context.subscriptions.push(
    vscode.commands.registerCommand("bookmarkLite.validate", () =>
      validateBookmarksCommand(bookmarkService)
    )
  );

  // Register statistics command
  context.subscriptions.push(
    vscode.commands.registerCommand("bookmarkLite.statistics", () =>
      showStatisticsCommand(bookmarkService)
    )
  );
}

export function deactivate() {
  // Disposables are automatically disposed by VS Code
}
