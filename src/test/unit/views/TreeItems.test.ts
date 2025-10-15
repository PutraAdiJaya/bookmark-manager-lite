import * as assert from 'assert';
import * as vscode from 'vscode';
import { BookmarkTreeItem, TagGroupTreeItem } from '../../../views/TreeItems';
import { Bookmark, TagGroup } from '../../../models';

suite('TreeItems Test Suite', () => {
  suite('BookmarkTreeItem', () => {
    test('should create BookmarkTreeItem with correct properties', () => {
      const bookmark: Bookmark = {
        id: 'test-id-1',
        title: 'Test Bookmark',
        description: 'Test description',
        filePath: 'src/test.ts',
        line: 10,
        column: 5,
        tags: ['test', 'unit'],
        createdAt: '2024-10-15T10:00:00.000Z',
        updatedAt: '2024-10-15T10:00:00.000Z'
      };

      const treeItem = new BookmarkTreeItem(bookmark, vscode.TreeItemCollapsibleState.None);

      assert.strictEqual(treeItem.label, 'Test Bookmark');
      assert.strictEqual(treeItem.tooltip, 'src/test.ts:11');
      assert.strictEqual(treeItem.description, 'Line 11');
      assert.strictEqual(treeItem.contextValue, 'bookmark');
      assert.strictEqual(treeItem.collapsibleState, vscode.TreeItemCollapsibleState.None);
    });

    test('should configure bookmark icon', () => {
      const bookmark: Bookmark = {
        id: 'test-id-2',
        title: 'Icon Test',
        description: 'Test',
        filePath: 'src/icon.ts',
        line: 0,
        column: 0,
        tags: [],
        createdAt: '2024-10-15T10:00:00.000Z',
        updatedAt: '2024-10-15T10:00:00.000Z'
      };

      const treeItem = new BookmarkTreeItem(bookmark, vscode.TreeItemCollapsibleState.None);

      assert.ok(treeItem.iconPath instanceof vscode.ThemeIcon);
      assert.strictEqual((treeItem.iconPath as vscode.ThemeIcon).id, 'bookmark');
    });

    test('should configure command to open bookmark', () => {
      const bookmark: Bookmark = {
        id: 'test-id-3',
        title: 'Command Test',
        description: 'Test',
        filePath: 'src/command.ts',
        line: 5,
        column: 0,
        tags: [],
        createdAt: '2024-10-15T10:00:00.000Z',
        updatedAt: '2024-10-15T10:00:00.000Z'
      };

      const treeItem = new BookmarkTreeItem(bookmark, vscode.TreeItemCollapsibleState.None);

      assert.ok(treeItem.command);
      assert.strictEqual(treeItem.command.command, 'bookmarkLite.open');
      assert.strictEqual(treeItem.command.title, 'Open Bookmark');
      assert.deepStrictEqual(treeItem.command.arguments, [bookmark]);
    });

    test('should handle bookmark at line 0', () => {
      const bookmark: Bookmark = {
        id: 'test-id-4',
        title: 'Line Zero',
        description: 'Test',
        filePath: 'src/zero.ts',
        line: 0,
        column: 0,
        tags: [],
        createdAt: '2024-10-15T10:00:00.000Z',
        updatedAt: '2024-10-15T10:00:00.000Z'
      };

      const treeItem = new BookmarkTreeItem(bookmark, vscode.TreeItemCollapsibleState.None);

      assert.strictEqual(treeItem.description, 'Line 1');
      assert.strictEqual(treeItem.tooltip, 'src/zero.ts:1');
    });
  });

  suite('TagGroupTreeItem', () => {
    test('should create TagGroupTreeItem with correct properties', () => {
      const tagGroup: TagGroup = {
        tag: 'test-tag',
        bookmarks: [],
        count: 5
      };

      const treeItem = new TagGroupTreeItem(tagGroup, vscode.TreeItemCollapsibleState.Expanded);

      assert.strictEqual(treeItem.label, 'test-tag');
      assert.strictEqual(treeItem.description, '(5)');
      assert.strictEqual(treeItem.contextValue, 'tagGroup');
      assert.strictEqual(treeItem.collapsibleState, vscode.TreeItemCollapsibleState.Expanded);
    });

    test('should configure folder icon', () => {
      const tagGroup: TagGroup = {
        tag: 'icon-test',
        bookmarks: [],
        count: 3
      };

      const treeItem = new TagGroupTreeItem(tagGroup, vscode.TreeItemCollapsibleState.Collapsed);

      assert.ok(treeItem.iconPath instanceof vscode.ThemeIcon);
      assert.strictEqual((treeItem.iconPath as vscode.ThemeIcon).id, 'folder');
    });

    test('should show count in description', () => {
      const tagGroup: TagGroup = {
        tag: 'count-test',
        bookmarks: [],
        count: 0
      };

      const treeItem = new TagGroupTreeItem(tagGroup, vscode.TreeItemCollapsibleState.None);

      assert.strictEqual(treeItem.description, '(0)');
    });

    test('should handle untagged group', () => {
      const tagGroup: TagGroup = {
        tag: 'untagged',
        bookmarks: [],
        count: 2
      };

      const treeItem = new TagGroupTreeItem(tagGroup, vscode.TreeItemCollapsibleState.Expanded);

      assert.strictEqual(treeItem.label, 'untagged');
      assert.strictEqual(treeItem.description, '(2)');
    });

    test('should handle large bookmark count', () => {
      const tagGroup: TagGroup = {
        tag: 'large-group',
        bookmarks: [],
        count: 999
      };

      const treeItem = new TagGroupTreeItem(tagGroup, vscode.TreeItemCollapsibleState.Expanded);

      assert.strictEqual(treeItem.description, '(999)');
    });
  });
});
