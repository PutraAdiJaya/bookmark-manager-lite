import * as assert from 'assert';
import { BookmarkService } from '../../../services/BookmarkService';
import { IStorageManager } from '../../../storage/IStorageManager';
import { BookmarkData } from '../../../models';

class MockStorageManager implements IStorageManager {
  private data: BookmarkData = {
    bookmarks: [],
    metadata: {
      version: '1.0.0',
      workspacePath: '',
      totalBookmarks: 0,
      lastModified: new Date().toISOString()
    }
  };

  async load(): Promise<BookmarkData> {
    return this.data;
  }

  async save(data: BookmarkData): Promise<void> {
    this.data = data;
  }

  async exists(): Promise<boolean> {
    return true;
  }

  async initialize(): Promise<void> {
    // No-op for mock
  }

  getData(): BookmarkData {
    return this.data;
  }

  setData(data: BookmarkData): void {
    this.data = data;
  }
}

suite('BookmarkService Test Suite', () => {
  let bookmarkService: BookmarkService;
  let mockStorage: MockStorageManager;

  setup(() => {
    mockStorage = new MockStorageManager();
    bookmarkService = new BookmarkService(mockStorage);
  });

  suite('initialize', () => {
    test('should load bookmarks from storage', async () => {
      mockStorage.setData({
        bookmarks: [{
          id: 'test-id',
          title: 'Test Bookmark',
          description: 'Test description',
          filePath: 'test.ts',
          line: 10,
          column: 0,
          tags: ['test'],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        }],
        metadata: {
          version: '1.0.0',
          workspacePath: '',
          totalBookmarks: 1,
          lastModified: '2024-10-15T10:00:00.000Z'
        }
      });

      await bookmarkService.initialize();

      const bookmarks = bookmarkService.getAllBookmarks();
      assert.strictEqual(bookmarks.length, 1);
      assert.strictEqual(bookmarks[0].title, 'Test Bookmark');
    });

    test('should populate tag index', async () => {
      mockStorage.setData({
        bookmarks: [{
          id: 'test-id',
          title: 'Test Bookmark',
          description: 'Test description',
          filePath: 'test.ts',
          line: 10,
          column: 0,
          tags: ['test', 'important'],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        }],
        metadata: {
          version: '1.0.0',
          workspacePath: '',
          totalBookmarks: 1,
          lastModified: '2024-10-15T10:00:00.000Z'
        }
      });

      await bookmarkService.initialize();

      const testBookmarks = bookmarkService.getBookmarksByTag('test');
      assert.strictEqual(testBookmarks.length, 1);

      const importantBookmarks = bookmarkService.getBookmarksByTag('important');
      assert.strictEqual(importantBookmarks.length, 1);
    });
  });

  suite('addBookmark', () => {
    test('should add bookmark with generated id and timestamps', async () => {
      await bookmarkService.initialize();

      const bookmark = await bookmarkService.addBookmark({
        title: 'New Bookmark',
        description: 'New description',
        filePath: 'new.ts',
        line: 5,
        column: 0,
        tags: ['new']
      });

      assert.ok(bookmark.id);
      assert.ok(bookmark.createdAt);
      assert.ok(bookmark.updatedAt);
      assert.strictEqual(bookmark.title, 'New Bookmark');
    });

    test('should persist bookmark to storage', async () => {
      await bookmarkService.initialize();

      await bookmarkService.addBookmark({
        title: 'New Bookmark',
        description: 'New description',
        filePath: 'new.ts',
        line: 5,
        column: 0,
        tags: ['new']
      });

      const savedData = mockStorage.getData();
      assert.strictEqual(savedData.bookmarks.length, 1);
      assert.strictEqual(savedData.bookmarks[0].title, 'New Bookmark');
    });

    test('should update indexes', async () => {
      await bookmarkService.initialize();

      await bookmarkService.addBookmark({
        title: 'New Bookmark',
        description: 'New description',
        filePath: 'new.ts',
        line: 5,
        column: 0,
        tags: ['new']
      });

      const bookmarks = bookmarkService.getBookmarksByTag('new');
      assert.strictEqual(bookmarks.length, 1);
    });

    test('should emit change event', async () => {
      await bookmarkService.initialize();

      let eventFired = false;
      bookmarkService.onBookmarksChanged(() => {
        eventFired = true;
      });

      await bookmarkService.addBookmark({
        title: 'New Bookmark',
        description: 'New description',
        filePath: 'new.ts',
        line: 5,
        column: 0,
        tags: ['new']
      });

      assert.strictEqual(eventFired, true);
    });
  });

  suite('getBookmark', () => {
    test('should return bookmark by id', async () => {
      mockStorage.setData({
        bookmarks: [{
          id: 'test-id',
          title: 'Test Bookmark',
          description: 'Test description',
          filePath: 'test.ts',
          line: 10,
          column: 0,
          tags: ['test'],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        }],
        metadata: {
          version: '1.0.0',
          workspacePath: '',
          totalBookmarks: 1,
          lastModified: '2024-10-15T10:00:00.000Z'
        }
      });

      await bookmarkService.initialize();

      const bookmark = bookmarkService.getBookmark('test-id');
      assert.ok(bookmark);
      assert.strictEqual(bookmark.title, 'Test Bookmark');
    });

    test('should return undefined for non-existent id', async () => {
      await bookmarkService.initialize();

      const bookmark = bookmarkService.getBookmark('non-existent');
      assert.strictEqual(bookmark, undefined);
    });
  });

  suite('getAllBookmarks', () => {
    test('should return all bookmarks', async () => {
      mockStorage.setData({
        bookmarks: [
          {
            id: 'test-id-1',
            title: 'Test Bookmark 1',
            description: 'Test description 1',
            filePath: 'test1.ts',
            line: 10,
            column: 0,
            tags: ['test'],
            createdAt: '2024-10-15T10:00:00.000Z',
            updatedAt: '2024-10-15T10:00:00.000Z'
          },
          {
            id: 'test-id-2',
            title: 'Test Bookmark 2',
            description: 'Test description 2',
            filePath: 'test2.ts',
            line: 20,
            column: 0,
            tags: ['test'],
            createdAt: '2024-10-15T10:00:00.000Z',
            updatedAt: '2024-10-15T10:00:00.000Z'
          }
        ],
        metadata: {
          version: '1.0.0',
          workspacePath: '',
          totalBookmarks: 2,
          lastModified: '2024-10-15T10:00:00.000Z'
        }
      });

      await bookmarkService.initialize();

      const bookmarks = bookmarkService.getAllBookmarks();
      assert.strictEqual(bookmarks.length, 2);
    });
  });

  suite('getBookmarksByTag', () => {
    test('should return bookmarks with specific tag', async () => {
      mockStorage.setData({
        bookmarks: [
          {
            id: 'test-id-1',
            title: 'Test Bookmark 1',
            description: 'Test description 1',
            filePath: 'test1.ts',
            line: 10,
            column: 0,
            tags: ['important'],
            createdAt: '2024-10-15T10:00:00.000Z',
            updatedAt: '2024-10-15T10:00:00.000Z'
          },
          {
            id: 'test-id-2',
            title: 'Test Bookmark 2',
            description: 'Test description 2',
            filePath: 'test2.ts',
            line: 20,
            column: 0,
            tags: ['test'],
            createdAt: '2024-10-15T10:00:00.000Z',
            updatedAt: '2024-10-15T10:00:00.000Z'
          }
        ],
        metadata: {
          version: '1.0.0',
          workspacePath: '',
          totalBookmarks: 2,
          lastModified: '2024-10-15T10:00:00.000Z'
        }
      });

      await bookmarkService.initialize();

      const importantBookmarks = bookmarkService.getBookmarksByTag('important');
      assert.strictEqual(importantBookmarks.length, 1);
      assert.strictEqual(importantBookmarks[0].title, 'Test Bookmark 1');
    });

    test('should return empty array for non-existent tag', async () => {
      await bookmarkService.initialize();

      const bookmarks = bookmarkService.getBookmarksByTag('non-existent');
      assert.strictEqual(bookmarks.length, 0);
    });
  });

  suite('updateBookmark', () => {
    test('should update bookmark fields', async () => {
      mockStorage.setData({
        bookmarks: [{
          id: 'test-id',
          title: 'Test Bookmark',
          description: 'Test description',
          filePath: 'test.ts',
          line: 10,
          column: 0,
          tags: ['test'],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        }],
        metadata: {
          version: '1.0.0',
          workspacePath: '',
          totalBookmarks: 1,
          lastModified: '2024-10-15T10:00:00.000Z'
        }
      });

      await bookmarkService.initialize();

      const updated = await bookmarkService.updateBookmark('test-id', {
        title: 'Updated Title'
      });

      assert.strictEqual(updated.title, 'Updated Title');
      assert.strictEqual(updated.id, 'test-id');
      assert.strictEqual(updated.createdAt, '2024-10-15T10:00:00.000Z');
    });

    test('should update indexes when tags change', async () => {
      mockStorage.setData({
        bookmarks: [{
          id: 'test-id',
          title: 'Test Bookmark',
          description: 'Test description',
          filePath: 'test.ts',
          line: 10,
          column: 0,
          tags: ['old'],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        }],
        metadata: {
          version: '1.0.0',
          workspacePath: '',
          totalBookmarks: 1,
          lastModified: '2024-10-15T10:00:00.000Z'
        }
      });

      await bookmarkService.initialize();

      await bookmarkService.updateBookmark('test-id', {
        tags: ['new']
      });

      const oldBookmarks = bookmarkService.getBookmarksByTag('old');
      const newBookmarks = bookmarkService.getBookmarksByTag('new');

      assert.strictEqual(oldBookmarks.length, 0);
      assert.strictEqual(newBookmarks.length, 1);
    });

    test('should throw error for non-existent bookmark', async () => {
      await bookmarkService.initialize();

      await assert.rejects(
        async () => await bookmarkService.updateBookmark('non-existent', { title: 'New' }),
        /not found/
      );
    });
  });

  suite('deleteBookmark', () => {
    test('should delete bookmark', async () => {
      mockStorage.setData({
        bookmarks: [{
          id: 'test-id',
          title: 'Test Bookmark',
          description: 'Test description',
          filePath: 'test.ts',
          line: 10,
          column: 0,
          tags: ['test'],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        }],
        metadata: {
          version: '1.0.0',
          workspacePath: '',
          totalBookmarks: 1,
          lastModified: '2024-10-15T10:00:00.000Z'
        }
      });

      await bookmarkService.initialize();
      await bookmarkService.deleteBookmark('test-id');

      const bookmark = bookmarkService.getBookmark('test-id');
      assert.strictEqual(bookmark, undefined);

      const allBookmarks = bookmarkService.getAllBookmarks();
      assert.strictEqual(allBookmarks.length, 0);
    });

    test('should remove from indexes', async () => {
      mockStorage.setData({
        bookmarks: [{
          id: 'test-id',
          title: 'Test Bookmark',
          description: 'Test description',
          filePath: 'test.ts',
          line: 10,
          column: 0,
          tags: ['test'],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        }],
        metadata: {
          version: '1.0.0',
          workspacePath: '',
          totalBookmarks: 1,
          lastModified: '2024-10-15T10:00:00.000Z'
        }
      });

      await bookmarkService.initialize();
      await bookmarkService.deleteBookmark('test-id');

      const bookmarks = bookmarkService.getBookmarksByTag('test');
      assert.strictEqual(bookmarks.length, 0);
    });

    test('should throw error for non-existent bookmark', async () => {
      await bookmarkService.initialize();

      await assert.rejects(
        async () => await bookmarkService.deleteBookmark('non-existent'),
        /not found/
      );
    });
  });

  suite('clearAllBookmarks', () => {
    test('should clear all bookmarks', async () => {
      mockStorage.setData({
        bookmarks: [
          {
            id: 'test-id-1',
            title: 'Test Bookmark 1',
            description: 'Test description 1',
            filePath: 'test1.ts',
            line: 10,
            column: 0,
            tags: ['test'],
            createdAt: '2024-10-15T10:00:00.000Z',
            updatedAt: '2024-10-15T10:00:00.000Z'
          },
          {
            id: 'test-id-2',
            title: 'Test Bookmark 2',
            description: 'Test description 2',
            filePath: 'test2.ts',
            line: 20,
            column: 0,
            tags: ['test'],
            createdAt: '2024-10-15T10:00:00.000Z',
            updatedAt: '2024-10-15T10:00:00.000Z'
          }
        ],
        metadata: {
          version: '1.0.0',
          workspacePath: '',
          totalBookmarks: 2,
          lastModified: '2024-10-15T10:00:00.000Z'
        }
      });

      await bookmarkService.initialize();
      await bookmarkService.clearAllBookmarks();

      const allBookmarks = bookmarkService.getAllBookmarks();
      assert.strictEqual(allBookmarks.length, 0);
    });

    test('should clear all indexes', async () => {
      mockStorage.setData({
        bookmarks: [{
          id: 'test-id',
          title: 'Test Bookmark',
          description: 'Test description',
          filePath: 'test.ts',
          line: 10,
          column: 0,
          tags: ['test'],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        }],
        metadata: {
          version: '1.0.0',
          workspacePath: '',
          totalBookmarks: 1,
          lastModified: '2024-10-15T10:00:00.000Z'
        }
      });

      await bookmarkService.initialize();
      await bookmarkService.clearAllBookmarks();

      const bookmarks = bookmarkService.getBookmarksByTag('test');
      assert.strictEqual(bookmarks.length, 0);
    });
  });

  suite('getTagGroups', () => {
    test('should return tag groups', async () => {
      mockStorage.setData({
        bookmarks: [
          {
            id: 'test-id-1',
            title: 'Test Bookmark 1',
            description: 'Test description 1',
            filePath: 'test1.ts',
            line: 10,
            column: 0,
            tags: ['important'],
            createdAt: '2024-10-15T10:00:00.000Z',
            updatedAt: '2024-10-15T10:00:00.000Z'
          },
          {
            id: 'test-id-2',
            title: 'Test Bookmark 2',
            description: 'Test description 2',
            filePath: 'test2.ts',
            line: 20,
            column: 0,
            tags: ['important', 'urgent'],
            createdAt: '2024-10-15T10:00:00.000Z',
            updatedAt: '2024-10-15T10:00:00.000Z'
          },
          {
            id: 'test-id-3',
            title: 'Test Bookmark 3',
            description: 'Test description 3',
            filePath: 'test3.ts',
            line: 30,
            column: 0,
            tags: [],
            createdAt: '2024-10-15T10:00:00.000Z',
            updatedAt: '2024-10-15T10:00:00.000Z'
          }
        ],
        metadata: {
          version: '1.0.0',
          workspacePath: '',
          totalBookmarks: 3,
          lastModified: '2024-10-15T10:00:00.000Z'
        }
      });

      await bookmarkService.initialize();

      const groups = bookmarkService.getTagGroups();
      assert.ok(groups.length >= 2); // At least 'important', 'urgent', and possibly 'untagged'

      const importantGroup = groups.find(g => g.tag === 'important');
      assert.ok(importantGroup);
      assert.strictEqual(importantGroup.count, 2);

      const untaggedGroup = groups.find(g => g.tag === 'untagged');
      assert.ok(untaggedGroup);
      assert.strictEqual(untaggedGroup.count, 1);
    });
  });

  suite('updateBookmarkTags', () => {
    test('should update bookmark tags', async () => {
      mockStorage.setData({
        bookmarks: [{
          id: 'test-id',
          title: 'Test Bookmark',
          description: 'Test description',
          filePath: 'test.ts',
          line: 10,
          column: 0,
          tags: ['old'],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        }],
        metadata: {
          version: '1.0.0',
          workspacePath: '',
          totalBookmarks: 1,
          lastModified: '2024-10-15T10:00:00.000Z'
        }
      });

      await bookmarkService.initialize();

      const updated = await bookmarkService.updateBookmarkTags('test-id', ['new', 'updated']);

      assert.strictEqual(updated.tags.length, 2);
      assert.ok(updated.tags.includes('new'));
      assert.ok(updated.tags.includes('updated'));
    });
  });
});
