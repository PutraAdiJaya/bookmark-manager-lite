import * as assert from 'assert';
import * as path from 'path';
import { normalizeFilePath, isPathWithinWorkspace, getAbsolutePath } from '../../../utils/pathUtils';

suite('Path Utils Test Suite', () => {
  const workspaceRoot = path.join('C:', 'workspace', 'project');

  suite('normalizeFilePath', () => {
    test('should normalize absolute path to relative path', () => {
      const absolutePath = path.join(workspaceRoot, 'src', 'file.ts');
      const result = normalizeFilePath(absolutePath, workspaceRoot);
      assert.strictEqual(result, 'src/file.ts');
    });

    test('should use forward slashes', () => {
      const absolutePath = path.join(workspaceRoot, 'src', 'nested', 'file.ts');
      const result = normalizeFilePath(absolutePath, workspaceRoot);
      assert.strictEqual(result, 'src/nested/file.ts');
    });
  });

  suite('isPathWithinWorkspace', () => {
    test('should return true for path within workspace', () => {
      const absolutePath = path.join(workspaceRoot, 'src', 'file.ts');
      const result = isPathWithinWorkspace(absolutePath, workspaceRoot);
      assert.strictEqual(result, true);
    });

    test('should return false for path outside workspace', () => {
      const absolutePath = path.join('C:', 'other', 'file.ts');
      const result = isPathWithinWorkspace(absolutePath, workspaceRoot);
      assert.strictEqual(result, false);
    });

    test('should return false for path with parent directory traversal', () => {
      const absolutePath = path.join(workspaceRoot, '..', 'outside', 'file.ts');
      const result = isPathWithinWorkspace(absolutePath, workspaceRoot);
      assert.strictEqual(result, false);
    });
  });

  suite('getAbsolutePath', () => {
    test('should convert relative path to absolute path', () => {
      const relativePath = 'src/file.ts';
      const result = getAbsolutePath(relativePath, workspaceRoot);
      assert.strictEqual(result, path.join(workspaceRoot, 'src', 'file.ts'));
    });
  });
});
