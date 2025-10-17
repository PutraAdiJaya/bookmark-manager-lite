# 📦 Packaging Guide

## Prerequisites

### Required:
- **Node.js v18+** or **v20 LTS** (Current: v14.10.0 - TOO OLD!)
- **npm** (comes with Node.js)
- **Git** (for repository)

### Check Current Versions:
```bash
node --version  # Should be v18+ or v20+
npm --version
```

## Step 1: Update Node.js

### Option A: Using NVM (Recommended)
```bash
# Install NVM if not installed
# Windows: https://github.com/coreybutler/nvm-windows

# Install Node.js v20 LTS
nvm install 20
nvm use 20

# Verify
node --version  # Should show v20.x.x
```

### Option B: Direct Download
1. Download Node.js v20 LTS from: https://nodejs.org/
2. Install and restart terminal
3. Verify: `node --version`

## Step 2: Clean Install Dependencies

```bash
# Remove old dependencies
rm -rf node_modules package-lock.json

# Or on Windows PowerShell:
Remove-Item -Recurse -Force node_modules, package-lock.json

# Fresh install
npm install
```

## Step 3: Create Icon (PNG Format)

VS Code Marketplace requires PNG format for icons. You need to convert `resources/icon.svg` to PNG:

### Option A: Online Converter
1. Go to: https://cloudconvert.com/svg-to-png
2. Upload `resources/icon.svg`
3. Set size to 128x128
4. Download as `icon.png`
5. Save to `resources/icon.png`

### Option B: Using ImageMagick
```bash
# Install ImageMagick first
# Then convert:
magick convert -background none -size 128x128 resources/icon.svg resources/icon.png
```

### Option C: Using Inkscape
```bash
inkscape resources/icon.svg --export-png=resources/icon.png --export-width=128 --export-height=128
```

## Step 4: Update package.json

Add icon path to package.json:
```json
{
  "icon": "resources/icon.png"
}
```

## Step 5: Build Extension

```bash
# Compile TypeScript and bundle
npm run package

# Should output: dist/extension.js
```

## Step 6: Package Extension

```bash
# Create VSIX package
npm run vsce:package

# Or directly:
npx vsce package

# Output: bookmark-manager-lite-0.0.1.vsix
```

## Step 7: Test Extension

### Option A: Test in Development
```bash
# Press F5 in VS Code
# Extension will run in Development Host
```

### Option B: Install VSIX Locally
```bash
# In VS Code:
# 1. Open Extensions panel (Ctrl+Shift+X)
# 2. Click "..." menu
# 3. Select "Install from VSIX..."
# 4. Choose bookmark-manager-lite-0.0.1.vsix
```

## Step 8: Publish to Marketplace

### Prerequisites:
1. Create Microsoft account
2. Create Azure DevOps organization
3. Generate Personal Access Token (PAT)
4. Create publisher account

### Publish:
```bash
# Login (first time only)
npx vsce login <publisher-name>

# Publish
npx vsce publish

# Or with version bump:
npx vsce publish patch  # 0.0.1 -> 0.0.2
npx vsce publish minor  # 0.0.1 -> 0.1.0
npx vsce publish major  # 0.0.1 -> 1.0.0
```

## Troubleshooting

### Error: "Cannot find module 'node:events'"
**Solution**: Update Node.js to v18+ or v20+

### Error: "SVGs are restricted in README.md"
**Solution**: Already fixed! We removed SVG references from README.

### Error: "Missing icon"
**Solution**: Convert icon.svg to icon.png and add to package.json

### Error: "Publisher not found"
**Solution**: Add `"publisher": "YourPublisherName"` to package.json

## Quick Commands Reference

```bash
# Development
npm run compile          # Compile TypeScript
npm run watch           # Watch mode
npm run test            # Run tests

# Production
npm run package         # Build for production
npm run vsce:package    # Create VSIX

# Publishing
npx vsce login          # Login to marketplace
npx vsce publish        # Publish extension
npx vsce package        # Create VSIX only
```

## Checklist Before Publishing

- [ ] Node.js v18+ or v20+ installed
- [ ] All dependencies installed (`npm install`)
- [ ] Code compiles without errors (`npm run package`)
- [ ] Icon converted to PNG format
- [ ] README has no SVG images
- [ ] Publisher name added to package.json
- [ ] Repository URL is correct
- [ ] License file exists
- [ ] Extension tested locally (F5)
- [ ] VSIX package created successfully
- [ ] Personal Access Token (PAT) ready

## Current Status

✅ Code: Production-ready
✅ Build: Success
✅ README: Fixed (no SVG)
✅ package.json: Updated
⚠️ Node.js: Need v18+ (current: v14.10.0)
⚠️ Icon: Need PNG format
⚠️ Publisher: Need to add to package.json

## Next Steps

1. **Update Node.js to v20 LTS**
2. **Convert icon.svg to icon.png**
3. **Add publisher name to package.json**
4. **Run `npm run vsce:package`**
5. **Test VSIX locally**
6. **Publish to marketplace**

---

**Need Help?**
- VS Code Publishing Guide: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- vsce Documentation: https://github.com/microsoft/vscode-vsce
