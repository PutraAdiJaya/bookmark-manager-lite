# GitHub Actions Workflows

## 📋 Available Workflows

### Publish Extension (`publish.yml`)

Automatically publishes the extension to both VS Code Marketplace and Open VSX Registry when a version tag is pushed.

#### Triggers
- Push of tags matching `v*` (e.g., `v1.0.5`, `v2.0.0`)

#### What It Does
1. ✅ Checks out the code
2. ✅ Sets up Node.js 20
3. ✅ Installs dependencies
4. ✅ Builds the extension
5. ✅ Creates VSIX package
6. ✅ Publishes to VS Code Marketplace
7. ✅ Publishes to Open VSX Registry
8. ✅ Uploads VSIX as artifact
9. ✅ Creates GitHub Release with VSIX attached

## 🔐 Required Secrets

Configure these in: **Settings → Secrets and variables → Actions**

### `VSCE_PAT`
- **Description**: Personal Access Token for VS Code Marketplace
- **How to get**:
  1. Go to https://dev.azure.com/
  2. Create organization (if needed)
  3. User Settings → Personal Access Tokens
  4. Create token with "Marketplace (Manage)" scope
  5. Copy and save as GitHub secret

### `OVSX_PAT`
- **Description**: Personal Access Token for Open VSX Registry
- **How to get**:
  1. Go to https://open-vsx.org/
  2. Sign in with GitHub
  3. Go to https://open-vsx.org/user-settings/tokens
  4. Generate new token
  5. Copy and save as GitHub secret

## 🚀 Usage

### Automatic Publishing

```bash
# 1. Update version in package.json
npm version patch  # or minor, or major

# 2. Commit changes
git add .
git commit -m "Release v1.0.6"

# 3. Create and push tag
git tag v1.0.6
git push origin v1.0.6

# 4. GitHub Actions automatically:
#    - Builds extension
#    - Publishes to VS Code Marketplace
#    - Publishes to Open VSX
#    - Creates GitHub Release
```

### Manual Trigger

You can also manually trigger the workflow from the Actions tab in GitHub.

## 📊 Monitoring

### View Workflow Runs
1. Go to **Actions** tab in GitHub
2. Click on "Publish Extension" workflow
3. View run history and logs

### Check Status
- ✅ Green checkmark = Success
- ❌ Red X = Failed
- 🟡 Yellow dot = In progress

## 🐛 Troubleshooting

### Workflow Fails on VS Code Marketplace

**Possible causes**:
- Invalid or expired `VSCE_PAT`
- Version already published
- Publisher name mismatch

**Solution**:
1. Check secrets are correctly set
2. Verify token has "Marketplace (Manage)" scope
3. Ensure version number is incremented

### Workflow Fails on Open VSX

**Possible causes**:
- Invalid or expired `OVSX_PAT`
- Version already published
- First-time publishing (needs manual approval)

**Solution**:
1. Check `OVSX_PAT` secret is set
2. Verify token at https://open-vsx.org/user-settings/tokens
3. For first publish, may need manual upload

### Both Fail

**Possible causes**:
- Build errors
- Missing dependencies
- Invalid package.json

**Solution**:
1. Test locally: `npm run package`
2. Check build logs in Actions tab
3. Verify all dependencies installed

## 🔧 Customization

### Modify Workflow

Edit `.github/workflows/publish.yml` to:
- Change Node.js version
- Add additional steps
- Modify publishing behavior
- Add notifications

### Disable Workflow

To temporarily disable:
1. Go to Actions tab
2. Click on workflow
3. Click "..." → "Disable workflow"

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [VS Code Publishing Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Open VSX Publishing Guide](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)

---

**Need help?** Check the main repository documentation or create an issue.
