# Change Log

All notable changes to the "Bookmark Manager Lite" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.0.7] - 2025-10-19

### 📦 Package Optimization

- Excluded `.putra/` folder from extension package (user data folder, created automatically)
- Excluded unnecessary markdown documentation files from package
- Excluded `image.png` screenshot from package
- Reduced package size for faster installation
- Demo folder now properly included for user reference

## [1.0.6] - 2025-10-19

### 🔥 Visual Enhancements

- **Fire Icons for TODO** - All TODO bookmarks now use distinctive fire gradient icons (red → orange → yellow)
- **Consistent Fire Design** - Fire icons appear in tree view items, gutter decorations, and tag groups
- **Better Visual Distinction** - Instant recognition of TODO items vs regular bookmarks
- **Theme-Adaptive Fire** - Fire gradient adjusts for light and dark themes

### 📁 Demo Content

- **Complete Demo Project** - Added 8 TypeScript demo files showcasing real-world usage
- **20 Sample Bookmarks** - Pre-configured bookmarks demonstrating all features
- **9 TODO Examples** - Various TODO bookmarks (bugs, enhancements, security, performance)
- **11 Regular Bookmarks** - Examples of different tag types (important, api, model, utility, etc.)
- **Multiple Tag Groups** - Demonstrates 9 different tag categories with unique colors
- **Demo Documentation** - README in demo folder explaining all features

### 🎨 Icon Improvements

- **TodoIconGenerator** - New dedicated generator for fire-themed TODO icons
- **Fire Tag Icons** - Tag group headers for TODO also use fire icons with letters
- **Circle Fire Design** - Clean circular fire gradient for modern look
- **Numbered Fire Icons** - Fire icons with embedded numbers (A1, A2, A3...)

### 🔧 Technical Changes

- Added `TodoIconGenerator.ts` with fire gradient generation
- Added `generateTodoTagIcon()` method for tag group fire icons
- Updated `DecorationManager` to use fire icons for TODO bookmarks in gutter
- Updated `TodoBookmarkTreeProvider` to use fire icons throughout
- Enhanced `getNumberedDecorationType()` with `isTodo` parameter
- Improved icon caching for fire icons

### 📦 Package Improvements

- Demo files included in extension package (`.putra/` excluded, `demo/` included)
- Updated `.vscodeignore` to include demo content
- Fixed TypeScript compilation to exclude demo folder
- Added `include` and `exclude` to `tsconfig.json`

## [1.0.5] - 2025-10-18

### ✨ New Features

- **Separate TODO Section** - TODO bookmarks now appear in their own dedicated "TODO Bookmarks" section
- **Split Tree View** - Main "Bookmarks" section displays all non-TODO bookmarks for better organization
- **Toggle Bookmark Button** - New plus icon (+) button in tree view toolbar to quickly add/remove bookmarks on current line
- **Icon-Based Search** - Search button now displays with a proper search icon (🔍) for better visual clarity
- **Add TODO from Context Menu** - Right-click in editor to quickly add TODO bookmarks (auto-tagged)
- **Edit Bookmark Details** - Edit bookmark title and description directly from the tree view context menu

### 🎯 Improvements

- Enhanced tree view organization with automatic TODO separation
- Faster bookmark toggling without opening command palette
- Improved visual hierarchy with dedicated sections
- Better workflow for managing TODO items separately from regular bookmarks
- Quick TODO bookmark creation from editor context menu

### 🔧 Technical Changes

- Added `TodoBookmarkTreeProvider` for dedicated TODO bookmark management
- Created `toggleBookmark` command for one-click bookmark add/remove
- Created `addTodoBookmark` command for quick TODO creation
- Updated tree view filtering to exclude TODO from main section
- Enhanced search functionality to work across both tree views
- Added editor context menu integration for TODO bookmarks
- Added `editBookmarkDetails` command for editing title and description

## [1.0.0] - 2025-10-17

### 🎉 Initial Release - Production Ready

#### ✨ Core Features

- **Professional Bookmark Management** - Complete bookmark system for VS Code
- **Multi-Color Icons** - 26 unique gradient colors for tag groups (A-Z)
- **Smart Numbering** - Tag-based sequential numbering (A1, A2, B1, B2...)
- **Numbered Gutter Icons** - See bookmark numbers directly in editor
- **Custom Tags** - Unlimited tags for flexible organization
- **Fast Navigation** - One-click jump to any bookmarked location
- **Persistent Storage** - Bookmarks saved per workspace (`.putra/bookmark.json`)

#### 🎨 Visual Excellence

- Modern gradient-based extension icon with purple and gold colors
- Numbered bookmark icons with embedded numbers for quick visual reference
- Automatic theme adaptation for light and dark modes
- Beautiful colored folder icons for tag groups
- Smooth gradient effects on all icons
- Professional visual hierarchy

#### 🚀 Performance & Optimization

- High-performance icon caching (500 icons)
- Debounced decoration refresh (100ms)
- Optimized for 1000+ bookmarks
- Efficient SVG generation
- Smart memory management
- Zero lag or stuttering

#### 🔧 Advanced Features

- **Export/Import** - Backup and restore bookmarks
- **Statistics Dashboard** - View bookmark analytics
- **Validation Tools** - Check if files still exist
- **Advanced Search** - Substring matching across all fields
- **Inline Titles** - See bookmark names at line start
- **Command Palette** - Full VS Code integration
- **Keyboard Shortcuts** - Quick access hotkeys

#### 🌐 Cross-Platform Support

- Visual Studio Code - Full support
- Cursor - Full support
- Windsurf - Full support
- Kiro IDE - Full support
- Qoder - Full support
- All VS Code variants - 100% compatible

#### 📝 Documentation

- Comprehensive README with examples
- Professional marketplace presentation
- Complete packaging guide
- Troubleshooting documentation
- 20 SEO-optimized keywords

#### 🔨 Technical Implementation

- TypeScript with strict type checking
- ESBuild for fast bundling
- Comprehensive test suite
- IconGenerator utility for dynamic SVG icons
- TagIconGenerator for colored folder icons
- Theme change detection and cache management
- Enhanced BookmarkTreeProvider with numbering logic
- Updated BookmarkTreeItem for numbered icons
- DecorationManager with debouncing

#### 🎯 What Makes Us Different

- 26 unique colors vs single color in other extensions
- Smart tag-based numbering vs no numbering
- Numbers embedded in icons vs plain icons
- Unlimited colored tag groups vs limited tags
- Optimized for 1000+ bookmarks vs slower performance
- Beautiful gradient icons vs basic icons
- Zero configuration vs setup required
- Works on all VS Code variants vs VS Code only

---

## [0.0.1] - Development

### Initial Development

- Basic bookmark functionality
- Explorer view integration
- Add and open bookmark commands
- Tag-based organization
- Search and filter capabilities
- Export/import functionality
- Statistics dashboard
- Validation tools

---

**Full Changelog**: <https://github.com/PutraAdiJaya/bookmark-manager-lite/commits/v1.0.0>
