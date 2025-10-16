# Implementation Plan

- [x] 1. Update extension icon with modern design


  - Replace current icon.svg with new gradient-based design
  - Implement purple gradient background (#667eea → #764ba2)
  - Create bookmark ribbon shape with gold-to-blue gradient (#ffd89b → #19547b)
  - Add shadow effects and depth using SVG filters
  - Add decorative lines on ribbon for detail
  - Test icon appearance at multiple sizes (16px, 32px, 64px, 128px)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_



- [ ] 2. Create IconGenerator utility
  - [ ] 2.1 Create IconGenerator class structure
    - Create `src/utils/IconGenerator.ts` file
    - Define IconGeneratorOptions interface with number, theme, and size properties
    - Implement IconGenerator class with private cache Map


    - Implement constructor to initialize empty cache
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ] 2.2 Implement SVG generation for numbered icons
    - Implement generateSVG() private method
    - Create SVG template with bookmark shape
    - Add gradient definitions based on theme
    - Position number text in center of icon


    - Adjust font size based on number length (single digit: 11px, double digit: 9px, 99+: 7px)
    - Handle numbers > 99 by displaying "99+"
    - Write unit tests for SVG generation with different numbers
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.7_



  - [ ] 2.3 Implement data URI conversion
    - Implement svgToDataUri() private method
    - Convert SVG string to base64 encoding
    - Create data URI with proper format: `data:image/svg+xml;base64,${base64}`
    - Write unit tests for data URI conversion
    - _Requirements: 3.1, 3.5_


  - [ ] 2.4 Implement caching mechanism
    - Implement getCacheKey() private method using format `${number}-${theme}`
    - Implement generateNumberedIcon() public method
    - Check cache before generating new icon
    - Store generated icons in cache
    - Return cached icon if available


    - Write unit tests for cache hit and miss scenarios
    - _Requirements: 3.6, 4.1, 4.2_

  - [ ] 2.5 Implement cache management
    - Implement clearCache() public method
    - Write unit tests for cache clearing
    - Test cache size limits (max 200 entries)
    - _Requirements: 4.1, 4.2_



- [ ] 3. Modify BookmarkTreeItem to support numbered icons
  - [ ] 3.1 Update BookmarkTreeItem constructor
    - Add optional `number` parameter to constructor



    - Add optional `numberedIcon` parameter to constructor
    - Modify title to include number prefix when number is provided: `${number}. ${title}`
    - Use numberedIcon for iconPath if provided, otherwise use default ThemeIcon
    - Convert numberedIcon string to vscode.Uri for iconPath


    - Write unit tests for BookmarkTreeItem with and without numbering
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.5, 5.5_

- [ ] 4. Modify BookmarkTreeProvider to generate numbered icons
  - [ ] 4.1 Add IconGenerator to BookmarkTreeProvider
    - Import IconGenerator class
    - Add private iconGenerator property
    - Initialize IconGenerator in constructor


    - _Requirements: 3.1, 3.6_

  - [ ] 4.2 Implement theme detection
    - Implement getCurrentTheme() private method
    - Use vscode.window.activeColorTheme.kind to detect theme
    - Return 'light' or 'dark' based on theme kind

    - Write unit tests for theme detection
    - _Requirements: 4.3_

  - [ ] 4.3 Update getChildren to add numbering
    - Modify bookmark mapping in getChildren() method
    - Calculate sequential number for each bookmark (index + 1)


    - Generate numbered icon using iconGenerator.generateNumberedIcon()
    - Pass number and icon to BookmarkTreeItem constructor
    - Ensure numbering starts from 1 for each tag group
    - Handle search mode to maintain numbering
    - Write unit tests for numbering logic
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 4.4 Implement theme change handling

    - Subscribe to vscode.window.onDidChangeActiveColorTheme event
    - Clear icon cache when theme changes
    - Refresh tree view to regenerate icons with new theme
    - Add subscription to context.subscriptions for cleanup
    - Write integration tests for theme change
    - _Requirements: 4.3, 4.4_


- [ ] 5. Update extension.ts to wire theme change handling
  - Register theme change listener in activate() function
  - Pass context.subscriptions to tree provider for proper cleanup
  - Ensure theme change listener is disposed on deactivation
  - _Requirements: 4.3, 5.3_

- [x] 6. Write comprehensive tests

  - [ ] 6.1 Unit tests for IconGenerator
    - Test single digit icon generation (1-9)
    - Test double digit icon generation (10-99)
    - Test overflow icon generation (100+)
    - Test light theme icon generation
    - Test dark theme icon generation
    - Test cache functionality


    - Test cache clearing
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ] 6.2 Unit tests for numbering logic
    - Test sequential numbering within tag groups


    - Test numbering starts from 1 for each group
    - Test numbering updates when bookmarks added
    - Test numbering updates when bookmarks removed
    - Test numbering with multiple tag groups
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ] 6.3 Integration tests for visual enhancements
    - Test complete flow: add bookmark → see numbered item with icon
    - Test theme switching → icons regenerate correctly
    - Test bookmark deletion → numbers update correctly
    - Test bookmark addition → numbers update correctly
    - Test tag changes → numbers reset in new group
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.6, 4.3, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 6.4 Visual regression tests
    - Test extension icon appearance at different sizes
    - Test numbered icons in light theme
    - Test numbered icons in dark theme
    - Test numbered icons with different number ranges
    - Verify icon visibility and readability
    - _Requirements: 1.4, 3.4, 4.3, 4.4, 4.5_

- [ ] 7. Update documentation
  - Update README.md with screenshots of new icon
  - Add section about numbered bookmarks feature
  - Update CHANGELOG.md with visual enhancement details
  - Document that no configuration is needed
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 8. Performance testing and optimization
  - Test icon generation performance with 100+ bookmarks
  - Verify cache is working correctly
  - Test memory usage with large number of bookmarks
  - Optimize SVG generation if needed
  - Test tree view refresh performance
  - _Requirements: 3.6, 4.1, 4.2_
