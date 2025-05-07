import { Comment } from './comment.model';

export interface Note {
  id?: number;
  title?: string;
  content?: any;
  // 1 To Do
  // 2 In Progress
  // 3 On Hold
  // 4 Completed
  // 5 Canceled
  status?: number;
  // 1 Low
  // 2 Medium
  // 3 High
  // 4 Urgent
  priority?: number;
  dueDate?: Date | string | null;
  isNote?: boolean;
  parentId?: number;
  creationDate?: Date | null;
  comments?: Comment[];
  info?: { key: string; value: string }[];

  metadata?: {
    urls?: string[];
    emailSubjects?: string[];
    dates?: string[];
  };

  class?: string;
  parent?: Note;
  mostValuable?: number;
  children?: Note[];
  customTitle?: string;
  level?: number;
  childrenCount?: number;
}
