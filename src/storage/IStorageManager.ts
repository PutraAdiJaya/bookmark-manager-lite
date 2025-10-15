import { BookmarkData } from '../models';

export interface IStorageManager {
  load(): Promise<BookmarkData>;
  save(data: BookmarkData): Promise<void>;
  exists(): Promise<boolean>;
  initialize(): Promise<void>;
}
