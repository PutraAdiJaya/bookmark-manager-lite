import * as assert from 'assert';
import * as vscode from 'vscode';
import { StorageManager } from '../../storage/StorageManager';
import { BookmarkService } from '../../services/BookmarkService';

suite('Tag Grouping Integration Test', () => {
  let workspaceRoot: string;
  let storageManager: StorageManager;
  let bookmarkService: BookmarkService;

  setup(async () => {
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
    await bookmarkService.clearAllBookmarks();
  });

  test('Bookmarks with various tags are grouped correctly', async () => {
    // Add bookmarks with different tag combinations
    await bookmarkService.addBookmark({
      title: 'Auth Bookmark',
      description: 'Authentication code',
      filePath: 'auth.ts',
      line: 10,
      column: 0,
      tags: ['auth', 'security']
    });

    await bookmarkService.addBookmark({
      title: 'API Bookmark',
      description: 'API endpoint',
      filePath: 'api.ts',
      line: 20,
      column: 0,
      tags: ['api']
    });

    await bookmarkService.addBookmark({
      title: 'Security Bookmark',
      description: 'Security check',
      filePath: 'security.ts',
      line: 30,
      column: 0,
      tags: ['security']
    });

    // Get tag groups
    const tagGroups = bookmarkService.getTagGroups();

    // Verify 'auth' group
    const authGroup = tagGroups.find(g => g.tag === 'auth');
    assert.ok(authGroup);
    assert.strictEqual(authGroup.count, 1);
    assert.strictEqual(authGroup.bookmarks[0].title, 'Auth Bookmark');

    // Verify 'security' group (should have 2 bookmarks)
    const securityGroup = tagGroups.find(g => g.tag === 'security');
    assert.ok(securityGroup);
    assert.strictEqual(securityGroup.count, 2);

    // Verify 'api' group
    const apiGroup = tagGroups.find(g => g.tag === 'api');
    assert.ok(apiGroup);
    assert.strictEqual(apiGroup.count, 1);
  });

  test('Untagged bookmarks appear in untagged group', async () => {
    // Add bookmarks with and without tags
    await bookmarkService.addBookmark({
      title: 'Tagged Bookmark',
      description: 'Has tags',
      filePath: 'test1.ts',
      line: 10,
      column: 0,
      tags: ['tagged']
    });

    await bookmarkService.addBookmark({
      title: 'Untagged Bookmark 1',
      description: 'No tags',
      filePath: 'test2.ts',
      line: 20,
      column: 0,
      tags: []
    });

    await bookmarkService.addBookmark({
      title: 'Untagged Bookmark 2',
      description: 'Also no tags',
      filePath: 'test3.ts',
      line: 30,
      column: 0,
      tags: []
    });

    // Get tag groups
    const tagGroups = bookmarkService.getTagGroups();

    // Verify untagged group
    const untaggedGroup = tagGroups.find(g => g.tag === 'untagged');
    assert.ok(untaggedGroup);
    assert.strictEqual(untaggedGroup.count, 2);

    const untaggedTitles = untaggedGroup.bookmarks.map(b => b.title).sort();
    assert.deepStrictEqual(untaggedTitles, ['Untagged Bookmark 1', 'Untagged Bookmark 2']);
  });

  test('Moving bookmark between groups by editing tags updates tree view', async () => {
    // Add bookmark in 'todo' group
    const bookmark = await bookmarkService.addBookmark({
      title: 'Task Bookmark',
      description: 'A task',
      filePath: 'task.ts',
      line: 10,
      column: 0,
      tags: ['todo']
    });

    // Verify it's in 'todo' group
    let tagGroups = bookmarkService.getTagGroups();
    let todoGroup = tagGroups.find(g => g.tag === 'todo');
    assert.ok(todoGroup);
    assert.strictEqual(todoGroup.count, 1);

    // Move to 'done' group
    await bookmarkService.updateBookmarkTags(bookmark.id, ['done']);

    // Verify it moved
    tagGroups = bookmarkService.getTagGroups();
    todoGroup = tagGroups.find(g => g.tag === 'todo');
    const doneGroup = tagGroups.find(g => g.tag === 'done');

    assert.ok(!todoGroup || todoGroup.count === 0);
    assert.ok(doneGroup);
    assert.strictEqual(doneGroup.count, 1);
  });

  test('Bookmark with multiple tags appears in all relevant groups', async () => {
    // Add bookmark with multiple tags
    await bookmarkService.addBookmark({
      title: 'Multi-tag Bookmark',
      description: 'Has multiple tags',
      filePath: 'test.ts',
      line: 10,
      column: 0,
      tags: ['important', 'urgent', 'bug-fix']
    });

    // Verify it appears in all tag groups
    const importantBookmarks = bookmarkService.getBookmarksByTag('important');
    const urgentBookmarks = bookmarkService.getBookmarksByTag('urgent');
    const bugFixBookmarks = bookmarkService.getBookmarksByTag('bug-fix');

    assert.strictEqual(importantBookmarks.length, 1);
    assert.strictEqual(urgentBookmarks.length, 1);
    assert.strictEqual(bugFixBookmarks.length, 1);

    assert.strictEqual(importantBookmarks[0].title, 'Multi-tag Bookmark');
    assert.strictEqual(urgentBookmarks[0].title, 'Multi-tag Bookmark');
    assert.strictEqual(bugFixBookmarks[0].title, 'Multi-tag Bookmark');
  });
});
