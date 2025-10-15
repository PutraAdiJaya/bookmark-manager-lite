# Implementation Plan

- [x] 1. Setup project structure and core interfaces


  - Create directory structure: `src/models/`, `src/services/`, `src/storage/`, `src/views/`, `src/decorations/`, `src/commands/`, `src/utils/`
  - Define TypeScript interfaces for Bookmark, BookmarkData, BookmarkMetadata, and TagGroup in `src/models/`
  - Define service interfaces IBookmarkService and IStorageManager
  - _Requirements: 7.2, 7.3_

- [x] 2. Implement utility functions

  - [x] 2.1 Create ID generation utility


    - Implement UUID v4 generator function in `src/utils/idGenerator.ts`
    - Write unit tests for ID generation
    - _Requirements: 1.4_
  

  - [x] 2.2 Create path normalization utility

    - Implement function to normalize file paths relative to workspace root in `src/utils/pathUtils.ts`
    - Implement function to validate paths are within workspace
    - Write unit tests for path utilities
    - _Requirements: 1.5, 6.1_
  

  - [x] 2.3 Create timestamp utility

    - Implement ISO 8601 timestamp generation in `src/utils/dateUtils.ts`
    - Write unit tests for timestamp utilities
    - _Requirements: 1.5, 6.4_

- [x] 3. Implement StorageManager

  - [x] 3.1 Create StorageManager class structure


    - Implement StorageManager class with constructor accepting workspace root path
    - Implement private method to get storage file path (`.putra/bookmark.json`)
    - Implement private method to create default BookmarkData structure
    - _Requirements: 6.1, 6.6_
  

  - [x] 3.2 Implement load functionality

    - Implement `load()` method to read bookmark.json file
    - Implement JSON parsing with error handling
    - Implement data validation method
    - Handle ENOENT error by returning default data
    - Write unit tests for load functionality
    - _Requirements: 6.2, 6.6, 6.7_
  

  - [x] 3.3 Implement save functionality

    - Implement `save()` method to write BookmarkData to file
    - Implement directory creation with recursive option
    - Implement JSON stringification with formatting
    - Write unit tests for save functionality
    - _Requirements: 6.1, 6.3_
  

  - [x] 3.4 Implement initialization and existence check

    - Implement `exists()` method to check if storage file exists
    - Implement `initialize()` method to create storage with default data
    - Write unit tests for initialization
    - _Requirements: 6.6_

- [x] 4. Implement BookmarkService




  - [x] 4.1 Create BookmarkService class structure


    - Implement BookmarkService class with StorageManager dependency
    - Implement private Map for bookmarks (id -> Bookmark)
    - Implement private Map for tag index (tag -> Set<id>)
    - Implement private Map for file index (filePath -> Set<id>)
    - Implement EventEmitter for bookmark changes
    - _Requirements: 1.1, 3.1_
  

  - [x] 4.2 Implement bookmark loading and initialization

    - Implement `initialize()` method to load bookmarks from storage
    - Implement method to populate indexes from loaded bookmarks
    - Write unit tests for initialization
    - _Requirements: 6.2_
  


  - [x] 4.3 Implement addBookmark functionality

    - Implement `addBookmark()` method accepting bookmark data without id and timestamps
    - Generate unique ID using utility
    - Generate timestamps using utility
    - Add bookmark to in-memory Map and indexes
    - Call StorageManager to persist data
    - Emit change event
    - Write unit tests for addBookmark

    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1_
  
  - [x] 4.4 Implement bookmark retrieval methods

    - Implement `getBookmark(id)` to retrieve single bookmark
    - Implement `getAllBookmarks()` to return array of all bookmarks
    - Implement `getBookmarksByTag(tag)` using tag index
    - Write unit tests for retrieval methods
    - _Requirements: 4.2, 4.3_
  

  - [x] 4.5 Implement updateBookmark functionality

    - Implement `updateBookmark(id, updates)` method
    - Update bookmark in Map
    - Update indexes if tags or filePath changed
    - Update updatedAt timestamp
    - Call StorageManager to persist data
    - Emit change event
    - Write unit tests for updateBookmark
    - _Requirements: 3.5, 6.1_
  

  - [x] 4.6 Implement deleteBookmark functionality

    - Implement `deleteBookmark(id)` method
    - Remove bookmark from Map and all indexes
    - Call StorageManager to persist data
    - Emit change event
    - Write unit tests for deleteBookmark
    - _Requirements: 1.6, 6.1_
  

  - [x] 4.7 Implement clearAllBookmarks functionality

    - Implement `clearAllBookmarks()` method
    - Clear all Maps and indexes
    - Call StorageManager to persist empty data
    - Emit change event
    - Write unit tests for clearAllBookmarks
    - _Requirements: 1.7, 6.1_
  


  - [x] 4.8 Implement tag management methods

    - Implement `getTagGroups()` to return array of TagGroup objects
    - Implement `updateBookmarkTags(id, tags)` method
    - Group bookmarks by tags, including "untagged" group
    - Write unit tests for tag management
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.3_

