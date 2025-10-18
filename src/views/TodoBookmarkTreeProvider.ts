import * as vscode from 'vscode';
import { IBookmarkService } from '../services/IBookmarkService';
import { BookmarkTreeItem, TagGroupTreeItem } from './TreeItems';
import { TodoIconGenerator } from '../utils/TodoIconGenerator';
import { TagIconGenerator } from '../utils/TagIconGenerator';

export class TodoBookmarkTreeProvider implements vscode.TreeDataProvider<BookmarkTreeItem | TagGroupTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<BookmarkTreeItem | TagGroupTreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private searchQuery = '';
  private tagCodeMap: Map<string, string> = new Map();
  private nextCodeIndex = 0;
  private todoIconGenerator: TodoIconGenerator;
  private tagIconGenerator: TagIconGenerator;

  constructor(private bookmarkService: IBookmarkService) {
    this.todoIconGenerator = new TodoIconGenerator();
    this.tagIconGenerator = new TagIconGenerator();
    bookmarkService.onBookmarksChanged(() => this.refresh());
    
    vscode.window.onDidChangeActiveColorTheme(() => {
      this.todoIconGenerator.clearCache();
      this.tagIconGenerator.clearCache();
      this.refresh();
    });
  }

  refresh(): void {
    this.tagCodeMap.clear();
    this.nextCodeIndex = 0;
    this._onDidChangeTreeData.fire();
  }

  setSearchQuery(query: string): void {
    this.searchQuery = query.toLowerCase().trim();
    this.refresh();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.refresh();
  }

  getTreeItem(element: BookmarkTreeItem | TagGroupTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TagGroupTreeItem): Thenable<(BookmarkTreeItem | TagGroupTreeItem)[]> {
    if (!element) {
      // Root level - filter for TODO bookmarks only
      const allBookmarks = this.bookmarkService.getAllBookmarks();
      const todoBookmarks = allBookmarks.filter(bookmark => 
        bookmark.tags.some(tag => tag.toLowerCase() === 'todo')
      );

      if (this.searchQuery) {
        // Search mode - return filtered TODO bookmarks
        const filteredBookmarks = todoBookmarks.filter(bookmark => 
          bookmark.title.toLowerCase().includes(this.searchQuery) ||
          bookmark.description.toLowerCase().includes(this.searchQuery) ||
          bookmark.filePath.toLowerCase().includes(this.searchQuery)
        );
        
        const theme = this.getCurrentTheme();
        
        return Promise.resolve(
          filteredBookmarks.map((bookmark, index) => {
            const number = index + 1;
            const icon = this.todoIconGenerator.generateTodoIcon({
              number,
              theme
            });
            
            return new BookmarkTreeItem(
              bookmark,
              vscode.TreeItemCollapsibleState.None,
              number,
              icon.toString()
            );
          })
        );
      } else {
        // Normal mode - return TODO tag groups
        const tagGroups = this.bookmarkService.getTagGroups().filter(
          group => group.tag.toLowerCase() === 'todo'
        );
        
        tagGroups.forEach(group => {
          if (!this.tagCodeMap.has(group.tag)) {
            this.tagCodeMap.set(group.tag, this.getNextTagCode());
          }
        });
        
        const theme = this.getCurrentTheme();
        
        return Promise.resolve(
          tagGroups.map(group => {
            const tagCode = this.tagCodeMap.get(group.tag) || 'A';
            const tagIcon = this.todoIconGenerator.generateTodoTagIcon(tagCode, theme);
            return new TagGroupTreeItem(
              group, 
              vscode.TreeItemCollapsibleState.Expanded,
              tagCode,
              tagIcon.toString()
            );
          })
        );
      }
    } else {
      // Tag group level - return bookmarks
      const bookmarks = this.bookmarkService.getBookmarksByTag(element.tagGroup.tag);
      const tagCode = this.tagCodeMap.get(element.tagGroup.tag) || this.generateTagCode(element.tagGroup.tag);
      const theme = this.getCurrentTheme();
      
      if (this.searchQuery) {
        const filteredBookmarks = bookmarks.filter(bookmark => 
          bookmark.title.toLowerCase().includes(this.searchQuery) ||
          bookmark.description.toLowerCase().includes(this.searchQuery) ||
          bookmark.filePath.toLowerCase().includes(this.searchQuery)
        );
        
        const numberedBookmarks = filteredBookmarks.map((bookmark, index) => {
          const number = index + 1;
          const displayNumber = `${tagCode}${number}`;
          const icon = this.todoIconGenerator.generateTodoIcon({
            number,
            theme
          });
          
          return new BookmarkTreeItem(
            bookmark,
            vscode.TreeItemCollapsibleState.None,
            displayNumber,
            icon.toString()
          );
        });
        
        return Promise.resolve(numberedBookmarks);
      } else {
        const numberedBookmarks = bookmarks.map((bookmark, index) => {
          const number = index + 1;
          const displayNumber = `${tagCode}${number}`;
          const icon = this.todoIconGenerator.generateTodoIcon({
            number,
            theme
          });
          
          return new BookmarkTreeItem(
            bookmark,
            vscode.TreeItemCollapsibleState.None,
            displayNumber,
            icon.toString()
          );
        });
        
        return Promise.resolve(numberedBookmarks);
      }
    }
  }
  
  private getNextTagCode(): string {
    let code = '';
    let index = this.nextCodeIndex;
    
    while (index >= 0) {
      code = String.fromCharCode(65 + (index % 26)) + code;
      index = Math.floor(index / 26) - 1;
    }
    
    this.nextCodeIndex++;
    return code;
  }
  
  private generateTagCode(tag: string): string {
    if (tag === 'untagged') {
      return 'A';
    }
    return tag.charAt(0).toUpperCase();
  }
  
  private getCurrentTheme(): 'light' | 'dark' {
    const theme = vscode.window.activeColorTheme.kind;
    return theme === vscode.ColorThemeKind.Light ? 'light' : 'dark';
  }
}
