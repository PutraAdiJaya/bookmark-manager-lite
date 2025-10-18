# 🚀 Publishing Guide - Dual Marketplace Support

This guide covers publishing to both **VS Code Marketplace** (Microsoft) and **Open VSX Registry** (Open Source).

## 📋 Overview

### Why Publish to Both?

- **VS Code Marketplace**: Official Microsoft marketplace for VS Code
- **Open VSX Registry**: Open-source alternative for VSCodium, Gitpod, Eclipse Theia, and other VS Code-compatible editors

Publishing to both ensures maximum reach and supports the open-source community.

## 🔧 Prerequisites

### 1. Install Required Tools

```bash
# Install vsce (VS Code Extension Manager)
npm install -g @vscode/vsce

# Install ovsx (Open VSX CLI)
npm install -g ovsx
```

### 2. Create Accounts

#### VS Code Marketplace
1. Create a Microsoft account (if you don't have one)
2. Go to <https://marketplace.visualstudio.com/manage>
3. Create a publisher account
4. Generate a Personal Access Token (PAT):
   - Go to <https://dev.azure.com/>
   - Create an organization
   - User Settings → Personal Access Tokens
   - Create new token with "Marketplace (Manage)" scope

#### Open VSX Registry
1. Go to <https://open-vsx.org/>
2. Sign up with GitHub account
3. Go to <https://open-vsx.org/user-settings/tokens>
4. Generate a Personal Access Token

## 📦 Step-by-Step Publishing

### Step 1: Build the Package

```bash
# Build and create VSIX package
npm run vsce:package
```

This creates: `bookmark-manager-lite-1.0.5.vsix`

### Step 2: Test Locally (Recommended)

```bash
# Install the VSIX in VS Code
code --install-extension bookmark-manager-lite-1.0.5.vsix

# Or manually:
# 1. Open VS Code
# 2. Extensions panel (Ctrl+Shift+X)
# 3. Click "..." menu → "Install from VSIX..."
# 4. Select the .vsix file
```

### Step 3: Publish to VS Code Marketplace

#### Option A: Using CLI

```bash
# Login (first time only)
npx vsce login PutraAdiJaya

# Publish
npm run vsce:publish

# Or with version bump
npx vsce publish patch  # 1.0.5 → 1.0.6
npx vsce publish minor  # 1.0.5 → 1.1.0
npx vsce publish major  # 1.0.5 → 2.0.0
```

#### Option B: Manual Upload

1. Go to <https://marketplace.visualstudio.com/manage/publishers/PutraAdiJaya>
2. Click on your extension or "New Extension"
3. Upload `bookmark-manager-lite-1.0.5.vsix`
4. Fill in details and publish

### Step 4: Publish to Open VSX Registry

#### Option A: Using CLI

```bash
# Set your access token
export OVSX_PAT=your-open-vsx-token-here
# Windows:
set OVSX_PAT=your-open-vsx-token-here

# Publish
npm run ovsx:publish

# Or publish specific VSIX file
npx ovsx publish bookmark-manager-lite-1.0.5.vsix -p $OVSX_PAT
```

#### Option B: Manual Upload

1. Go to <https://open-vsx.org/>
2. Login to your account
3. Click "Publish" in the top menu
4. Upload `bookmark-manager-lite-1.0.5.vsix`
5. Confirm and publish

### Step 5: Publish to Both at Once

```bash
# Build once, publish to both marketplaces
npm run vsce:package
npm run publish:all
```

## 🔄 Update Workflow

When releasing a new version:

```bash
# 1. Update version in package.json
npm version patch  # or minor, or major

# 2. Update CHANGELOG.md with new changes

# 3. Commit changes
git add .
git commit -m "Release v1.0.6"
git tag v1.0.6
git push && git push --tags

# 4. Build package
npm run vsce:package

# 5. Publish to both marketplaces
npm run publish:all

# Or publish separately:
npm run vsce:publish  # VS Code Marketplace
npm run ovsx:publish  # Open VSX Registry
```

## 📝 Available NPM Scripts

```bash
# Building
npm run compile          # Compile TypeScript
npm run package          # Build for production
npm run vsce:package     # Create VSIX package

# Publishing
npm run vsce:publish     # Publish to VS Code Marketplace
npm run ovsx:publish     # Publish to Open VSX Registry
npm run publish:all      # Publish to both marketplaces

# Development
npm run watch            # Watch mode for development
npm run test             # Run tests
```

## 🌍 Where Your Extension Will Be Available

### VS Code Marketplace
- **VS Code** (Microsoft)
- **URL**: <https://marketplace.visualstudio.com/items?itemName=PutraAdiJaya.bookmark-manager-lite>

### Open VSX Registry
- **VSCodium** (Open-source VS Code)
- **Gitpod** (Cloud IDE)
- **Eclipse Theia** (Cloud & Desktop IDE)
- **Code-Server** (VS Code in browser)
- **Other VS Code-compatible editors**
- **URL**: <https://open-vsx.org/extension/PutraAdiJaya/bookmark-manager-lite>

## 🔐 Security Best Practices

### Storing Access Tokens

**Never commit tokens to Git!** Use environment variables:

```bash
# Linux/Mac - Add to ~/.bashrc or ~/.zshrc
export VSCE_PAT=your-vscode-marketplace-token
export OVSX_PAT=your-open-vsx-token

# Windows - Add to environment variables
setx VSCE_PAT "your-vscode-marketplace-token"
setx OVSX_PAT "your-open-vsx-token"
```

### Using Tokens in CI/CD

For GitHub Actions or other CI/CD:

```yaml
# .github/workflows/publish.yml
- name: Publish to VS Code Marketplace
  run: npx vsce publish -p ${{ secrets.VSCE_PAT }}

- name: Publish to Open VSX
  run: npx ovsx publish -p ${{ secrets.OVSX_PAT }}
```

## ✅ Pre-Publishing Checklist

- [ ] Version number updated in `package.json`
- [ ] CHANGELOG.md updated with new features
- [ ] README.md reflects current features
- [ ] All tests passing (`npm test`)
- [ ] Code compiles without errors (`npm run package`)
- [ ] VSIX package created successfully
- [ ] Extension tested locally
- [ ] Git repository up to date
- [ ] Git tag created for version
- [ ] VS Code Marketplace PAT ready
- [ ] Open VSX PAT ready (if publishing there)

## 🐛 Troubleshooting

### Error: "Missing publisher name"
**Solution**: Ensure `"publisher": "PutraAdiJaya"` is in package.json

### Error: "Invalid Personal Access Token"
**Solution**: 
- VS Code: Regenerate PAT with "Marketplace (Manage)" scope
- Open VSX: Check token at <https://open-vsx.org/user-settings/tokens>

### Error: "Extension already exists"
**Solution**: Increment version number in package.json

### Error: "OVSX_PAT not set"
**Solution**: Set environment variable: `export OVSX_PAT=your-token`

### Publishing to Open VSX fails
**Solution**: 
1. Verify account at <https://open-vsx.org/>
2. Check token is valid
3. Try manual upload first

## 📊 Post-Publishing

### Monitor Your Extension

- **VS Code Marketplace**: <https://marketplace.visualstudio.com/manage>
- **Open VSX**: <https://open-vsx.org/user-settings/extensions>

### Track Downloads & Ratings

- Check marketplace dashboards regularly
- Respond to user reviews and issues
- Update based on feedback

### Promote Your Extension

- Share on social media
- Add badges to README
- Submit to extension lists
- Write blog posts

## 🎯 Quick Reference

```bash
# Complete publishing workflow
npm version patch                    # Bump version
npm run vsce:package                 # Build VSIX
npm run vsce:publish                 # Publish to VS Code
npm run ovsx:publish                 # Publish to Open VSX

# Or all at once
npm version patch && npm run vsce:package && npm run publish:all
```

## 📚 Additional Resources

- [VS Code Publishing Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Open VSX Publishing Guide](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)
- [vsce Documentation](https://github.com/microsoft/vscode-vsce)
- [ovsx Documentation](https://github.com/eclipse/openvsx/wiki)

---

**Happy Publishing! 🎉**
