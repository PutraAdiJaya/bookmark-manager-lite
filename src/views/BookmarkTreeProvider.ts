import * as vscode from 'vscode';
import { IBookmarkService } from '../services/IBookmarkService';
import { BookmarkTreeItem, TagGroupTreeItem } from './TreeItems';
import { IconGenerator } from '../utils/IconGenerator';
import { TagIconGenerator } from '../utils/TagIconGenerator';

export class BookmarkTreeProvider implements vscode.TreeDataProvider<BookmarkTreeItem | TagGroupTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<BookmarkTreeItem | TagGroupTreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private searchQuery = '';
  private tagCodeMap: Map<string, string> = new Map();
  private nextCodeIndex = 0;
  private iconGenerator: IconGenerator;
  private tagIconGenerator: TagIconGenerator;

  constructor(private bookmarkService: IBookmarkService) {
    this.iconGenerator = new IconGenerator();
    this.tagIconGenerator = new TagIconGenerator();
    bookmarkService.onBookmarksChanged(() => this.refresh());
    
    // Listen to theme changes and refresh icons
    vscode.window.onDidChangeActiveColorTheme(() => {
      this.iconGenerator.clearCache();
      this.tagIconGenerator.clearCache();
      this.refresh();
    });
  }

  refresh(): void {
    // Reset the tag code map and index when refreshing
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
      // Root level - return tag groups
      if (this.searchQuery) {
        // Search mode - return filtered bookmarks directly using substring matching
        const allBookmarks = this.bookmarkService.getAllBookmarks();
        const filteredBookmarks = allBookmarks.filter(bookmark => 
          bookmark.title.toLowerCase().includes(this.searchQuery) ||
          bookmark.description.toLowerCase().includes(this.searchQuery) ||
          bookmark.filePath.toLowerCase().includes(this.searchQuery) ||
          bookmark.tags.some(tag => tag.toLowerCase().includes(this.searchQuery))
        );
        
        const theme = this.getCurrentTheme();
        
        // Return bookmarks as tree items with numbering
        return Promise.resolve(
          filteredBookmarks.map((bookmark, index) => {
            const number = index + 1;
            
            // Generate numbered icon
            const icon = this.iconGenerator.generateNumberedIcon({
              number,
              theme
            });
            
            return new BookmarkTreeItem(
              bookmark,
              vscode.TreeItemCollapsibleState.None,
              number,
              icon
            );
          })
        );
      } else {
        // Normal mode - return tag groups
        const tagGroups = this.bookmarkService.getTagGroups();
        
        // Assign unique codes to each tag group
        tagGroups.forEach(group => {
          if (!this.tagCodeMap.has(group.tag)) {
            this.tagCodeMap.set(group.tag, this.getNextTagCode());
          }
        });
        
        return Promise.resolve(
          tagGroups.map(group => {
            const tagCode = this.tagCodeMap.get(group.tag) || 'A';
            const tagIcon = this.tagIconGenerator.generateTagIcon(tagCode);
            return new TagGroupTreeItem(
              group, 
              vscode.TreeItemCollapsibleState.Expanded,
              tagCode,
              tagIcon
            );
          })
        );
      }
    } else {
      // Tag group level - return bookmarks with numbering based on tag
      const bookmarks = this.bookmarkService.getBookmarksByTag(element.tagGroup.tag);
      
      // Get the letter code for this tag group
      const tagCode = this.tagCodeMap.get(element.tagGroup.tag) || this.generateTagCode(element.tagGroup.tag);
      
      const theme = this.getCurrentTheme();
      
      if (this.searchQuery) {
        // Filter bookmarks based on search query using substring matching
        const filteredBookmarks = bookmarks.filter(bookmark => 
          bookmark.title.toLowerCase().includes(this.searchQuery) ||
          bookmark.description.toLowerCase().includes(this.searchQuery) ||
          bookmark.filePath.toLowerCase().includes(this.searchQuery) ||
          bookmark.tags.some(tag => tag.toLowerCase().includes(this.searchQuery))
        );
        
        // Add tag-based numbering to bookmarks with numbered icons
        const numberedBookmarks = filteredBookmarks.map((bookmark, index) => {
          const number = index + 1;
          const displayNumber = `${tagCode}${number}`;
          
          // Generate numbered icon with tag-specific color
          const icon = this.iconGenerator.generateNumberedIcon({
            number,
            theme,
            tagCode
          });
          
          return new BookmarkTreeItem(
            bookmark,
            vscode.TreeItemCollapsibleState.None,
            displayNumber,
            icon
          );
        });
        
        return Promise.resolve(numberedBookmarks);
      } else {
        // Return all bookmarks in the group with tag-based numbering and icons
        const numberedBookmarks = bookmarks.map((bookmark, index) => {
          const number = index + 1;
          const displayNumber = `${tagCode}${number}`;
          
          // Generate numbered icon with tag-specific color
          const icon = this.iconGenerator.generateNumberedIcon({
            number,
            theme,
            tagCode
          });
          
          return new BookmarkTreeItem(
            bookmark,
            vscode.TreeItemCollapsibleState.None,
            displayNumber,
            icon
          );
        });
        
        return Promise.resolve(numberedBookmarks);
      }
    }
  }
  
  // Generate a unique sequential letter code for a tag group
  // Supports: A-Z (26), then AA-AZ (26), BA-BZ (26), etc. like Excel columns
  private getNextTagCode(): string {
    let code = '';
    let index = this.nextCodeIndex;
    
    // Convert index to Excel-style column letters
    while (index >= 0) {
      code = String.fromCharCode(65 + (index % 26)) + code;
      index = Math.floor(index / 26) - 1;
    }
    
    this.nextCodeIndex++;
    return code;
  }
  
  // Fallback method to generate a code for a tag (first letter of tag or 'A' for untagged)
  private generateTagCode(tag: string): string {
    if (tag === 'untagged') {
      return 'A';
    }
    
    // Get first letter and convert to uppercase
    return tag.charAt(0).toUpperCase();
  }
  
  // Get current VS Code theme (light or dark)
  private getCurrentTheme(): 'light' | 'dark' {
    const theme = vscode.window.activeColorTheme.kind;
    return theme === vscode.ColorThemeKind.Light ? 'light' : 'dark';
  }
}