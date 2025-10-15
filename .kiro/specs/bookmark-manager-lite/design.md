# Design Document

## Overview

Bookmark Manager Lite adalah VS Code extension yang dibangun menggunakan TypeScript dan VS Code Extension API. Extension ini menggunakan arsitektur modular dengan separation of concerns yang jelas antara data management, UI components, dan business logic. Design ini memastikan maintainability, testability, dan extensibility untuk future enhancements.

### Key Design Principles

1. **Separation of Concerns** - Memisahkan data layer, business logic, dan presentation layer
2. **Single Responsibility** - Setiap class/module memiliki satu tanggung jawab yang jelas
3. **Persistence First** - Semua perubahan bookmark langsung disimpan ke disk
4. **Event-Driven Updates** - UI updates menggunakan event emitters untuk reactive behavior
5. **Graceful Degradation** - Handle errors dengan baik tanpa crash extension

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    VS Code Extension                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Commands   │  │  Tree View   │  │  Decorations │  │
│  │   Handler    │  │   Provider   │  │   Manager    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
│         └──────────────────┼──────────────────┘          │
│                            │                             │
│                   ┌────────▼────────┐                    │
│                   │  Bookmark       │                    │
│                   │  Service        │                    │
│                   └────────┬────────┘                    │
│                            │                             │
│                   ┌────────▼────────┐                    │
│                   │  Storage        │                    │
│                   │  Manager        │                    │
│                   └────────┬────────┘                    │
│                            │                             │
└────────────────────────────┼─────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  .putra/        │
                    │  bookmark.json  │
                    └─────────────────┘
```

### Component Breakdown

1. **Extension Entry Point** (`extension.ts`)
   - Aktivasi dan deaktivasi extension
   - Registrasi commands, tree view provider, dan decorations
   - Dependency injection untuk services

2. **Bookmark Service** (`services/BookmarkService.ts`)
   - Core business logic untuk bookmark operations
   - CRUD operations (Create, Read, Update, Delete)
   - Tag management
   - Event emission untuk UI updates

3. **Storage Manager** (`storage/StorageManager.ts`)
   - File I/O operations
   - JSON serialization/deserialization
   - Data validation dan migration
   - Error handling untuk file operations

4. **Tree View Provider** (`views/BookmarkTreeProvider.ts`)
   - Implementasi `vscode.TreeDataProvider`
   - Grouping bookmarks by tags
   - Tree item creation dan rendering
   - Click handlers untuk navigation

5. **Decoration Manager** (`decorations/DecorationManager.ts`)
   - Gutter icon management
   - Line highlighting
   - Decoration lifecycle management
   - Multi-editor support

6. **Command Handlers** (`commands/`)
   - Individual command implementations
   - User input validation
   - Error messaging
   - Integration dengan BookmarkService

## Components and Interfaces

### Core Data Models

```typescript
// models/Bookmark.ts
interface Bookmark {
  id: string;                    // UUID v4
  title: string;                 // User-provided title
  description: string;           // Auto-generated or user-provided
  filePath: string;              // Relative to workspace root
  line: number;                  // 0-indexed line number
  column: number;                // 0-indexed column number
  tags: string[];                // Array of tag strings
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}

// models/BookmarkData.ts
interface BookmarkData {
  bookmarks: Bookmark[];
  metadata: BookmarkMetadata;
}

interface BookmarkMetadata {
  version: string;               // Schema version (e.g., "1.0.0")
  workspacePath: string;         // Absolute workspace path
  totalBookmarks: number;        // Count of bookmarks
  lastModified: string;          // ISO 8601 timestamp
}

