import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import { Bookmark, TagGroup } from '../models';
import { IBookmarkService } from './IBookmarkService';
import { IStorageManager } from '../storage/IStorageManager';
import { generateId } from '../utils/idGenerator';
import { getCurrentTimestamp } from '../utils/dateUtils';

export class BookmarkService implements IBookmarkService {
  private bookmarks: Map<string, Bookmark>;
  private tagIndex: Map<string, Set<string>>;
  private fileIndex: Map<string, Set<string>>;
  private _onDidChangeBookmarks: vscode.EventEmitter<void>;

  constructor(private storageManager: IStorageManager) {
    this.bookmarks = new Map();
    this.tagIndex = new Map();
    this.fileIndex = new Map();
    this._onDidChangeBookmarks = new vscode.EventEmitter<void>();
  }

  get onBookmarksChanged(): vscode.Event<void> {
    return this._onDidChangeBookmarks.event;
  }

  async addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>): Promise<Bookmark> {
    const now = getCurrentTimestamp();
    const newBookmark: Bookmark = {
      ...bookmark,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };

    this.bookmarks.set(newBookmark.id, newBookmark);
    this.updateIndexes(newBookmark);
    await this.persistBookmarks();
    this._onDidChangeBookmarks.fire();

    return newBookmark;
  }

  getBookmark(id: string): Bookmark | undefined {
    return this.bookmarks.get(id);
  }

  getAllBookmarks(): Bookmark[] {
    return Array.from(this.bookmarks.values());
  }

  async updateBookmark(id: string, updates: Partial<Bookmark>): Promise<Bookmark> {
    const bookmark = this.bookmarks.get(id);
    if (!bookmark) {
      throw new Error(`Bookmark with id ${id} not found`);
    }

    // Remove from old indexes
    this.removeFromIndexes(bookmark);

    // Update bookmark
    const updatedBookmark: Bookmark = {
      ...bookmark,
      ...updates,
      id: bookmark.id, // Ensure id cannot be changed
      createdAt: bookmark.createdAt, // Ensure createdAt cannot be changed
      updatedAt: getCurrentTimestamp()
    };

    this.bookmarks.set(id, updatedBookmark);
    this.updateIndexes(updatedBookmark);
    await this.persistBookmarks();
    this._onDidChangeBookmarks.fire();

    return updatedBookmark;
  }

  async deleteBookmark(id: string): Promise<void> {
    const bookmark = this.bookmarks.get(id);
    if (!bookmark) {
      throw new Error(`Bookmark with id ${id} not found`);
    }

    this.removeFromIndexes(bookmark);
    this.bookmarks.delete(id);
    await this.persistBookmarks();
    this._onDidChangeBookmarks.fire();
  }

  async clearAllBookmarks(): Promise<void> {
    this.bookmarks.clear();
    this.tagIndex.clear();
    this.fileIndex.clear();
    await this.persistBookmarks();
    this._onDidChangeBookmarks.fire();
  }

  getBookmarksByTag(tag: string): Bookmark[] {
    const bookmarkIds = this.tagIndex.get(tag);
    if (!bookmarkIds) {
      return [];
    }

    const bookmarks: Bookmark[] = [];
    for (const id of bookmarkIds) {
      const bookmark = this.bookmarks.get(id);
      if (bookmark) {
        bookmarks.push(bookmark);
      }
    }
    return bookmarks;
  }

  getTagGroups(): TagGroup[] {
    const groups: TagGroup[] = [];

    for (const [tag, bookmarkIds] of this.tagIndex.entries()) {
      const bookmarks: Bookmark[] = [];
      for (const id of bookmarkIds) {
        const bookmark = this.bookmarks.get(id);
        if (bookmark) {
          bookmarks.push(bookmark);
        }
      }

      if (bookmarks.length > 0) {
        groups.push({
          tag,
          bookmarks,
          count: bookmarks.length
        });
      }
    }

    return groups;
  }

  async updateBookmarkTags(id: string, tags: string[]): Promise<Bookmark> {
    return this.updateBookmark(id, { tags });
  }

  // Add search functionality
  searchBookmarks(query: string): Bookmark[] {
    if (!query || query.trim() === '') {
      return this.getAllBookmarks();
    }

    const searchTerm = query.toLowerCase().trim();
    return this.getAllBookmarks().filter(bookmark => 
      bookmark.title.toLowerCase().includes(searchTerm) ||
      bookmark.description.toLowerCase().includes(searchTerm) ||
      bookmark.filePath.toLowerCase().includes(searchTerm) ||
      bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Export bookmarks to JSON string
  exportBookmarks(): string {
    const bookmarks = this.getAllBookmarks();
    const data = {
      bookmarks: bookmarks,
      metadata: {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        totalBookmarks: bookmarks.length
      }
    };
    return JSON.stringify(data, null, 2);
  }

  // Import bookmarks from JSON string
  async importBookmarks(jsonData: string): Promise<number> {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.bookmarks || !Array.isArray(data.bookmarks)) {
        throw new Error('Invalid data format: missing bookmarks array');
      }

      let importedCount = 0;
      
      // Import each bookmark
      for (const bookmarkData of data.bookmarks) {
        // Validate required fields
        if (!bookmarkData.title || !bookmarkData.filePath) {
          continue; // Skip invalid bookmarks
        }

        try {
          // Check if bookmark already exists
          const existingBookmark = Array.from(this.bookmarks.values()).find(
            b => b.filePath === bookmarkData.filePath && 
                 b.line === bookmarkData.line && 
                 b.column === bookmarkData.column
          );

          if (!existingBookmark) {
            // Add new bookmark
            await this.addBookmark({
              title: bookmarkData.title,
              description: bookmarkData.description || '',
              filePath: bookmarkData.filePath,
              line: bookmarkData.line,
              column: bookmarkData.column,
              tags: bookmarkData.tags || []
            });
            importedCount++;
          }
        } catch (error) {
          // Skip individual bookmark errors
          console.warn('Failed to import bookmark:', error);
        }
      }

      return importedCount;
    } catch (error: any) {
      throw new Error(`Failed to import bookmarks: ${error.message}`);
    }
  }

  // Sort bookmarks by different criteria
  sortBookmarks(criteria: 'date' | 'title' | 'file'): Bookmark[] {
    const bookmarks = this.getAllBookmarks();
    
    switch (criteria) {
      case 'date':
        return bookmarks.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'title':
        return bookmarks.sort((a, b) => 
          a.title.localeCompare(b.title)
        );
      case 'file':
        return bookmarks.sort((a, b) => {
          const fileComparison = a.filePath.localeCompare(b.filePath);
          if (fileComparison !== 0) {
            return fileComparison;
          }
          // If same file, sort by line number
          return a.line - b.line;
        });
      default:
        return bookmarks;
    }
  }

  // Filter bookmarks by tags or file paths
  filterBookmarks(options: { tags?: string[], filePath?: string }): Bookmark[] {
    let bookmarks = this.getAllBookmarks();
    
    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      bookmarks = bookmarks.filter(bookmark => 
        options.tags!.some(tag => 
          bookmark.tags.includes(tag) || (tag === 'untagged' && bookmark.tags.length === 0)
        )
      );
    }
    
    // Filter by file path
    if (options.filePath) {
      const normalizedPath = options.filePath.toLowerCase();
      bookmarks = bookmarks.filter(bookmark => 
        bookmark.filePath.toLowerCase().includes(normalizedPath)
      );
    }
    
    return bookmarks;
  }

  // Validate bookmarks to ensure file paths still exist
  async validateBookmarks(): Promise<{ valid: Bookmark[], invalid: Bookmark[] }> {
    const allBookmarks = this.getAllBookmarks();
    const valid: Bookmark[] = [];
    const invalid: Bookmark[] = [];

    for (const bookmark of allBookmarks) {
      try {
        // Check if file exists
        await fs.access(bookmark.filePath);
        valid.push(bookmark);
      } catch {
        invalid.push(bookmark);
      }
    }

    return { valid, invalid };
  }

  // Get bookmark statistics
  getStatistics(): {
    totalBookmarks: number;
    totalTags: number;
    bookmarksPerTag: Record<string, number>;
    bookmarksPerFile: Record<string, number>;
    mostUsedTags: { tag: string; count: number }[];
    createdAt: string;
  } {
    const bookmarks = this.getAllBookmarks();
    const tagCounts: Record<string, number> = {};
    const fileCounts: Record<string, number> = {};
    
    // Count tags and files
    for (const bookmark of bookmarks) {
      // Count files
      fileCounts[bookmark.filePath] = (fileCounts[bookmark.filePath] || 0) + 1;
      
      // Count tags
      if (bookmark.tags.length === 0) {
        tagCounts['untagged'] = (tagCounts['untagged'] || 0) + 1;
      } else {
        for (const tag of bookmark.tags) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      }
    }
    
    // Get most used tags
    const mostUsedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 tags
    
    return {
      totalBookmarks: bookmarks.length,
      totalTags: Object.keys(tagCounts).length,
      bookmarksPerTag: tagCounts,
      bookmarksPerFile: fileCounts,
      mostUsedTags,
      createdAt: new Date().toISOString()
    };
  }

  async initialize(): Promise<void> {
    const data = await this.storageManager.load();
    this.bookmarks.clear();
    this.tagIndex.clear();
    this.fileIndex.clear();

    for (const bookmark of data.bookmarks) {
      this.bookmarks.set(bookmark.id, bookmark);
      this.updateIndexes(bookmark);
    }
  }

  private updateIndexes(bookmark: Bookmark): void {
    // Update tag index
    if (bookmark.tags.length === 0) {
      if (!this.tagIndex.has('untagged')) {
        this.tagIndex.set('untagged', new Set());
      }
      this.tagIndex.get('untagged')!.add(bookmark.id);
    } else {
      for (const tag of bookmark.tags) {
        if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, new Set());
        }
        this.tagIndex.get(tag)!.add(bookmark.id);
      }
    }

    // Update file index
    if (!this.fileIndex.has(bookmark.filePath)) {
      this.fileIndex.set(bookmark.filePath, new Set());
    }
    this.fileIndex.get(bookmark.filePath)!.add(bookmark.id);
  }

  private removeFromIndexes(bookmark: Bookmark): void {
    // Remove from tag index
    if (bookmark.tags.length === 0) {
      this.tagIndex.get('untagged')?.delete(bookmark.id);
    } else {
      for (const tag of bookmark.tags) {
        this.tagIndex.get(tag)?.delete(bookmark.id);
      }
    }

    // Remove from file index
    this.fileIndex.get(bookmark.filePath)?.delete(bookmark.id);
  }

  private async persistBookmarks(): Promise<void> {
    const bookmarksArray = Array.from(this.bookmarks.values());
    await this.storageManager.save({
      bookmarks: bookmarksArray,
      metadata: {
        version: '1.0.0',
        workspacePath: '',
        totalBookmarks: bookmarksArray.length,
        lastModified: getCurrentTimestamp()
      }
    });
  }
}
