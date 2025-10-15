import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { StorageManager } from '../../storage/StorageManager';
import { BookmarkService } from '../../services/BookmarkService';

suite('Error Scenarios Integration Test', () => {
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
    try {
      await fs.rm(path.dirname(storageFilePath), { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  test('Handles corrupted bookmark.json file gracefully', async () => {
    // Create corrupted JSON file
    await fs.mkdir(path.dirname(storageFilePath), { recursive: true });
    await fs.writeFile(storageFilePath, '{ invalid json content', 'utf-8');

    const storageManager = new StorageManager(workspaceRoot);
    
    // Should throw error when trying to load corrupted data
    await assert.rejects(
      async () => await storageManager.load(),
      /Unexpected token/
    );
  });

  test('Handles missing bookmarks array in JSON', async () => {
    // Create invalid data structure
    await fs.mkdir(path.dirname(storageFilePath), { recursive: true });
    await fs.writeFile(
      storageFilePath,
      JSON.stringify({ invalid: 'structure' }),
      'utf-8'
    );

    const storageManager = new StorageManager(workspaceRoot);
    
    // Should throw validation error
    await assert.rejects(
      async () => await storageManager.load(),
      /Invalid bookmark data/
    );
  });

  test('Handles non-existent bookmark operations', async () => {
    const storageManager = new StorageManager(workspaceRoot);
    const bookmarkService = new BookmarkService(storageManager);
    await bookmarkService.initialize();

    // Try to get non-existent bookmark
    const bookmark = bookmarkService.getBookmark('non-existent-id');
    assert.strictEqual(bookmark, undefined);

    // Try to update non-existent bookmark
    await assert.rejects(
      async () => await bookmarkService.updateBookmark('non-existent-id', { title: 'New' }),
      /not found/
    );

    // Try to delete non-existent bookmark
    await assert.rejects(
      async () => await bookmarkService.deleteBookmark('non-existent-id'),
      /not found/
    );
  });

  test('Initializes with default data when file does not exist', async () => {
    const storageManager = new StorageManager(workspaceRoot);
    const bookmarkService = new BookmarkService(storageManager);
    
    // Initialize should work even without existing file
    await bookmarkService.initialize();

    const allBookmarks = bookmarkService.getAllBookmarks();
    assert.strictEqual(allBookmarks.length, 0);
  });

  test('Handles empty tags array correctly', async () => {
    const storageManager = new StorageManager(workspaceRoot);
    const bookmarkService = new BookmarkService(storageManager);
    await bookmarkService.initialize();

    // Add bookmark with empty tags
    const bookmark = await bookmarkService.addBookmark({
      title: 'No Tags',
      description: 'Bookmark without tags',
      filePath: 'test.ts',
      line: 10,
      column: 0,
      tags: []
    });

    // Should be in untagged group
    const untaggedBookmarks = bookmarkService.getBookmarksByTag('untagged');
    assert.strictEqual(untaggedBookmarks.length, 1);
    assert.strictEqual(untaggedBookmarks[0].id, bookmark.id);
  });

  test('Handles updating to empty tags', async () => {
    const storageManager = new StorageManager(workspaceRoot);
    const bookmarkService = new BookmarkService(storageManager);
    await bookmarkService.initialize();

    // Add bookmark with tags
    const bookmark = await bookmarkService.addBookmark({
      title: 'Tagged',
      description: 'Has tags',
      filePath: 'test.ts',
      line: 10,
      column: 0,
      tags: ['important']
    });

    // Update to empty tags
    await bookmarkService.updateBookmarkTags(bookmark.id, []);

    // Should move to untagged group
    const importantBookmarks = bookmarkService.getBookmarksByTag('important');
    const untaggedBookmarks = bookmarkService.getBookmarksByTag('untagged');

    assert.strictEqual(importantBookmarks.length, 0);
    assert.strictEqual(untaggedBookmarks.length, 1);
  });

  test('Handles special characters in tags', async () => {
    const storageManager = new StorageManager(workspaceRoot);
    const bookmarkService = new BookmarkService(storageManager);
    await bookmarkService.initialize();

    // Add bookmark with special characters in tags
    const bookmark = await bookmarkService.addBookmark({
      title: 'Special Tags',
      description: 'Has special characters',
      filePath: 'test.ts',
      line: 10,
      column: 0,
      tags: ['bug-fix', 'v1.0', 'high-priority']
    });

    // Should be retrievable by these tags
    const bugFixBookmarks = bookmarkService.getBookmarksByTag('bug-fix');
    const versionBookmarks = bookmarkService.getBookmarksByTag('v1.0');
    const priorityBookmarks = bookmarkService.getBookmarksByTag('high-priority');

    assert.strictEqual(bugFixBookmarks.length, 1);
    assert.strictEqual(versionBookmarks.length, 1);
    assert.strictEqual(priorityBookmarks.length, 1);
  });
});
