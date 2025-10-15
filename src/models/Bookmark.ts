export interface Bookmark {
  id: string;
  title: string;
  description: string;
  filePath: string;
  line: number;
  column: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
