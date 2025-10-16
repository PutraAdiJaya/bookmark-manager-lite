import * as vscode from "vscode";
import { StorageManager } from "./storage/StorageManager";
import { BookmarkService } from "./services/BookmarkService";
import { BookmarkTreeProvider } from "./views/BookmarkTreeProvider";
import { DecorationManager } from "./decorations/DecorationManager";
import { addBookmarkCommand } from "./commands/addBookmark";
import { addBookmarkWithTagsCommand } from "./commands/addBookmarkWithTags";
import { openBookmarkCommand } from "./commands/openBookmark";
import { removeBookmarkCommand } from "./commands/removeBookmark";
import { editBookmarkTagsCommand } from "./commands/editBookmarkTags";
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

  // Register TreeView Provider
  const treeProvider = new BookmarkTreeProvider(bookmarkService);
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("bookmarkExplorer", treeProvider)
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

  // Register search tree view command
  context.subscriptions.push(
    vscode.commands.registerCommand("bookmarkLite.searchTreeView", () =>
      searchTreeViewCommand(treeProvider)
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
