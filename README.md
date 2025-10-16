# Bookmark Manager Lite

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/bookmark-manager-lite)](https://marketplace.visualstudio.com/items?itemName=bookmark-manager-lite)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/bookmark-manager-lite)](https://marketplace.visualstudio.com/items?itemName=bookmark-manager-lite)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A lightweight and intuitive bookmark manager extension for Visual Studio Code and compatible editors that helps you organize and manage your bookmarks directly from the explorer view. Perfect for developers who need to quickly navigate between important code locations across large projects.

## 🔧 Compatibility

This extension works seamlessly across all VS Code-based editors:

- ✅ **Visual Studio Code** - Full support
- ✅ **Cursor** - Full support  
- ✅ **Windsurf** - Full support
- ✅ **Kiro IDE** - Full support
- ✅ **Qoder** - Full support
- ✅ **Other VS Code variants** - Compatible with any editor using VS Code Extension API

## ✨ Features

- 📍 **Quick Bookmarking** - Add bookmarks at any line number with a simple command
- 🎯 **Visual Indicators** - Bookmarked lines display with emoji icons in the gutter and highlighted background
- ✨ **Non-Intrusive** - Virtual highlighting that doesn't modify your actual code
- 🗂️ **Explorer Integration** - View all bookmarks in a dedicated explorer panel
- 🚀 **Fast Navigation** - One-click navigation to any bookmarked location
- 💾 **Persistent Storage** - Bookmarks are saved per workspace and persist between sessions
- 🏷️ **Smart Labels** - Automatically generates meaningful bookmark names based on context
- 🔍 **Search & Filter** - Quickly find bookmarks in large projects using substring matching
- 📁 **Workspace Scoped** - Bookmarks are organized per workspace for better project management
- 📂 **Smart Grouping** - Bookmarks are automatically grouped by tags in the sidebar for better organization
- 🏷️ **Custom Tags** - Create your own tags and assign multiple tags to each bookmark
- 📋 **Flexible Organization** - Organize bookmarks with any tag names that fit your workflow
- 📊 **Statistics Dashboard** - View analytics about your bookmark usage
- 🔄 **Export/Import** - Backup and restore your bookmarks
- ✅ **Validation** - Check if bookmarked files still exist
- 🔧 **Advanced Search** - Search bookmarks directly in the tree view
- 📝 **Inline Titles** - See bookmark titles at the beginning of bookmarked lines in the code editor (non-editable overlay)
- 🔢 **Sequential Tag-Based Numbering** - Bookmarks are numbered with unique sequential letters for each tag group (A, B, C, etc.)
- 🎨 **Numbered Gutter Icons** - Bookmark numbers are displayed directly on the gutter icons for quick visual reference

## 🚀 Getting Started

### Installation

**For VS Code & Variants (Cursor, Windsurf, Kiro, Qoder):**

1. Open your editor (VS Code, Cursor, Windsurf, Kiro, or Qoder)
2. Go to Extensions panel (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Bookmark Manager Lite"
4. Click Install

**Alternative Installation:**
- Download from VS Code Marketplace and install manually
- Compatible with any editor supporting VS Code Extension API

### Basic Usage

1. **Add a Bookmark**
   - Place your cursor on any line in your code.
   - Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
   - Type "**Bookmark.Putra: Add Bookmark**" and press Enter.
   - The line will be highlighted with a distinctive color and show a numbered bookmark icon in the gutter
   - Your bookmark appears in the Bookmarks explorer view with a unique sequential letter code
   - A numbered "Bookmark: [title]" indicator appears at the beginning of the bookmarked line (as a non-editable overlay)

2. **Visual Feedback**
   - Bookmarked lines are highlighted with a bright background color
   - A numbered bookmark emoji icon (📖) appears in the editor gutter next to the line number
   - Each tag group is assigned a unique sequential letter (A, B, C, etc.) 
   - Bookmarks within each group are numbered sequentially (1, 2, 3, etc.)
   - A tag-based numbered "Bookmark: [title]" indicator appears at the beginning of bookmarked lines (gray, non-editable text overlay)
   - Uses emoji icons with embedded numbers for universal compatibility - no additional assets required
   - Visual indicators persist across VS Code sessions
   - No changes are made to your actual code - it's purely visual

3. **Navigate to Bookmarks**
   - Open the **Bookmark Putra** panel in the Explorer view.
   - Click on any bookmark to jump directly to that location.
   - Use the "**Bookmark.Putra: Open Bookmark**" command for quick access via the Command Palette.

4. **Organize with Custom Tags & Groups**
   - Create your own custom tags when adding bookmarks (e.g., "auth", "api", "bug-fix", "todo")
   - Assign multiple tags to a single bookmark for flexible categorization
   - Bookmarks are automatically grouped by their tags in the sidebar
   - Each tag group is assigned a unique sequential letter code (A for first tag, B for second tag, C for third tag, etc.)
   - Bookmarks within each group are numbered sequentially
   - Each tag group is collapsible for better organization
   - Example sidebar structure with custom tags:
     ```
     📂 BOOKMARKS
     ├── 📁 auth (3)
     │   ├── A1. 📖 User Login Function
     │   ├── A2. 📖 Password Validation
     │   └── A3. 📖 JWT Token Handler
     ├── 🐞 bug-fix (2)
     │   ├── B1. 🐞 Memory Leak Fix
     │   └── B2. 📖 Null Pointer Check
     ├── 📁 todo (4)
     │   ├── C1. 📖 Refactor This Function
     │   ├── C2. 📖 Add Error Handling
     │   ├── C3. 📖 Optimize Query
     │   └── C4. 📖 Update Documentation
     └── 📁 untagged (1)
         └── D1. 📖 Main Entry Point
     ```

## 📋 Commands

| Command | Description | Default Keybinding |
|------------------------------------------|----------------------------------------------|--------------------|
| `Bookmark.Putra: Add Bookmark`           | Add a bookmark at the current cursor position. | `Ctrl+Shift+B`     |
| `Bookmark.Putra: Add Bookmark with Tags` | Add a bookmark with custom tags for organization. | `Ctrl+Shift+T`     |
| `Bookmark.Putra: Open Bookmark`          | Open and navigate to a bookmark from your list. | -                  |
| `Bookmark.Putra: Remove Bookmark`        | Remove the selected bookmark.                  | -                  |
| `Bookmark.Putra: Edit Bookmark Tags`     | Modify tags for existing bookmarks.            | -                  |
| `Bookmark.Putra: Clear All Bookmarks`    | Remove all bookmarks from current workspace.   | -                  |
| `Bookmark.Putra: Collapse All Groups`    | Collapse all tag groups in the sidebar.      | -                  |
| `Bookmark.Putra: Expand All Groups`      | Expand all tag groups in the sidebar.        | -                  |
| `Bookmark.Putra: Search Bookmarks`       | Search bookmarks by substring matching title, description, file or tags. | `Ctrl+Shift+F`     |
| `Bookmark.Putra: Search Tree View`       | Search bookmarks directly in the explorer view. | -                  |
| `Bookmark.Putra: Export Bookmarks`       | Export all bookmarks to a JSON file.         | -                  |
| `Bookmark.Putra: Import Bookmarks`       | Import bookmarks from a JSON file.           | -                  |
| `Bookmark.Putra: Validate Bookmarks`     | Check if bookmarked files still exist.       | -                  |
| `Bookmark.Putra: Show Statistics`        | View analytics about your bookmark usage.    | -                  |

## 💾 Data Storage

Bookmarks are stored locally in your workspace using a simple JSON structure:

**File Location:** `.putra/bookmark.json`

**Data Structure:**
```json
{
  "bookmarks": [
    {
      "id": "bookmark-001",
      "title": "User Authentication Function",
      "description": "Main login validation logic with error handling",
      "filePath": "src/auth/login.js",
      "line": 45,
      "column": 12,
      "createdAt": "2024-10-14T10:30:00Z",
      "updatedAt": "2024-10-14T10:30:00Z",
      "tags": ["auth", "validation", "security"]
    }
  ],
  "metadata": {
    "version": "1.0.0",
    "workspacePath": "/path/to/workspace",
    "totalBookmarks": 1,
    "lastModified": "2024-10-14T10:30:00Z"
  }
}
```

**Field Descriptions:**
- `id`: Unique identifier for each bookmark
- `title`: User-friendly bookmark name
- `description`: Detailed description of the bookmarked location
- `filePath`: Relative path to the file
- `line` & `column`: Exact cursor position
- `tags`: Array of custom tags for categorization and search (e.g., ["auth", "security", "todo"])
- `createdAt` & `updatedAt`: Timestamp tracking

**Custom Tag Examples:**
- **Feature-based**: `auth`, `api`, `database`, `ui`, `utils`
- **Status-based**: `todo`, `bug-fix`, `review`, `optimize`, `deprecated`
- **Priority-based**: `critical`, `high`, `medium`, `low`
- **Team-based**: `frontend`, `backend`, `devops`, `qa`
- **Project-based**: `v1.0`, `v2.0`, `hotfix`, `experimental`

## 🎨 Visual Enhancements

**Modern Icon Design**
- Beautiful gradient-based extension icon with purple and gold colors
- Professional bookmark ribbon design with depth and shadow effects
- Optimized for visibility at all sizes (16px to 128px)

**Numbered Bookmark Icons**
- Each bookmark displays a unique number directly on its icon
- Numbers are embedded in the icon for quick visual reference
- Automatic theme adaptation (light/dark mode support)
- Efficient icon caching for optimal performance
- Numbers update automatically when bookmarks are added or removed

**Smart Numbering System**
- Sequential numbering within each tag group (1, 2, 3...)
- Tag-based prefixes for easy identification (A1, B1, C1...)
- Visual consistency across all bookmark items
- No configuration needed - works out of the box

## 🎨 Design Philosophy

**Emoji Icons for Simplicity**
- Uses emoji icons (📖, 📂, 🏷️) for universal compatibility
- No additional image assets required - keeps extension lightweight
- Works consistently across all platforms and themes
- Instantly recognizable and accessible

## ⚙️ Configuration

The extension works out of the box with sensible defaults. Future versions will include customizable settings for:

- Bookmark naming conventions
- Explorer view behavior
- Keyboard shortcuts
- Export/import functionality
- Custom emoji icon selection

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

If you encounter any issues or have feature requests, please open an issue on GitHub.

## 📈 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

## Requirements

- Any VS Code-based editor (VS Code, Cursor, Windsurf, Kiro IDE, Qoder, etc.)
- No additional dependencies required - just install and start using!

## Extension Settings

This extension is designed to be simple and lightweight, with no configuration required.

## Known Issues

None at this time.

## Release Notes

### 0.0.1

Initial release of Bookmark Manager Lite:
- Basic bookmark functionality
- Explorer view integration
- Add and open bookmark commands

---
**Enjoy bookmarking!**