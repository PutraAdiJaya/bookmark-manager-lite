import { Bookmark } from './Bookmark';

export interface TagGroup {
  tag: string;
  bookmarks: Bookmark[];
  count: number;
}
