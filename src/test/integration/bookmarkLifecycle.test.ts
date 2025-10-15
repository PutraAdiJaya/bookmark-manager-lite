import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { StorageManager } from '../../storage/StorageManager';
import { BookmarkService } from '../../services/BookmarkService';

suite('Bookmark Lifecycle Integration Test', () => {
  let workspaceRoot: string;
  let storageManager: StorageManager;
  let bookmarkService: BookmarkService;

  setup(async () => {
    // Use a test workspace
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error('No workspace folder found for testing');
    }
    
    workspaceRoot = workspaceFolders[0].uri.fsPath;
    storageManager = new StorageManager(workspaceRoot);
    bookmarkService = new BookmarkService(storageManager);
    await bookmarkService.initialize();
  });

  teardown(async () => {
    // Clean up test bookmarks
    await bookmarkService.clearAllBookmarks();
  });

  test('Complete bookmark lifecycle: add, retrieve, edit, delete', async () => {
    // Add bookmark
    const bookmark = await bookmarkService.addBookmark({
      title: 'Test Bookmark',
      description: 'Test description',
      filePath: 'test.ts',
      line: 10,
      column: 0,
      tags: ['test']
    });

    assert.ok(bookmark.id);
    assert.strictEqual(bookmark.title, 'Test Bookmark');

    // Retrieve bookmark
    const retrieved = bookmarkService.getBookmark(bookmark.id);
    assert.ok(retrieved);
    assert.strictEqual(retrieved.title, 'Test Bookmark');

    // Edit tags
    const updated = await bookmarkService.updateBookmarkTags(bookmark.id, ['test', 'updated']);
    assert.strictEqual(updated.tags.length, 2);
    assert.ok(updated.tags.includes('updated'));

    // Delete bookmark
    await bookmarkService.deleteBookmark(bookmark.id);
    const deleted = bookmarkService.getBookmark(bookmark.id);
    assert.strictEqual(deleted, undefined);
  });

  test('Bookmark appears in correct tag group', async () => {
    // Add bookmarks with different tags
    await bookmarkService.addBookmark({
      title: 'Important Bookmark',
      description: 'Important',
      filePath: 'test1.ts',
      line: 5,
      column: 0,
      tags: ['important']
    });

    await bookmarkService.addBookmark({
      title: 'Todo Bookmark',
      description: 'Todo',
      filePath: 'test2.ts',
      line: 10,
      column: 0,
      tags: ['todo']
    });

    // Get tag groups
    const tagGroups = bookmarkService.getTagGroups();
    
    const importantGroup = tagGroups.find(g => g.tag === 'important');
    assert.ok(importantGroup);
    assert.strictEqual(importantGroup.count, 1);

    const todoGroup = tagGroups.find(g => g.tag === 'todo');
    assert.ok(todoGroup);
    assert.strictEqual(todoGroup.count, 1);
  });

  test('Moving bookmark between groups by editing tags', async () => {
    // Add bookmark with 'old' tag
    const bookmark = await bookmarkService.addBookmark({
      title: 'Test Bookmark',
      description: 'Test',
      filePath: 'test.ts',
      line: 5,
      column: 0,
      tags: ['old']
    });

    // Verify it's in 'old' group
    let oldBookmarks = bookmarkService.getBookmarksByTag('old');
    assert.strictEqual(oldBookmarks.length, 1);

    // Update tags to 'new'
    await bookmarkService.updateBookmarkTags(bookmark.id, ['new']);

    // Verify it moved to 'new' group
    oldBookmarks = bookmarkService.getBookmarksByTag('old');
    const newBookmarks = bookmarkService.getBookmarksByTag('new');
    
    assert.strictEqual(oldBookmarks.length, 0);
    assert.strictEqual(newBookmarks.length, 1);
  });
});
