import * as path from 'path';

export function normalizeFilePath(absolutePath: string, workspaceRoot: string): string {
  return path.relative(workspaceRoot, absolutePath).replace(/\\/g, '/');
}

export function isPathWithinWorkspace(absolutePath: string, workspaceRoot: string): boolean {
  const relativePath = path.relative(workspaceRoot, absolutePath);
  return !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
}

export function getAbsolutePath(relativePath: string, workspaceRoot: string): string {
  return path.join(workspaceRoot, relativePath);
}
