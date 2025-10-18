# 🌍 Open VSX Registry Setup Guide

This guide helps you set up publishing to Open VSX Registry, the open-source alternative to VS Code Marketplace.

## 🎯 What is Open VSX?

Open VSX Registry is an open-source marketplace for VS Code extensions, used by:
- **VSCodium** - Open-source VS Code without Microsoft telemetry
- **Gitpod** - Cloud development environment
- **Eclipse Theia** - Cloud & Desktop IDE framework
- **Code-Server** - VS Code in the browser
- **Other VS Code-compatible editors**

## 📋 Prerequisites

1. GitHub account (for authentication)
2. Extension already published to VS Code Marketplace (optional but recommended)
3. VSIX package ready

## 🚀 Step-by-Step Setup

### Step 1: Create Open VSX Account

1. Go to <https://open-vsx.org/>
2. Click "Log in" in the top right
3. Sign in with your GitHub account
4. Accept the terms and conditions

### Step 2: Generate Access Token

1. After logging in, go to <https://open-vsx.org/user-settings/tokens>
2. Click "Generate New Token"
3. Give it a descriptive name (e.g., "Bookmark Manager Lite Publishing")
4. Copy the token immediately (you won't see it again!)
5. Store it securely

### Step 3: Install Open VSX CLI

```bash
# Install globally
npm install -g ovsx

# Verify installation
ovsx --version
```

### Step 4: Set Up Environment Variable

#### Linux/Mac

```bash
# Add to ~/.bashrc or ~/.zshrc
echo 'export OVSX_PAT=your-token-here' >> ~/.bashrc
source ~/.bashrc

# Or for current session only
export OVSX_PAT=your-token-here
```

#### Windows (PowerShell)

```powershell
# Permanent (requires admin)
[System.Environment]::SetEnvironmentVariable('OVSX_PAT', 'your-token-here', 'User')

# Or for current session only
$env:OVSX_PAT = "your-token-here"
```

#### Windows (CMD)

```cmd
# Permanent
setx OVSX_PAT "your-token-here"

# Or for current session only
set OVSX_PAT=your-token-here
```

### Step 5: Test Publishing

```bash
# Build your extension first
npm run vsce:package

# Test publish (dry run)
npx ovsx publish bookmark-manager-lite-1.0.5.vsix -p $OVSX_PAT --dry-run

# Actual publish
npx ovsx publish bookmark-manager-lite-1.0.5.vsix -p $OVSX_PAT
```

## 🔄 Publishing Workflow

### First Time Publishing

```bash
# 1. Build package
npm run vsce:package

# 2. Publish to Open VSX
npm run ovsx:publish
```

### Subsequent Updates

```bash
# 1. Update version in package.json
npm version patch

# 2. Build package
npm run vsce:package

# 3. Publish to both marketplaces
npm run publish:all
```

## 🤖 Automated Publishing with GitHub Actions

The repository includes a GitHub Actions workflow that automatically publishes to both marketplaces when you push a tag.

### Setup GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add two secrets:
   - `VSCE_PAT` - Your VS Code Marketplace token
   - `OVSX_PAT` - Your Open VSX token

### Trigger Automated Publishing

```bash
# Create and push a version tag
git tag v1.0.5
git push origin v1.0.5

# GitHub Actions will automatically:
# 1. Build the extension
# 2. Create VSIX package
# 3. Publish to VS Code Marketplace
# 4. Publish to Open VSX Registry
# 5. Create GitHub Release with VSIX attached
```

## 📊 Managing Your Extension

### View Your Extension

- **Open VSX**: <https://open-vsx.org/extension/PutraAdiJaya/bookmark-manager-lite>
- **Your Extensions**: <https://open-vsx.org/user-settings/extensions>

### Update Extension Details

1. Go to <https://open-vsx.org/user-settings/extensions>
2. Click on your extension
3. Update description, categories, or other metadata
4. Changes sync automatically

### Monitor Downloads

- Check your extension page for download statistics
- View trends over time
- Compare with VS Code Marketplace stats

## 🔧 Troubleshooting

### Error: "Authentication failed"

**Solution**: 
```bash
# Verify token is set
echo $OVSX_PAT  # Linux/Mac
echo %OVSX_PAT%  # Windows CMD
echo $env:OVSX_PAT  # Windows PowerShell

# If empty, set it again
export OVSX_PAT=your-token-here
```

### Error: "Extension already exists"

**Solution**: You can only publish each version once. Increment version number:
```bash
npm version patch
npm run vsce:package
npm run ovsx:publish
```

### Error: "Invalid VSIX file"

**Solution**: Rebuild the package:
```bash
npm run package
npm run vsce:package
```

### Publishing succeeds but extension not visible

**Solution**: 
- Wait a few minutes for indexing
- Check <https://open-vsx.org/user-settings/extensions>
- Verify extension is not marked as "unlisted"

## 🎯 Best Practices

### 1. Publish to Both Marketplaces

Always publish to both VS Code Marketplace and Open VSX to maximize reach:

```bash
npm run publish:all
```

### 2. Keep Versions in Sync

Ensure the same version is published to both marketplaces to avoid confusion.

### 3. Test Before Publishing

```bash
# Test locally first
code --install-extension bookmark-manager-lite-1.0.5.vsix

# Then publish
npm run publish:all
```

### 4. Use Semantic Versioning

- **Patch** (1.0.5 → 1.0.6): Bug fixes
- **Minor** (1.0.5 → 1.1.0): New features
- **Major** (1.0.5 → 2.0.0): Breaking changes

### 5. Update CHANGELOG

Always update CHANGELOG.md before publishing:

```markdown
## [1.0.6] - 2025-10-18
### Fixed
- Bug fix description
```

## 📚 Additional Resources

- [Open VSX Wiki](https://github.com/eclipse/openvsx/wiki)
- [Publishing Extensions Guide](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)
- [Open VSX CLI Documentation](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions#publishing-with-the-ovsx-cli)
- [VS Code Extension API](https://code.visualstudio.com/api)

## 🆘 Getting Help

- **Open VSX Issues**: <https://github.com/eclipse/openvsx/issues>
- **Community Chat**: <https://gitter.im/eclipse/openvsx>
- **Stack Overflow**: Tag questions with `open-vsx`

## ✅ Quick Checklist

- [ ] Open VSX account created
- [ ] Access token generated and saved
- [ ] `ovsx` CLI installed globally
- [ ] `OVSX_PAT` environment variable set
- [ ] Test publish successful
- [ ] GitHub secrets configured (for automation)
- [ ] Extension visible on Open VSX

---

**You're all set! 🎉**

Your extension will now be available to the entire open-source VS Code ecosystem!
