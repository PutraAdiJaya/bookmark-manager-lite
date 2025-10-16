import * as assert from 'assert';
import * as vscode from 'vscode';
import { BookmarkTreeProvider } from '../../../views/BookmarkTreeProvider';
import { BookmarkTreeItem, TagGroupTreeItem } from '../../../views/TreeItems';
import { IBookmarkService } from '../../../services/IBookmarkService';
import { Bookmark, TagGroup } from '../../../models';

class MockBookmarkService implements IBookmarkService {
  private _onBookmarksChanged = new vscode.EventEmitter<void>();
  readonly onBookmarksChanged = this._onBookmarksChanged.event;

  private bookmarks: Bookmark[] = [];
  private tagGroups: TagGroup[] = [];

  setBookmarks(bookmarks: Bookmark[]): void {
    this.bookmarks = bookmarks;
  }

  setTagGroups(tagGroups: TagGroup[]): void {
    this.tagGroups = tagGroups;
  }

  fireChange(): void {
    this._onBookmarksChanged.fire();
  }

  getTagGroups(): TagGroup[] {
    return this.tagGroups;
  }

  getBookmarksByTag(tag: string): Bookmark[] {
    return this.bookmarks.filter(b => 
      tag === 'untagged' ? b.tags.length === 0 : b.tags.includes(tag)
    );
  }

  getAllBookmarks(): Bookmark[] {
    return this.bookmarks;
  }

