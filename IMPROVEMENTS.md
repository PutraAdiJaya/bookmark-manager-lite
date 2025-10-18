# Bookmark Manager Improvements

## Changes Made

### 1. Split Tree View into Two Sections

**TODO Bookmarks Section:**
- New view: "TODO Bookmarks" (`bookmarkTodoExplorer`)
- Displays only bookmarks tagged with "TODO"
- Appears above the main bookmarks section

**Regular Bookmarks Section:**
- Renamed to: "Bookmarks" (`bookmarkExplorer`)
- Displays all bookmarks EXCEPT those tagged with "TODO"
- Maintains all existing functionality

### 2. Search Button with Icon

- The search tree view button now displays with a search icon (`$(search)`)
- Works across both tree views simultaneously
- Searches both TODO and regular bookmarks

### 3. Toggle Bookmark Button

**New Command:** `bookmarkLite.toggleBookmark`
- Icon: Plus icon (`$(add)`)
- Location: Tree view title bar (navigation group)
- Functionality:
  - If no bookmark exists on the current line: **Adds** a new bookmark
  - If a bookmark already exists on the current line: **Removes** it
  - Shows confirmation message after each action

**Usage:**
1. Place cursor on any line in the editor
2. Click the plus icon in either tree view
3. Bookmark is added or removed automatically

## Files Modified

- `package.json` - Added new view, commands, and icons
- `src/extension.ts` - Registered new tree provider and command
- `src/views/BookmarkTreeProvider.ts` - Filtered out TODO bookmarks
- `src/commands/searchTreeView.ts` - Updated to work with both tree views

## Files Created

- `src/views/TodoBookmarkTreeProvider.ts` - New tree provider for TODO bookmarks
- `src/commands/toggleBookmark.ts` - New toggle bookmark command

## How to Test

1. Reload the extension (F5 or restart VS Code)
2. Add some bookmarks with "TODO" tag
3. Add some bookmarks without "TODO" tag
4. Verify two separate sections appear in the Explorer
5. Click the search icon to test search across both views
6. Click the plus icon to toggle bookmarks on/off