- [x] 5. Implement DecorationManager

  - [x] 5.1 Create DecorationManager class structure


    - Implement DecorationManager class with BookmarkService dependency
    - Create TextEditorDecorationType for bookmark highlighting
    - Configure decoration with background color, gutter icon (📖), and overview ruler
    - Implement Map to track decorations per editor
    - _Requirements: 2.1, 2.2_
  


  - [x] 5.2 Implement decoration application





    - Implement method to apply decorations to an editor
    - Get bookmarks for editor's file from BookmarkService
    - Create decoration ranges for each bookmark line
    - Apply decorations using editor.setDecorations()
    - Write unit tests for decoration application

    - _Requirements: 2.1, 2.2, 2.5_
  
  - [ ] 5.3 Implement decoration refresh on bookmark changes
    - Subscribe to BookmarkService change events
    - Implement method to refresh decorations for all visible editors

    - Write unit tests for decoration refresh
    - _Requirements: 2.3, 2.4, 4.8_
  
  - [ ] 5.4 Implement editor lifecycle handling
    - Subscribe to onDidChangeActiveTextEditor event
    - Subscribe to onDidChangeVisibleTextEditors event

    - Apply decorations when new editors become visible
    - Write unit tests for editor lifecycle
    - _Requirements: 2.3_
  
  - [x] 5.5 Implement decoration cleanup


    - Implement dispose method to clear all decorations
    - Remove decorations when bookmarks are deleted
    - Write unit tests for cleanup
    - _Requirements: 2.4_



- [x] 6. Implement TreeView Provider




  - [x] 6.1 Create tree item classes

    - Implement BookmarkTreeItem class extending vscode.TreeItem
    - Configure bookmark icon, tooltip, description, and command
    - Implement TagGroupTreeItem class extending vscode.TreeItem
    - Configure folder icon, description with count
    - Write unit tests for tree item creation
    - _Requirements: 4.3, 4.4_
  
  - [x] 6.2 Create BookmarkTreeProvider class structure


    - Implement BookmarkTreeProvider implementing vscode.TreeDataProvider
    - Implement EventEmitter for tree data changes
    - Accept BookmarkService as dependency
    - Subscribe to BookmarkService change events
    - _Requirements: 4.1, 4.8_
  

  - [x] 6.3 Implement getTreeItem method


    - Implement getTreeItem() to return the tree item as-is
    - Write unit tests for getTreeItem
    - _Requirements: 4.3, 4.4_

  
  - [x] 6.4 Implement getChildren method


    - Implement getChildren() with optional element parameter
    - When element is undefined, return TagGroupTreeItem array from getTagGroups()
    - When element is TagGroupTreeItem, return BookmarkTreeItem array for that tag
    - Write unit tests for getChildren with different scenarios

    - _Requirements: 4.2, 4.3_
  
  - [x] 6.5 Implement refresh functionality


    - Implement refresh() method to fire tree data change event
    - Ensure refresh is called when bookmarks change
    - Write unit tests for refresh
    - _Requirements: 4.8_

- [ ] 7. Implement command handlers
  - [x] 7.1 Implement Add Bookmark command


    - Create `src/commands/addBookmark.ts`
    - Get active editor and cursor position
    - Show input box for bookmark title
    - Extract code context for description
    - Call BookmarkService.addBookmark() with data
    - Show success message
    - Handle errors and show error messages
    - Write integration tests for add bookmark command
    - _Requirements: 1.1, 1.2, 1.3, 8.4_
  

  - [x] 7.2 Implement Add Bookmark with Tags command

    - Create `src/commands/addBookmarkWithTags.ts`
    - Get active editor and cursor position
    - Show input box for bookmark title
    - Show input box for tags (comma or space separated)
    - Parse tags into array
    - Extract code context for description
    - Call BookmarkService.addBookmark() with tags
    - Show success message
    - Handle errors and show error messages
    - Write integration tests for add bookmark with tags command
    - _Requirements: 1.1, 1.2, 3.1, 3.2, 8.4_
  

  - [x] 7.3 Implement Open Bookmark command

    - Create `src/commands/openBookmark.ts`
    - Accept bookmark parameter (from tree view click)
    - If no parameter, show quick pick of all bookmarks
    - Open document using vscode.workspace.openTextDocument()
    - Show document in editor
    - Move cursor to bookmark line and column
    - Reveal range in editor
    - Handle file not found errors
    - Write integration tests for open bookmark command
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 8.4_
  

  - [x] 7.4 Implement Remove Bookmark command

    - Create `src/commands/removeBookmark.ts`
    - Accept bookmark parameter or show quick pick
    - Show confirmation dialog
    - Call BookmarkService.deleteBookmark()
    - Show success message
    - Write integration tests for remove bookmark command
    - _Requirements: 1.6, 8.4_
  

  - [x] 7.5 Implement Edit Bookmark Tags command

    - Create `src/commands/editBookmarkTags.ts`
    - Accept bookmark parameter or show quick pick
    - Show input box with current tags pre-filled
    - Parse new tags into array
    - Call BookmarkService.updateBookmarkTags()
    - Show success message
    - Write integration tests for edit tags command
    - _Requirements: 3.4, 3.5, 8.4_
  
  - [x] 7.6 Implement Clear All Bookmarks command


    - Create `src/commands/clearAllBookmarks.ts`
    - Show confirmation dialog with warning
    - Call BookmarkService.clearAllBookmarks()
    - Show success message
    - Write integration tests for clear all command
    - _Requirements: 1.7, 8.4_
  

  - [-] 7.7 Implement Collapse/Expand All commands

    - Create `src/commands/collapseExpandAll.ts`
    - Implement collapseAll() to collapse all tree view groups
    - Implement expandAll() to expand all tree view groups
    - Use vscode.commands.executeCommand with tree view commands
    - Write integration tests for collapse/expand commands
    - _Requirements: 4.6, 4.7, 8.4_

