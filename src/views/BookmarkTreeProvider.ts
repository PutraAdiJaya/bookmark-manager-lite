import * as vscode from 'vscode';
import { IBookmarkService } from '../services/IBookmarkService';
import { BookmarkTreeItem, TagGroupTreeItem } from './TreeItems';

export class BookmarkTreeProvider implements vscode.TreeDataProvider<BookmarkTreeItem | TagGroupTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<BookmarkTreeItem | TagGroupTreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private bookmarkService: IBookmarkService) {
    bookmarkService.onBookmarksChanged(() => this.refresh());
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: BookmarkTreeItem | TagGroupTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TagGroupTreeItem): Thenable<(BookmarkTreeItem | TagGroupTreeItem)[]> {
    if (!element) {
      // Root level - return tag groups
      const tagGroups = this.bookmarkService.getTagGroups();
      return Promise.resolve(
        tagGroups.map(group => new TagGroupTreeItem(group, vscode.TreeItemCollapsibleState.Expanded))
      );
    } else {
      // Tag group level - return bookmarks
      const bookmarks = this.bookmarkService.getBookmarksByTag(element.tagGroup.tag);
      return Promise.resolve(
        bookmarks.map(bookmark => new BookmarkTreeItem(bookmark, vscode.TreeItemCollapsibleState.None))
      );
    }
  }
}