// models/TagGroup.ts
interface TagGroup {
  tag: string;                   // Tag name or "untagged"
  bookmarks: Bookmark[];         // Bookmarks with this tag
  count: number;                 // Number of bookmarks
}
```

### Service Interfaces

```typescript
// services/IBookmarkService.ts
interface IBookmarkService {
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

// storage/IStorageManager.ts
interface IStorageManager {
  load(): Promise<BookmarkData>;
  save(data: BookmarkData): Promise<void>;
  exists(): Promise<boolean>;
  initialize(): Promise<void>;
}
```

### Tree View Models

```typescript
// views/TreeItems.ts
class BookmarkTreeItem extends vscode.TreeItem {
  constructor(
    public readonly bookmark: Bookmark,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(bookmark.title, collapsibleState);
    this.tooltip = `${bookmark.filePath}:${bookmark.line + 1}`;
    this.description = `Line ${bookmark.line + 1}`;
    this.iconPath = new vscode.ThemeIcon('bookmark');
    this.contextValue = 'bookmark';
    this.command = {
      command: 'bookmarkLite.open',
      title: 'Open Bookmark',
      arguments: [bookmark]
    };
  }
}

class TagGroupTreeItem extends vscode.TreeItem {
  constructor(
    public readonly tagGroup: TagGroup,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(tagGroup.tag, collapsibleState);
    this.description = `(${tagGroup.count})`;
    this.iconPath = new vscode.ThemeIcon('folder');
    this.contextValue = 'tagGroup';
  }
}
```

## Data Models

### Storage Schema

File: `.putra/bookmark.json`

```json
{
  "bookmarks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "User Authentication Function",
      "description": "export async function authenticateUser(credentials: UserCredentials)",
      "filePath": "src/auth/login.ts",
      "line": 45,
      "column": 0,
      "tags": ["auth", "security"],
      "createdAt": "2024-10-15T10:30:00.000Z",
      "updatedAt": "2024-10-15T10:30:00.000Z"
    }
  ],
  "metadata": {
    "version": "1.0.0",
    "workspacePath": "/Users/username/projects/my-app",
    "totalBookmarks": 1,
    "lastModified": "2024-10-15T10:30:00.000Z"
  }
}
```

### In-Memory Data Structure

```typescript
// BookmarkService internal state
class BookmarkService {
  private bookmarks: Map<string, Bookmark>;  // id -> Bookmark
  private tagIndex: Map<string, Set<string>>;  // tag -> Set<bookmark_id>
  private fileIndex: Map<string, Set<string>>;  // filePath -> Set<bookmark_id>
}
```

## Error Handling

### Error Categories

1. **File System Errors**
   - File not found
   - Permission denied
   - Disk full
   - Invalid JSON

2. **Validation Errors**
   - Invalid bookmark data
   - Missing required fields
   - Invalid file paths

3. **User Input Errors**
   - Empty title
   - Invalid tags
   - Cancelled operations

### Error Handling Strategy

```typescript
// Centralized error handler
class ErrorHandler {
  static handleStorageError(error: Error): void {
    if (error.code === 'ENOENT') {
      // File not found - initialize new storage
      vscode.window.showInformationMessage('Initializing bookmark storage...');
    } else if (error.code === 'EACCES') {
      vscode.window.showErrorMessage('Permission denied accessing bookmark file');
    } else {
      vscode.window.showErrorMessage(`Storage error: ${error.message}`);
    }
  }
  
  static handleValidationError(field: string, value: any): void {
    vscode.window.showWarningMessage(`Invalid ${field}: ${value}`);
  }
  
  static handleNavigationError(bookmark: Bookmark): void {
    vscode.window.showErrorMessage(
      `Cannot open bookmark: File not found at ${bookmark.filePath}`
    );
  }
}
```

## Testing Strategy

### Unit Tests

1. **BookmarkService Tests**
   - Test CRUD operations
   - Test tag management
   - Test event emissions
   - Test data validation

2. **StorageManager Tests**
   - Test file I/O operations
   - Test JSON serialization
   - Test error handling
   - Test data migration

3. **Utility Tests**
   - Test ID generation
   - Test path normalization
   - Test timestamp formatting

### Integration Tests

1. **Command Tests**
   - Test command registration
   - Test command execution
   - Test user input flows
   - Test error scenarios

2. **Tree View Tests**
   - Test tree item creation
   - Test grouping logic
   - Test refresh behavior
   - Test navigation

3. **Decoration Tests**
   - Test decoration application
   - Test decoration removal
   - Test multi-editor scenarios

### Test Structure

```
src/
  test/
    unit/
      services/
        BookmarkService.test.ts
      storage/
        StorageManager.test.ts
      utils/
        helpers.test.ts
    integration/
      commands/
        addBookmark.test.ts
        openBookmark.test.ts
      views/
        BookmarkTreeProvider.test.ts
      decorations/
        DecorationManager.test.ts
