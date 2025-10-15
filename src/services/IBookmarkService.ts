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

  // Tag Operations
  getBookmarksByTag(tag: string): Bookmark[];
  getTagGroups(): TagGroup[];
  updateBookmarkTags(id: string, tags: string[]): Promise<Bookmark>;

  // Events
  onBookmarksChanged: vscode.Event<void>;
}
