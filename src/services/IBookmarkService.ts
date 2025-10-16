import * as vscode from 'vscode';
import { Bookmark, TagGroup } from '../models';

export interface IBookmarkService {
  // CRUD Operations
  addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>): Promise<Bookmark>;
  getBookmark(id: string): Bookmark | undefined;
  getAllBookmarks(): Bookmark[];
  updateBookmark(id: string, updates: Partial<Bookmark>): Promise<Bookmark>;
  deleteBookmark(id: string): Promise<void>;
  clearAllBookmarks(): Promise<void>;

  // Search and Filter Operations
  searchBookmarks(query: string): Bookmark[];
  filterBookmarks(options: { tags?: string[], filePath?: string }): Bookmark[];

  // Export/Import Operations
  exportBookmarks(): string;
  importBookmarks(jsonData: string): Promise<number>;

  // Sorting Operations
  sortBookmarks(criteria: 'date' | 'title' | 'file'): Bookmark[];

  // Validation Operations
  validateBookmarks(): Promise<{ valid: Bookmark[], invalid: Bookmark[] }>;

  // Statistics Operations
  getStatistics(): {
    totalBookmarks: number;
    totalTags: number;
    bookmarksPerTag: Record<string, number>;
    bookmarksPerFile: Record<string, number>;
    mostUsedTags: { tag: string; count: number }[];
    createdAt: string;
  };

  // Tag Operations
  getBookmarksByTag(tag: string): Bookmark[];
  getTagGroups(): TagGroup[];
  updateBookmarkTags(id: string, tags: string[]): Promise<Bookmark>;

  // Events
  onBookmarksChanged: vscode.Event<void>;
}