- [x] 8. Wire everything together in extension.ts

  - [x] 8.1 Update extension activation


    - Import all services, providers, and command handlers
    - Get workspace root path
    - Instantiate StorageManager with workspace root
    - Instantiate BookmarkService with StorageManager
    - Call BookmarkService.initialize() to load bookmarks
    - _Requirements: 6.2, 7.1, 7.2_
  

  - [ ] 8.2 Register TreeView Provider
    - Instantiate BookmarkTreeProvider with BookmarkService
    - Register tree view provider with vscode.window.registerTreeDataProvider()
    - Use view ID "bookmarkExplorer" matching package.json
    - Add to context.subscriptions
    - _Requirements: 4.1, 8.1_

  
  - [ ] 8.3 Initialize DecorationManager
    - Instantiate DecorationManager with BookmarkService
    - DecorationManager will auto-subscribe to events and manage decorations
    - Add to context.subscriptions for cleanup

    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ] 8.4 Register all commands
    - Register "bookmarkLite.add" command with addBookmark handler
    - Register "bookmarkLite.addWithTags" command with addBookmarkWithTags handler
    - Register "bookmarkLite.open" command with openBookmark handler
    - Register "bookmarkLite.remove" command with removeBookmark handler
    - Register "bookmarkLite.editTags" command with editBookmarkTags handler
    - Register "bookmarkLite.clearAll" command with clearAllBookmarks handler
    - Register "bookmarkLite.collapseAll" command with collapseAll handler
    - Register "bookmarkLite.expandAll" command with expandAll handler

    - Add all command disposables to context.subscriptions
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 8.5 Implement extension deactivation
    - Implement deactivate() function
    - Ensure all disposables are properly disposed
    - _Requirements: 7.1, 7.2_

- [x] 9. Update package.json configuration


  - [x] 9.1 Add command contributions


    - Add all 8 commands to contributes.commands section
    - Set appropriate titles for each command
    - Set category as "Bookmark" for all commands
    - _Requirements: 8.1, 8.2, 8.3_
  

  - [ ] 9.2 Add view contributions
    - Verify bookmarkExplorer view is configured in contributes.views.explorer
    - Set appropriate view name and icon
    - _Requirements: 4.1_

  
  - [ ] 9.3 Add context menu contributions (optional)
    - Add context menu items for tree view (edit, delete)
    - Add editor context menu for "Add Bookmark at Line"
    - _Requirements: 4.3, 4.4_

- [ ] 10. Write end-to-end integration tests
  - [x] 10.1 Test complete bookmark lifecycle




    - Write test to add bookmark, verify it appears in tree view
    - Write test to open bookmark, verify navigation works
    - Write test to edit bookmark tags, verify tree view updates
    - Write test to delete bookmark, verify it's removed
    - _Requirements: 1.1, 1.6, 3.4, 5.1_
  


  - [x] 10.2 Test persistence across sessions

    - Write test to add bookmarks and verify they're saved to file
    - Write test to reload extension and verify bookmarks are restored
    - Write test to verify decorations are reapplied after reload
    - _Requirements: 6.1, 6.2, 2.3_
  

  - [-] 10.3 Test tag grouping functionality

    - Write test to add bookmarks with various tags
    - Verify bookmarks are grouped correctly in tree view
    - Verify untagged bookmarks appear in "untagged" group
    - Write test to move bookmark between groups by editing tags
    - _Requirements: 3.1, 3.2, 3.3, 4.2, 4.3_
  

  - [x] 10.4 Test error scenarios


    - Write test for handling missing files when opening bookmarks
    - Write test for handling corrupted bookmark.json file
    - Write test for handling permission errors
    - Verify appropriate error messages are shown
    - _Requirements: 5.6, 6.7_
