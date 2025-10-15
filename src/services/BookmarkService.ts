import * as vscode from 'vscode';
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
