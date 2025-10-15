# Requirements Document

## Introduction

Bookmark Manager Lite adalah extension untuk Visual Studio Code dan editor kompatibel lainnya yang memungkinkan developer untuk mengelola bookmark di dalam kode mereka. Extension ini menyediakan cara yang ringan dan intuitif untuk menandai lokasi penting dalam kode, mengorganisir bookmark dengan tag custom, dan navigasi cepat antar bookmark. Semua bookmark disimpan per workspace dan persisten antar session.

## Requirements

### Requirement 1: Bookmark Creation and Management

**User Story:** As a developer, I want to create bookmarks at specific line locations in my code, so that I can quickly mark important code sections for later reference.

#### Acceptance Criteria

1. WHEN the user invokes "Add Bookmark" command THEN the system SHALL create a bookmark at the current cursor position with line and column information
2. WHEN a bookmark is created THEN the system SHALL prompt the user to enter a title for the bookmark
3. WHEN a bookmark is created THEN the system SHALL automatically generate a description based on the code context
4. WHEN a bookmark is created THEN the system SHALL assign a unique ID to the bookmark
5. WHEN a bookmark is created THEN the system SHALL store the relative file path, line number, column number, and timestamp
6. WHEN the user invokes "Remove Bookmark" command THEN the system SHALL delete the selected bookmark from storage
7. WHEN the user invokes "Clear All Bookmarks" command THEN the system SHALL remove all bookmarks from the current workspace after confirmation

### Requirement 2: Visual Indicators

**User Story:** As a developer, I want to see visual indicators for bookmarked lines in my editor, so that I can easily identify which lines have been bookmarked.

#### Acceptance Criteria

1. WHEN a line is bookmarked THEN the system SHALL display a bookmark emoji icon (📖) in the editor gutter next to the line number
2. WHEN a line is bookmarked THEN the system SHALL highlight the entire line with a distinctive background color
3. WHEN the editor is reopened THEN the system SHALL restore all visual indicators for existing bookmarks
4. WHEN a bookmark is removed THEN the system SHALL immediately remove the visual indicators from the editor
5. IF a file is modified and line numbers change THEN the system SHALL maintain visual indicators at the original line numbers

### Requirement 3: Tag-Based Organization

**User Story:** As a developer, I want to organize my bookmarks using custom tags, so that I can categorize and find bookmarks based on different criteria.

#### Acceptance Criteria

1. WHEN the user invokes "Add Bookmark with Tags" command THEN the system SHALL prompt the user to enter one or more tags
2. WHEN tags are entered THEN the system SHALL accept multiple tags separated by commas or spaces
3. WHEN a bookmark has no tags THEN the system SHALL assign it to an "untagged" group
4. WHEN the user invokes "Edit Bookmark Tags" command THEN the system SHALL allow modification of tags for existing bookmarks
5. WHEN tags are modified THEN the system SHALL update the bookmark's updatedAt timestamp
6. WHEN a tag is used THEN the system SHALL store it as a string in the tags array

### Requirement 4: Explorer View Integration

**User Story:** As a developer, I want to view all my bookmarks in a dedicated explorer panel, so that I can see an organized overview of all bookmarked locations.

#### Acceptance Criteria

1. WHEN the extension is activated THEN the system SHALL register a tree view provider in the explorer panel named "BOOKMARKS"
2. WHEN bookmarks exist THEN the system SHALL display them grouped by tags in the explorer view
3. WHEN a tag group is displayed THEN the system SHALL show the tag name with a folder icon (📁) and the count of bookmarks
4. WHEN a bookmark is displayed THEN the system SHALL show the bookmark title with a bookmark icon (📖)
5. WHEN the user clicks on a bookmark in the explorer THEN the system SHALL navigate to that file and line
6. WHEN the user invokes "Collapse All Groups" command THEN the system SHALL collapse all tag groups in the sidebar
7. WHEN the user invokes "Expand All Groups" command THEN the system SHALL expand all tag groups in the sidebar
8. WHEN bookmarks are added or removed THEN the system SHALL automatically refresh the explorer view

### Requirement 5: Navigation

**User Story:** As a developer, I want to quickly navigate to any bookmarked location, so that I can jump to important code sections without manual searching.

#### Acceptance Criteria

1. WHEN the user clicks a bookmark in the explorer view THEN the system SHALL open the file containing the bookmark
2. WHEN the file is opened THEN the system SHALL move the cursor to the exact line and column of the bookmark
3. WHEN the file is opened THEN the system SHALL reveal and focus the bookmarked line in the editor
4. WHEN the user invokes "Open Bookmark" command THEN the system SHALL display a quick pick list of all bookmarks
5. WHEN a bookmark is selected from the quick pick THEN the system SHALL navigate to that bookmark location
6. IF the bookmarked file no longer exists THEN the system SHALL display an error message to the user

### Requirement 6: Data Persistence

**User Story:** As a developer, I want my bookmarks to be saved automatically and persist between sessions, so that I don't lose my bookmarks when I close and reopen my workspace.

#### Acceptance Criteria

1. WHEN a bookmark is created, modified, or deleted THEN the system SHALL save the bookmark data to `.putra/bookmark.json` in the workspace root
2. WHEN the workspace is opened THEN the system SHALL load all bookmarks from `.putra/bookmark.json`
3. WHEN saving bookmark data THEN the system SHALL use JSON format with proper structure including bookmarks array and metadata object
4. WHEN saving bookmark data THEN the system SHALL include id, title, description, filePath, line, column, createdAt, updatedAt, and tags fields for each bookmark
5. WHEN saving metadata THEN the system SHALL include version, workspacePath, totalBookmarks, and lastModified fields
6. IF the bookmark file does not exist THEN the system SHALL create it with an empty bookmarks array
7. IF the bookmark file is corrupted THEN the system SHALL handle the error gracefully and initialize with empty data

### Requirement 7: Cross-Editor Compatibility

**User Story:** As a developer using various VS Code-based editors, I want the extension to work seamlessly across all compatible editors, so that I have a consistent bookmarking experience.

#### Acceptance Criteria

1. WHEN the extension is installed in any VS Code-based editor THEN the system SHALL function with full feature parity
2. WHEN using VS Code Extension API THEN the system SHALL only use APIs that are universally supported across VS Code variants
3. WHEN displaying icons THEN the system SHALL use emoji characters to ensure universal compatibility
4. WHEN the extension activates THEN the system SHALL work in Visual Studio Code, Cursor, Windsurf, Kiro IDE, Qoder, and other VS Code variants

### Requirement 8: Command Palette Integration

**User Story:** As a developer, I want to access all bookmark functions through the Command Palette, so that I can use keyboard shortcuts and quick commands without using the mouse.

#### Acceptance Criteria

1. WHEN the extension is activated THEN the system SHALL register all bookmark commands in the Command Palette
2. WHEN the user searches for "Bookmark" in Command Palette THEN the system SHALL display all available bookmark commands
3. WHEN commands are registered THEN the system SHALL include: "Add Bookmark", "Add Bookmark with Tags", "Open Bookmark", "Remove Bookmark", "Edit Bookmark Tags", "Clear All Bookmarks", "Collapse All Groups", and "Expand All Groups"
4. WHEN a command is invoked THEN the system SHALL execute the corresponding bookmark operation
