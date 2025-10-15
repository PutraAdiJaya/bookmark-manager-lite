import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { StorageManager } from '../../storage/StorageManager';
import { BookmarkService } from '../../services/BookmarkService';

suite('Persistence Integration Test', () => {
  let workspaceRoot: string;
  let storageFilePath: string;

  setup(async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error('No workspace folder found for testing');
    }
    
    workspaceRoot = workspaceFolders[0].uri.fsPath;
    storageFilePath = path.join(workspaceRoot, '.putra', 'bookmark.json');
  });

  teardown(async () => {
    // Clean up test files
    try {
      await fs.rm(path.dirname(storageFilePath), { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  test('Bookmarks are saved to file', async () => {
    const storageManager = new StorageManager(workspaceRoot);
    const bookmarkService = new BookmarkService(storageManager);
    await bookmarkService.initialize();

    // Add bookmark
    await bookmarkService.addBookmark({
      title: 'Persistent Bookmark',
      description: 'Should be saved',
      filePath: 'test.ts',
      line: 10,
      column: 0,
      tags: ['persistent']
    });

    // Verify file exists
    const fileExists = await fs.access(storageFilePath).then(() => true).catch(() => false);
    assert.strictEqual(fileExists, true);

    // Read and verify content
    const content = await fs.readFile(storageFilePath, 'utf-8');
    const data = JSON.parse(content);
    
    assert.strictEqual(data.bookmarks.length, 1);
    assert.strictEqual(data.bookmarks[0].title, 'Persistent Bookmark');
  });

  test('Bookmarks are restored after reload', async () => {
    // First session: create bookmarks
    let storageManager = new StorageManager(workspaceRoot);
    let bookmarkService = new BookmarkService(storageManager);
    await bookmarkService.initialize();

    await bookmarkService.addBookmark({
      title: 'Bookmark 1',
      description: 'First bookmark',
      filePath: 'test1.ts',
      line: 5,
      column: 0,
      tags: ['test']
    });

    await bookmarkService.addBookmark({
      title: 'Bookmark 2',
      description: 'Second bookmark',
      filePath: 'test2.ts',
      line: 10,
      column: 0,
      tags: ['test']
    });

    // Second session: reload and verify
    storageManager = new StorageManager(workspaceRoot);
    bookmarkService = new BookmarkService(storageManager);
    await bookmarkService.initialize();

    const allBookmarks = bookmarkService.getAllBookmarks();
    assert.strictEqual(allBookmarks.length, 2);
    
    const titles = allBookmarks.map(b => b.title).sort();
    assert.deepStrictEqual(titles, ['Bookmark 1', 'Bookmark 2']);
  });

  test('Tag groups are restored after reload', async () => {
    // First session: create bookmarks with tags
    let storageManager = new StorageManager(workspaceRoot);
    let bookmarkService = new BookmarkService(storageManager);
    await bookmarkService.initialize();

    await bookmarkService.addBookmark({
      title: 'Important',
      description: 'Important bookmark',
      filePath: 'test.ts',
      line: 5,
      column: 0,
      tags: ['important', 'urgent']
    });

    // Second session: reload and verify tag groups
    storageManager = new StorageManager(workspaceRoot);
    bookmarkService = new BookmarkService(storageManager);
    await bookmarkService.initialize();

    const tagGroups = bookmarkService.getTagGroups();
    const tagNames = tagGroups.map(g => g.tag).sort();
    
    assert.ok(tagNames.includes('important'));
    assert.ok(tagNames.includes('urgent'));
  });
});
