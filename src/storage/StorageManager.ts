import * as path from 'path';
import * as fs from 'fs/promises';
import { BookmarkData, BookmarkMetadata } from '../models';
import { IStorageManager } from './IStorageManager';
import { getCurrentTimestamp } from '../utils/dateUtils';

export class StorageManager implements IStorageManager {
  private readonly storageFilePath: string;
  private readonly workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.storageFilePath = this.getStorageFilePath();
  }

  private getStorageFilePath(): string {
    return path.join(this.workspaceRoot, '.putra', 'bookmark.json');
  }

  private getDefaultData(): BookmarkData {
    return {
      bookmarks: [],
      metadata: {
        version: '1.0.0',
        workspacePath: this.workspaceRoot,
        totalBookmarks: 0,
        lastModified: getCurrentTimestamp()
      }
    };
  }

  private validateData(data: any): void {
    if (!data.bookmarks || !Array.isArray(data.bookmarks)) {
      throw new Error('Invalid bookmark data: missing bookmarks array');
    }
    if (!data.metadata) {
      throw new Error('Invalid bookmark data: missing metadata');
    }
  }

  async load(): Promise<BookmarkData> {
    try {
      const content = await fs.readFile(this.storageFilePath, 'utf-8');
      const data = JSON.parse(content);
      this.validateData(data);
      return data;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return this.getDefaultData();
      }
      throw error;
    }
  }

  async save(data: BookmarkData): Promise<void> {
    await fs.mkdir(path.dirname(this.storageFilePath), { recursive: true });
    await fs.writeFile(
      this.storageFilePath,
      JSON.stringify(data, null, 2),
      'utf-8'
    );
  }

  async exists(): Promise<boolean> {
    try {
      await fs.access(this.storageFilePath);
      return true;
    } catch {
      return false;
    }
  }

  async initialize(): Promise<void> {
    const fileExists = await this.exists();
    if (!fileExists) {
      await this.save(this.getDefaultData());
    }
  }
}
