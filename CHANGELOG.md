# Change Log

All notable changes to the "bookmark-manager-lite" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Added
- **Visual Enhancements**
  - Modern gradient-based extension icon with purple and gold colors
  - Numbered bookmark icons with embedded numbers for quick visual reference
  - Automatic theme adaptation for light and dark modes
  - Smart numbering system with tag-based prefixes (A1, B1, C1...)
  - Efficient icon caching for optimal performance
  
### Changed
- Extension icon redesigned with modern bookmark ribbon style
- Bookmark items now display sequential numbers within tag groups
- Icons now show numbers directly on the bookmark symbol

### Technical
- Added IconGenerator utility for dynamic SVG icon generation
- Implemented theme change detection and icon cache management
- Enhanced BookmarkTreeProvider with numbering logic
- Updated BookmarkTreeItem to support numbered icons

## [0.0.1] - Initial Release

- Basic bookmark functionality
- Explorer view integration
- Add and open bookmark commands
- Tag-based organization
- Search and filter capabilities
- Export/import functionality
- Statistics dashboard
- Validation tools