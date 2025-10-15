import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs/promises';
import { StorageManager } from '../../../storage/StorageManager';
import { BookmarkData } from '../../../models';

suite('StorageManager Test Suite', () => {
  const testWorkspaceRoot = path.join(__dirname, 'test-workspace');
  const storageFilePath = path.join(testWorkspaceRoot, '.putra', 'bookmark.json');
  let storageManager: StorageManager;

  setup(async () => {
    storageManager = new StorageManager(testWorkspaceRoot);
    await fs.mkdir(path.dirname(storageFilePath), { recursive: true });
  });

  teardown(async () => {
    try {
      await fs.rm(testWorkspaceRoot, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  suite('load', () => {
    test('should return default data when file does not exist', async () => {
      const data = await storageManager.load();
      assert.strictEqual(data.bookmarks.length, 0);
      assert.strictEqual(data.metadata.version, '1.0.0');
      assert.strictEqual(data.metadata.totalBookmarks, 0);
    });

    test('should load data from existing file', async () => {
      const testData: BookmarkData = {
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
          workspacePath: testWorkspaceRoot,
          totalBookmarks: 1,
          lastModified: '2024-10-15T10:00:00.000Z'
        }
      };

      await fs.writeFile(storageFilePath, JSON.stringify(testData), 'utf-8');
      const data = await storageManager.load();

      assert.strictEqual(data.bookmarks.length, 1);
      assert.strictEqual(data.bookmarks[0].title, 'Test Bookmark');
    });

    test('should throw error for invalid data', async () => {
      await fs.writeFile(storageFilePath, JSON.stringify({ invalid: 'data' }), 'utf-8');

      await assert.rejects(
        async () => await storageManager.load(),
        /Invalid bookmark data/
      );
    });
  });

  suite('save', () => {
    test('should save data to file', async () => {
      const testData: BookmarkData = {
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
          workspacePath: testWorkspaceRoot,
          totalBookmarks: 1,
          lastModified: '2024-10-15T10:00:00.000Z'
        }
      };

      await storageManager.save(testData);

      const content = await fs.readFile(storageFilePath, 'utf-8');
      const savedData = JSON.parse(content);

      assert.strictEqual(savedData.bookmarks.length, 1);
      assert.strictEqual(savedData.bookmarks[0].title, 'Test Bookmark');
    });

    test('should create directory if it does not exist', async () => {
      await fs.rm(path.dirname(storageFilePath), { recursive: true, force: true });

      const testData: BookmarkData = {
        bookmarks: [],
        metadata: {
          version: '1.0.0',
          workspacePath: testWorkspaceRoot,
          totalBookmarks: 0,
          lastModified: '2024-10-15T10:00:00.000Z'
        }
      };

      await storageManager.save(testData);

      const exists = await fs.access(storageFilePath).then(() => true).catch(() => false);
      assert.strictEqual(exists, true);
    });
  });

  suite('exists', () => {
    test('should return false when file does not exist', async () => {
      const exists = await storageManager.exists();
      assert.strictEqual(exists, false);
    });

    test('should return true when file exists', async () => {
      await fs.writeFile(storageFilePath, '{}', 'utf-8');
      const exists = await storageManager.exists();
      assert.strictEqual(exists, true);
    });
  });

  suite('initialize', () => {
    test('should create file with default data when it does not exist', async () => {
      await storageManager.initialize();

      const exists = await storageManager.exists();
      assert.strictEqual(exists, true);

      const data = await storageManager.load();
      assert.strictEqual(data.bookmarks.length, 0);
    });

    test('should not overwrite existing file', async () => {
      const testData: BookmarkData = {
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
          workspacePath: testWorkspaceRoot,
          totalBookmarks: 1,
          lastModified: '2024-10-15T10:00:00.000Z'
        }
      };

      await storageManager.save(testData);
      await storageManager.initialize();

      const data = await storageManager.load();
      assert.strictEqual(data.bookmarks.length, 1);
    });
  });
});