```

## Implementation Details

### Decoration Configuration

```typescript
// decorations/DecorationManager.ts
const bookmarkDecorationType = vscode.window.createTextEditorDecorationType({
  backgroundColor: new vscode.ThemeColor('editor.findMatchHighlightBackground'),
  isWholeLine: true,
  overviewRulerColor: new vscode.ThemeColor('editorOverviewRuler.findMatchForeground'),
  overviewRulerLane: vscode.OverviewRulerLane.Center,
  gutterIconPath: '📖',  // Emoji icon
  gutterIconSize: 'contain'
});
```

### Command Registration

```typescript
// extension.ts
function registerCommands(
  context: vscode.ExtensionContext,
  bookmarkService: IBookmarkService
): void {
  const commands = [
    vscode.commands.registerCommand('bookmarkLite.add', () => addBookmarkCommand(bookmarkService)),
    vscode.commands.registerCommand('bookmarkLite.addWithTags', () => addBookmarkWithTagsCommand(bookmarkService)),
    vscode.commands.registerCommand('bookmarkLite.open', (bookmark) => openBookmarkCommand(bookmark)),
    vscode.commands.registerCommand('bookmarkLite.remove', (bookmark) => removeBookmarkCommand(bookmarkService, bookmark)),
    vscode.commands.registerCommand('bookmarkLite.editTags', (bookmark) => editTagsCommand(bookmarkService, bookmark)),
    vscode.commands.registerCommand('bookmarkLite.clearAll', () => clearAllBookmarksCommand(bookmarkService)),
    vscode.commands.registerCommand('bookmarkLite.collapseAll', () => collapseAllCommand()),
    vscode.commands.registerCommand('bookmarkLite.expandAll', () => expandAllCommand())
  ];
  
  commands.forEach(cmd => context.subscriptions.push(cmd));
}
```

### Tree View Provider Implementation

```typescript
// views/BookmarkTreeProvider.ts
class BookmarkTreeProvider implements vscode.TreeDataProvider<BookmarkTreeItem | TagGroupTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  
  constructor(private bookmarkService: IBookmarkService) {
    bookmarkService.onBookmarksChanged(() => this.refresh());
  }
  
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
  
  getTreeItem(element: BookmarkTreeItem | TagGroupTreeItem): vscode.TreeItem {
    return element;
  }
  
  getChildren(element?: TagGroupTreeItem): Thenable<(BookmarkTreeItem | TagGroupTreeItem)[]> {
    if (!element) {
      // Root level - return tag groups
      const tagGroups = this.bookmarkService.getTagGroups();
      return Promise.resolve(
        tagGroups.map(group => new TagGroupTreeItem(group, vscode.TreeItemCollapsibleState.Expanded))
      );
    } else {
      // Tag group level - return bookmarks
      const bookmarks = this.bookmarkService.getBookmarksByTag(element.tagGroup.tag);
      return Promise.resolve(
        bookmarks.map(bookmark => new BookmarkTreeItem(bookmark, vscode.TreeItemCollapsibleState.None))
      );
    }
  }
}
```

### Storage Implementation

```typescript
// storage/StorageManager.ts
class StorageManager implements IStorageManager {
  private readonly storageFilePath: string;
  
  constructor(workspaceRoot: string) {
    this.storageFilePath = path.join(workspaceRoot, '.putra', 'bookmark.json');
  }
  
  async load(): Promise<BookmarkData> {
    try {
      const content = await fs.promises.readFile(this.storageFilePath, 'utf-8');
      const data = JSON.parse(content);
      this.validateData(data);
      return data;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return this.getDefaultData();
      }
      throw error;
    }
  }
  
  async save(data: BookmarkData): Promise<void> {
    await fs.promises.mkdir(path.dirname(this.storageFilePath), { recursive: true });
    await fs.promises.writeFile(
      this.storageFilePath,
      JSON.stringify(data, null, 2),
      'utf-8'
    );
  }
  
  private validateData(data: any): void {
    if (!data.bookmarks || !Array.isArray(data.bookmarks)) {
      throw new Error('Invalid bookmark data: missing bookmarks array');
    }
    if (!data.metadata) {
      throw new Error('Invalid bookmark data: missing metadata');
    }
  }
  
  private getDefaultData(): BookmarkData {
    return {
      bookmarks: [],
      metadata: {
        version: '1.0.0',
        workspacePath: '',
        totalBookmarks: 0,
        lastModified: new Date().toISOString()
      }
    };
  }
}
```

## Performance Considerations

1. **Lazy Loading**
   - Tree view items dibuat on-demand
   - Decorations hanya diapply pada visible editors

2. **Debouncing**
   - File save operations di-debounce untuk menghindari excessive writes
   - Tree view refresh di-debounce saat multiple bookmarks ditambahkan

3. **Indexing**
   - Maintain in-memory indexes untuk fast lookups
   - Tag index untuk O(1) tag-based queries
   - File index untuk O(1) file-based queries

4. **Memory Management**
   - Dispose decorations saat tidak digunakan
   - Clear event listeners saat deactivate

## Security Considerations

1. **Path Validation**
   - Validate semua file paths untuk mencegah path traversal
   - Ensure paths are within workspace root

2. **Input Sanitization**
   - Sanitize user input untuk title dan tags
   - Prevent injection attacks

3. **File Permissions**
   - Check file permissions sebelum read/write
   - Handle permission errors gracefully

## Future Extensibility

Design ini memungkinkan future enhancements:

1. **Export/Import**
   - Add export command yang menggunakan StorageManager
   - Add import command dengan validation

2. **Search & Filter**
   - Add search service yang menggunakan existing indexes
   - Add filter UI di tree view

3. **Bookmark Sync**
   - Add sync service yang extends StorageManager
   - Support cloud storage backends

4. **Custom Icons**
   - Replace emoji dengan custom SVG icons
   - Add configuration untuk icon selection

5. **Keyboard Shortcuts**
   - Add keybinding configuration
   - Support custom shortcuts per command
