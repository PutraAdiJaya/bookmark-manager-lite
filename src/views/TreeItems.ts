import * as vscode from 'vscode';
import { Bookmark, TagGroup } from '../models';

export class BookmarkTreeItem extends vscode.TreeItem {
  constructor(
    public readonly bookmark: Bookmark,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly number?: number | string,
    public readonly numberedIcon?: string
  ) {
    // Add number prefix to title if provided
    const displayTitle = number ? `${number}. ${bookmark.title}` : bookmark.title;
    super(displayTitle, collapsibleState);
    
    this.tooltip = `${bookmark.filePath}:${bookmark.line + 1}`;
    this.description = `Line ${bookmark.line + 1}`;
    
    // Use numbered icon if provided, otherwise use default
    if (numberedIcon) {
      this.iconPath = vscode.Uri.parse(numberedIcon);
    } else {
      this.iconPath = new vscode.ThemeIcon('bookmark');
    }
    
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
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly tagCode?: string,
    public readonly tagIcon?: string
  ) {
    super(tagGroup.tag, collapsibleState);
    this.description = `(${tagGroup.count})`;
    
    // Use custom colored icon if provided, otherwise use default folder icon
    if (tagIcon) {
      this.iconPath = vscode.Uri.parse(tagIcon);
    } else {
      this.iconPath = new vscode.ThemeIcon('folder');
    }
    
    this.contextValue = 'tagGroup';
  }
}