  // New methods added for enhanced functionality
  searchBookmarks(query: string): Bookmark[] {
    if (!query || query.trim() === '') {
      return this.getAllBookmarks();
    }

    const searchTerm = query.toLowerCase().trim();
    return this.getAllBookmarks().filter(bookmark => 
      bookmark.title.toLowerCase().includes(searchTerm) ||
      bookmark.description.toLowerCase().includes(searchTerm) ||
      bookmark.filePath.toLowerCase().includes(searchTerm) ||
      bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  filterBookmarks(options: { tags?: string[], filePath?: string }): Bookmark[] {
    let bookmarks = this.getAllBookmarks();
    
    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      bookmarks = bookmarks.filter(bookmark => 
        options.tags!.some(tag => 
          bookmark.tags.includes(tag) || (tag === 'untagged' && bookmark.tags.length === 0)
        )
      );
    }
    
    // Filter by file path
    if (options.filePath) {
      const normalizedPath = options.filePath.toLowerCase();
      bookmarks = bookmarks.filter(bookmark => 
        bookmark.filePath.toLowerCase().includes(normalizedPath)
      );
    }
    
    return bookmarks;
  }

  exportBookmarks(): string {
    const bookmarks = this.getAllBookmarks();
    const data = {
      bookmarks: bookmarks,
      metadata: {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        totalBookmarks: bookmarks.length
      }
    };
    return JSON.stringify(data, null, 2);
  }

  async importBookmarks(jsonData: string): Promise<number> {
    // Mock implementation - just return 0 for tests
    return 0;
  }

  sortBookmarks(criteria: 'date' | 'title' | 'file'): Bookmark[] {
    const bookmarks = this.getAllBookmarks();
    
    switch (criteria) {
      case 'date':
        return bookmarks.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'title':
        return bookmarks.sort((a, b) => 
          a.title.localeCompare(b.title)
        );
      case 'file':
        return bookmarks.sort((a, b) => {
          const fileComparison = a.filePath.localeCompare(b.filePath);
          if (fileComparison !== 0) {
            return fileComparison;
          }
          // If same file, sort by line number
          return a.line - b.line;
        });
      default:
        return bookmarks;
    }
  }

  async validateBookmarks(): Promise<{ valid: Bookmark[], invalid: Bookmark[] }> {
    // Mock implementation - all bookmarks are valid
    const allBookmarks = this.getAllBookmarks();
    return { valid: allBookmarks, invalid: [] };
  }

  getStatistics(): {
    totalBookmarks: number;
    totalTags: number;
    bookmarksPerTag: Record<string, number>;
    bookmarksPerFile: Record<string, number>;
    mostUsedTags: { tag: string; count: number }[];
    createdAt: string;
  } {
    const bookmarks = this.getAllBookmarks();
    const tagCounts: Record<string, number> = {};
    const fileCounts: Record<string, number> = {};
    
    // Count tags and files
    for (const bookmark of bookmarks) {
      // Count files
      fileCounts[bookmark.filePath] = (fileCounts[bookmark.filePath] || 0) + 1;
      
      // Count tags
      if (bookmark.tags.length === 0) {
        tagCounts['untagged'] = (tagCounts['untagged'] || 0) + 1;
      } else {
        for (const tag of bookmark.tags) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      }
    }
    
    // Get most used tags
    const mostUsedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 tags
    
    return {
      totalBookmarks: bookmarks.length,
      totalTags: Object.keys(tagCounts).length,
      bookmarksPerTag: tagCounts,
      bookmarksPerFile: fileCounts,
      mostUsedTags,
      createdAt: new Date().toISOString()
    };
  }

  // Stub methods not used in these tests
  async addBookmark(): Promise<Bookmark> { throw new Error('Not implemented'); }
  getBookmark(): Bookmark | undefined { return undefined; }
  async updateBookmark(): Promise<Bookmark> { throw new Error('Not implemented'); }
  async deleteBookmark(): Promise<void> { return Promise.resolve(); }
  async clearAllBookmarks(): Promise<void> { return Promise.resolve(); }
  async updateBookmarkTags(): Promise<Bookmark> { throw new Error('Not implemented'); }
  async initialize(): Promise<void> { return Promise.resolve(); }
}

suite('BookmarkTreeProvider Test Suite', () => {
  let mockService: MockBookmarkService;
  let provider: BookmarkTreeProvider;

  setup(() => {
    mockService = new MockBookmarkService();
    provider = new BookmarkTreeProvider(mockService);
  });

  suite('getTreeItem', () => {
    test('should return BookmarkTreeItem as-is', () => {
      const bookmark: Bookmark = {
        id: 'test-1',
        title: 'Test Bookmark',
        description: 'Test',
        filePath: 'src/test.ts',
        line: 5,
        column: 0,
        tags: ['test'],
        createdAt: '2024-10-15T10:00:00.000Z',
        updatedAt: '2024-10-15T10:00:00.000Z'
      };

      const treeItem = new BookmarkTreeItem(bookmark, vscode.TreeItemCollapsibleState.None);
      const result = provider.getTreeItem(treeItem);

      assert.strictEqual(result, treeItem);
    });

    test('should return TagGroupTreeItem as-is', () => {
      const tagGroup: TagGroup = {
        tag: 'test-tag',
        bookmarks: [],
        count: 3
      };

      const treeItem = new TagGroupTreeItem(tagGroup, vscode.TreeItemCollapsibleState.Expanded);
      const result = provider.getTreeItem(treeItem);

      assert.strictEqual(result, treeItem);
    });
  });

  suite('getChildren', () => {
    test('should return TagGroupTreeItem array when element is undefined', async () => {
      const tagGroups: TagGroup[] = [
        { tag: 'test', bookmarks: [], count: 2 },
        { tag: 'feature', bookmarks: [], count: 3 },
        { tag: 'untagged', bookmarks: [], count: 1 }
      ];

      mockService.setTagGroups(tagGroups);

      const children = await provider.getChildren();

      assert.strictEqual(children.length, 3);
      assert.ok(children[0] instanceof TagGroupTreeItem);
      assert.ok(children[1] instanceof TagGroupTreeItem);
      assert.ok(children[2] instanceof TagGroupTreeItem);
      assert.strictEqual(children[0].label, 'test');
      assert.strictEqual(children[1].label, 'feature');
      assert.strictEqual(children[2].label, 'untagged');
    });

    test('should return empty array when no tag groups exist', async () => {
      mockService.setTagGroups([]);

      const children = await provider.getChildren();

      assert.strictEqual(children.length, 0);
    });

    test('should return BookmarkTreeItem array when element is TagGroupTreeItem', async () => {
      const bookmarks: Bookmark[] = [
        {
          id: 'b1',
          title: 'Bookmark 1',
          description: 'Test 1',
          filePath: 'src/test1.ts',
          line: 5,
          column: 0,
          tags: ['test'],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        },
        {
          id: 'b2',
          title: 'Bookmark 2',
          description: 'Test 2',
          filePath: 'src/test2.ts',
          line: 10,
          column: 0,
          tags: ['test'],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        }
      ];

      mockService.setBookmarks(bookmarks);

      const tagGroup: TagGroup = {
        tag: 'test',
        bookmarks: bookmarks,
        count: 2
      };

      const tagGroupItem = new TagGroupTreeItem(tagGroup, vscode.TreeItemCollapsibleState.Expanded);
      const children = await provider.getChildren(tagGroupItem);

      assert.strictEqual(children.length, 2);
      assert.ok(children[0] instanceof BookmarkTreeItem);
      assert.ok(children[1] instanceof BookmarkTreeItem);
      assert.strictEqual(children[0].label, 'Bookmark 1');
      assert.strictEqual(children[1].label, 'Bookmark 2');
    });

    test('should return empty array when tag group has no bookmarks', async () => {
      mockService.setBookmarks([]);

      const tagGroup: TagGroup = {
        tag: 'empty',
        bookmarks: [],
        count: 0
      };

      const tagGroupItem = new TagGroupTreeItem(tagGroup, vscode.TreeItemCollapsibleState.Expanded);
      const children = await provider.getChildren(tagGroupItem);

      assert.strictEqual(children.length, 0);
    });

    test('should handle untagged bookmarks', async () => {
      const bookmarks: Bookmark[] = [
        {
          id: 'b1',
          title: 'Untagged Bookmark',
          description: 'Test',
          filePath: 'src/test.ts',
          line: 5,
          column: 0,
          tags: [],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        }
      ];

      mockService.setBookmarks(bookmarks);

      const tagGroup: TagGroup = {
        tag: 'untagged',
        bookmarks: bookmarks,
        count: 1
      };

      const tagGroupItem = new TagGroupTreeItem(tagGroup, vscode.TreeItemCollapsibleState.Expanded);
      const children = await provider.getChildren(tagGroupItem);

      assert.strictEqual(children.length, 1);
      assert.ok(children[0] instanceof BookmarkTreeItem);
      assert.strictEqual(children[0].label, 'Untagged Bookmark');
    });

    test('should set collapsible state to Expanded for tag groups', async () => {
      const tagGroups: TagGroup[] = [
        { tag: 'test', bookmarks: [], count: 1 }
      ];

      mockService.setTagGroups(tagGroups);

      const children = await provider.getChildren();

      assert.strictEqual(children[0].collapsibleState, vscode.TreeItemCollapsibleState.Expanded);
    });

    test('should set collapsible state to None for bookmarks', async () => {
      const bookmarks: Bookmark[] = [
        {
          id: 'b1',
          title: 'Test',
          description: 'Test',
          filePath: 'src/test.ts',
          line: 0,
          column: 0,
          tags: ['test'],
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z'
        }
      ];

      mockService.setBookmarks(bookmarks);

      const tagGroup: TagGroup = {
        tag: 'test',
        bookmarks: bookmarks,
        count: 1
      };

      const tagGroupItem = new TagGroupTreeItem(tagGroup, vscode.TreeItemCollapsibleState.Expanded);
      const children = await provider.getChildren(tagGroupItem);

      assert.strictEqual(children[0].collapsibleState, vscode.TreeItemCollapsibleState.None);
    });
  });

  suite('refresh', () => {
    test('should fire onDidChangeTreeData event when refresh is called', (done) => {
      let eventFired = false;

      provider.onDidChangeTreeData(() => {
        eventFired = true;
        assert.ok(eventFired);
        done();
      });

      provider.refresh();
    });

    test('should refresh when bookmark service fires change event', (done) => {
      let eventFired = false;

      provider.onDidChangeTreeData(() => {
        eventFired = true;
        assert.ok(eventFired);
        done();
      });

      mockService.fireChange();
    });

    test('should allow multiple refresh calls', () => {
      let eventCount = 0;

      provider.onDidChangeTreeData(() => {
        eventCount++;
      });

      provider.refresh();
      provider.refresh();
      provider.refresh();

      // Give time for events to fire
      setTimeout(() => {
        assert.strictEqual(eventCount, 3);
      }, 100);
    });
  });
});
