import { Bookmark } from './Bookmark';

export interface BookmarkMetadata {
  version: string;
  workspacePath: string;
  totalBookmarks: number;
  lastModified: string;
}

export interface BookmarkData {
  bookmarks: Bookmark[];
  metadata: BookmarkMetadata;
}
