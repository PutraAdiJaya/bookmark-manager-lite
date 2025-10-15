import * as vscode from 'vscode';
import { Bookmark, TagGroup } from '../models';

export class BookmarkTreeItem extends vscode.TreeItem {
  constructor(
    public readonly bookmark: Bookmark,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(bookmark.title, collapsibleState);
    this.tooltip = `${bookmark.filePath}:${bookmark.line + 1}`;
    this.description = `Line ${bookmark.line + 1}`;
    this.iconPath = new vscode.ThemeIcon('bookmark');
    this.contextValue = 'bookmark';
    this.command = {
      command: 'bookmarkLite.open',
      title: 'Open Bookmark',
      arguments: [bookmark]
    };
  }
}

export class TagGroupTreeItem extends vscode.TreeItem {
  constructor(
    public readonly tagGroup: TagGroup,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(tagGroup.tag, collapsibleState);
    this.description = `(${tagGroup.count})`;
    this.iconPath = new vscode.ThemeIcon('folder');
    this.contextValue = 'tagGroup';
  }
}
