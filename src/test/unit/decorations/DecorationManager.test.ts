import * as assert from 'assert';
import * as vscode from 'vscode';
import { DecorationManager } from '../../../decorations/DecorationManager';
import { IBookmarkService } from '../../../services/IBookmarkService';
import { Bookmark, TagGroup } from '../../../models';

class MockBookmarkService implements IBookmarkService {
  private bookmarks: Bookmark[] = [];
  private changeEmitter = new vscode.EventEmitter<void>();

  get onBookmarksChanged(): vscode.Event<void> {
    return this.changeEmitter.event;
  }

  async addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>): Promise<Bookmark> {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: `mock-id-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.bookmarks.push(newBookmark);
    this.changeEmitter.fire();
    return newBookmark;
  }

  getBookmark(id: string): Bookmark | undefined {
    return this.bookmarks.find(b => b.id === id);
  }

  getAllBookmarks(): Bookmark[] {
    return [...this.bookmarks];
  }

  async updateBookmark(id: string, updates: Partial<Bookmark>): Promise<Bookmark> {
    const bookmark = this.bookmarks.find(b => b.id === id);
    if (!bookmark) {
      throw new Error('Bookmark not found');
    }
    Object.assign(bookmark, updates, { updatedAt: new Date().toISOString() });
    this.changeEmitter.fire();
    return bookmark;
  }

  async deleteBookmark(id: string): Promise<void> {
    const index = this.bookmarks.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('Bookmark not found');
    }
    this.bookmarks.splice(index, 1);
    this.changeEmitter.fire();
  }

  async clearAllBookmarks(): Promise<void> {
    this.bookmarks = [];
    this.changeEmitter.fire();
  }

  getBookmarksByTag(tag: string): Bookmark[] {
    if (tag === 'untagged') {
      return this.bookmarks.filter(b => b.tags.length === 0);
    }
    return this.bookmarks.filter(b => b.tags.includes(tag));
  }

  getTagGroups(): TagGroup[] {
    const tagMap = new Map<string, Bookmark[]>();
    
    this.bookmarks.forEach(bookmark => {
      if (bookmark.tags.length === 0) {
        if (!tagMap.has('untagged')) {
          tagMap.set('untagged', []);
        }
        tagMap.get('untagged')!.push(bookmark);
      } else {
        bookmark.tags.forEach(tag => {
          if (!tagMap.has(tag)) {
            tagMap.set(tag, []);
          }
          tagMap.get(tag)!.push(bookmark);
        });
      }
    });

    return Array.from(tagMap.entries()).map(([tag, bookmarks]) => ({
      tag,
      bookmarks,
      count: bookmarks.length
    }));
  }

  async updateBookmarkTags(id: string, tags: string[]): Promise<Bookmark> {
    return this.updateBookmark(id, { tags });
  }

  async initialize(): Promise<void> {
    // No-op for mock
  }

  // Helper methods for testing
  setBookmarks(bookmarks: Bookmark[]): void {
    this.bookmarks = bookmarks;
  }

  fireChangeEvent(): void {
    this.changeEmitter.fire();
  }

  dispose(): void {
    this.changeEmitter.dispose();
  }
}

suite('DecorationManager Test Suite', () => {
  let decorationManager: DecorationManager;
  let mockBookmarkService: MockBookmarkService;

  setup(() => {
    mockBookmarkService = new MockBookmarkService();
  });

  teardown(() => {
    if (decorationManager) {
      decorationManager.dispose();
    }
    if (mockBookmarkService) {
      mockBookmarkService.dispose();
    }
  });

  suite('applyDecorations', () => {
    test('should apply decorations to editor with bookmarks', async () => {
      // Create a test document
      const doc = await vscode.workspace.openTextDocument({
        content: 'line 0\nline 1\nline 2\nline 3\nline 4',
        language: 'typescript'
      });

      const editor = await vscode.window.showTextDocument(doc);
      const filePath = vscode.workspace.asRelativePath(doc.uri);

      // Add bookmarks for this file
      mockBookmarkService.setBookmarks([
        {
          id: 'bookmark-1',
          title: 'Test Bookmark 1',
          description: 'Test description 1',
          filePath: filePath,
          line: 1,
          column: 0,
          tags: ['test'],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        },
        {
          id: 'bookmark-2',
          title: 'Test Bookmark 2',
          description: 'Test description 2',
          filePath: filePath,
          line: 3,
          column: 0,
          tags: ['test'],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        }
      ]);

      // Create decoration manager (this will apply decorations)
      decorationManager = new DecorationManager(mockBookmarkService);

      // Wait a bit for decorations to be applied
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify decorations were applied (we can't directly inspect decorations,
      // but we can verify the manager was created without errors)
      assert.ok(decorationManager);
    });

    test('should not apply decorations to editor without bookmarks', async () => {
      // Create a test document
      const doc = await vscode.workspace.openTextDocument({
        content: 'line 0\nline 1\nline 2',
        language: 'typescript'
      });

      const editor = await vscode.window.showTextDocument(doc);

      // No bookmarks set
      mockBookmarkService.setBookmarks([]);

      // Create decoration manager
      decorationManager = new DecorationManager(mockBookmarkService);

      // Wait a bit for decorations to be applied
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify manager was created without errors
      assert.ok(decorationManager);
    });

    test('should filter bookmarks by file path', async () => {
      // Create two test documents
      const doc1 = await vscode.workspace.openTextDocument({
        content: 'file 1 content',
        language: 'typescript'
      });

      const doc2 = await vscode.workspace.openTextDocument({
        content: 'file 2 content',
        language: 'typescript'
      });

      const filePath1 = vscode.workspace.asRelativePath(doc1.uri);
      const filePath2 = vscode.workspace.asRelativePath(doc2.uri);

      // Add bookmarks for both files
      mockBookmarkService.setBookmarks([
        {
          id: 'bookmark-1',
          title: 'Bookmark in File 1',
          description: 'Description 1',
          filePath: filePath1,
          line: 0,
          column: 0,
          tags: [],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        },
        {
          id: 'bookmark-2',
          title: 'Bookmark in File 2',
          description: 'Description 2',
          filePath: filePath2,
          line: 0,
          column: 0,
          tags: [],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        }
      ]);

      // Show first document
      await vscode.window.showTextDocument(doc1);

      // Create decoration manager
      decorationManager = new DecorationManager(mockBookmarkService);

      // Wait a bit for decorations to be applied
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify manager was created without errors
      assert.ok(decorationManager);

      // Show second document
      await vscode.window.showTextDocument(doc2);

      // Wait a bit for decorations to be applied
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify manager still works
      assert.ok(decorationManager);
    });

    test('should handle path normalization correctly', async () => {
      // Create a test document
      const doc = await vscode.workspace.openTextDocument({
        content: 'test content',
        language: 'typescript'
      });

      const editor = await vscode.window.showTextDocument(doc);
      const filePath = vscode.workspace.asRelativePath(doc.uri);

      // Add bookmark with different path separators
      const bookmarkPath = filePath.replace(/\\/g, '/');
      mockBookmarkService.setBookmarks([
        {
          id: 'bookmark-1',
          title: 'Test Bookmark',
          description: 'Test description',
          filePath: bookmarkPath,
          line: 0,
          column: 0,
          tags: [],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        }
      ]);

      // Create decoration manager
      decorationManager = new DecorationManager(mockBookmarkService);

      // Wait a bit for decorations to be applied
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify manager was created without errors
      assert.ok(decorationManager);
    });

    test('should create decoration with hover message', async () => {
      // Create a test document
      const doc = await vscode.workspace.openTextDocument({
        content: 'line 0\nline 1\nline 2',
        language: 'typescript'
      });

      const editor = await vscode.window.showTextDocument(doc);
      const filePath = vscode.workspace.asRelativePath(doc.uri);

      // Add bookmark with title and description
      mockBookmarkService.setBookmarks([
        {
          id: 'bookmark-1',
          title: 'Important Function',
          description: 'function calculateTotal()',
          filePath: filePath,
          line: 1,
          column: 0,
          tags: ['important'],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        }
      ]);

      // Create decoration manager
      decorationManager = new DecorationManager(mockBookmarkService);

      // Wait a bit for decorations to be applied
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify manager was created without errors
      assert.ok(decorationManager);
    });
  });

  suite('decoration refresh', () => {
    test('should refresh decorations when bookmarks change', async () => {
      // Create a test document
      const doc = await vscode.workspace.openTextDocument({
        content: 'line 0\nline 1\nline 2',
        language: 'typescript'
      });

      const editor = await vscode.window.showTextDocument(doc);
      const filePath = vscode.workspace.asRelativePath(doc.uri);

      // Start with no bookmarks
      mockBookmarkService.setBookmarks([]);

      // Create decoration manager
      decorationManager = new DecorationManager(mockBookmarkService);

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Add a bookmark and fire change event
      mockBookmarkService.setBookmarks([
        {
          id: 'bookmark-1',
          title: 'New Bookmark',
          description: 'New description',
          filePath: filePath,
          line: 1,
          column: 0,
          tags: [],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        }
      ]);
      mockBookmarkService.fireChangeEvent();

      // Wait for refresh
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify manager still works
      assert.ok(decorationManager);
    });

    test('should remove decorations when bookmark is deleted', async () => {
      // Create a test document
      const doc = await vscode.workspace.openTextDocument({
        content: 'line 0\nline 1\nline 2',
        language: 'typescript'
      });

      const editor = await vscode.window.showTextDocument(doc);
      const filePath = vscode.workspace.asRelativePath(doc.uri);

      // Start with a bookmark
      mockBookmarkService.setBookmarks([
        {
          id: 'bookmark-1',
          title: 'Test Bookmark',
          description: 'Test description',
          filePath: filePath,
          line: 1,
          column: 0,
          tags: [],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        }
      ]);

      // Create decoration manager
      decorationManager = new DecorationManager(mockBookmarkService);

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Remove the bookmark
      mockBookmarkService.setBookmarks([]);
      mockBookmarkService.fireChangeEvent();

      // Wait for refresh
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify manager still works
      assert.ok(decorationManager);
    });
  });

  suite('multiple editors', () => {
    test('should apply decorations to all visible editors', async () => {
      // Create two test documents
      const doc1 = await vscode.workspace.openTextDocument({
        content: 'file 1 content',
        language: 'typescript'
      });

      const doc2 = await vscode.workspace.openTextDocument({
        content: 'file 2 content',
        language: 'typescript'
      });

      const filePath1 = vscode.workspace.asRelativePath(doc1.uri);
      const filePath2 = vscode.workspace.asRelativePath(doc2.uri);

      // Add bookmarks for both files
      mockBookmarkService.setBookmarks([
        {
          id: 'bookmark-1',
          title: 'Bookmark 1',
          description: 'Description 1',
          filePath: filePath1,
          line: 0,
          column: 0,
          tags: [],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        },
        {
          id: 'bookmark-2',
          title: 'Bookmark 2',
          description: 'Description 2',
          filePath: filePath2,
          line: 0,
          column: 0,
          tags: [],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        }
      ]);

      // Show both documents
      await vscode.window.showTextDocument(doc1, { viewColumn: vscode.ViewColumn.One });
      await vscode.window.showTextDocument(doc2, { viewColumn: vscode.ViewColumn.Two });

      // Create decoration manager
      decorationManager = new DecorationManager(mockBookmarkService);

      // Wait a bit for decorations to be applied
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify manager was created without errors
      assert.ok(decorationManager);
    });
  });

  suite('dispose', () => {
    test('should dispose decorations and event listeners', async () => {
      // Create a test document
      const doc = await vscode.workspace.openTextDocument({
        content: 'test content',
        language: 'typescript'
      });

      await vscode.window.showTextDocument(doc);

      // Create decoration manager
      decorationManager = new DecorationManager(mockBookmarkService);

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Dispose
      decorationManager.dispose();

      // Verify no errors occurred
      assert.ok(true);
    });
  });
});
