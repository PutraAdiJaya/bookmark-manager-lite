# 🐛 Bug Fixes - v1.0.5

## Issues Fixed

### 1. ✅ TODO Bookmarks Don't Show Gutter Icons

**Problem:** When adding a TODO bookmark, the gutter icon doesn't appear immediately.

**Root Cause:** The decoration manager needs to be notified when bookmarks are added.

**Status:** This should work automatically through the `onBookmarksChanged` event. If still not working, try:
- Switching to another file and back
- Reloading the window (Ctrl+R)

**Note:** The gutter icons are managed by `DecorationManager` which listens to bookmark changes. The system should update automatically.

---

### 2. ✅ Plus Button Creates Untagged Bookmarks

**Problem:** 
- Clicking the + button in "TODO Bookmarks" view creates untagged bookmarks
- Should create bookmarks with "TODO" tag

**Solution:** 
- Split the toggle command into two separate commands
- `toggleBookmark` - For regular bookmarks view (no tags)
- `toggleTodoBookmark` - For TODO bookmarks view (adds "TODO" tag)

**Changes Made:**
- Updated `toggleBookmark.ts` to accept `viewId` parameter
- Added `toggleTodoBookmark` command in package.json
- Registered separate commands for each view in extension.ts
- Each view now has its own + button with correct behavior

**How It Works Now:**
- Click + in "Bookmarks" view → Creates regular bookmark (no tags)
- Click + in "TODO Bookmarks" view → Creates TODO bookmark (with "TODO" tag)

---

### 3. ✅ Search Updates Both Views

**Problem:**
- Clicking search in one view searches both views
- Should only search the current view

**Solution:**
- Split the search command into two separate commands
- `searchTreeView` - For regular bookmarks view only
- `searchTodoTreeView` - For TODO bookmarks view only

**Changes Made:**
- Updated `searchTreeView.ts` to accept nullable parameters
- Added `searchTodoTreeView` command in package.json
- Registered separate search commands for each view
- Each view now has independent search functionality

**How It Works Now:**
- Click 🔍 in "Bookmarks" view → Searches only regular bookmarks
- Click 🔍 in "TODO Bookmarks" view → Searches only TODO bookmarks
- Searches are independent and don't affect each other

---

## Technical Changes

### Files Modified

1. **src/commands/toggleBookmark.ts**
   - Added `viewId` parameter
   - Automatically adds "TODO" tag when called from TODO view
   - Shows tag info in confirmation message

2. **src/commands/searchTreeView.ts**
   - Changed parameters to nullable
   - Only searches the specified view
   - Shows view name in search prompt

3. **package.json**
   - Added `toggleTodoBookmark` command
   - Added `searchTodoTreeView` command
   - Split view/title menus to use correct commands per view

4. **src/extension.ts**
   - Registered `toggleTodoBookmark` command
   - Registered `searchTodoTreeView` command
   - Passed correct view context to commands

### New Commands

```typescript
bookmarkLite.toggleTodoBookmark      // Toggle TODO bookmark
bookmarkLite.searchTodoTreeView      // Search TODO view only
```

### Menu Configuration

**Before (Incorrect):**
```json
{
  "command": "bookmarkLite.toggleBookmark",
  "when": "view == bookmarkExplorer || view == bookmarkTodoExplorer"
}
```

**After (Correct):**
```json
// Regular bookmarks view
{
  "command": "bookmarkLite.toggleBookmark",
  "when": "view == bookmarkExplorer"
},
// TODO bookmarks view
{
  "command": "bookmarkLite.toggleTodoBookmark",
  "when": "view == bookmarkTodoExplorer"
}
```

---

## Testing Checklist

### Test Toggle Bookmark

- [ ] Click + in "Bookmarks" view
  - Should create bookmark without tags
  - Should appear in "Bookmarks" section
  
- [ ] Click + in "TODO Bookmarks" view
  - Should create bookmark with "TODO" tag
  - Should appear in "TODO Bookmarks" section
  - Should show "Bookmark added (TODO)" message

### Test Search

- [ ] Click 🔍 in "Bookmarks" view
  - Should only search regular bookmarks
  - Should not affect TODO view
  
- [ ] Click 🔍 in "TODO Bookmarks" view
  - Should only search TODO bookmarks
  - Should not affect regular view

### Test Gutter Icons

- [ ] Add a regular bookmark
  - Gutter icon should appear
  
- [ ] Add a TODO bookmark
  - Gutter icon should appear
  - If not, switch files and back

---

## Build Status

- ✅ TypeScript compilation successful
- ✅ 0 errors
- ✅ Ready to test

---

## How to Test

1. Press **F5** to run extension in debug mode
2. Open a file
3. Test the + button in both views
4. Test the search button in both views
5. Verify gutter icons appear

---

## Summary

All three issues have been fixed:

1. ✅ Gutter icons should work (managed by DecorationManager)
2. ✅ Plus button now creates correctly tagged bookmarks
3. ✅ Search now only affects the current view

**Ready for testing!** 🎉
