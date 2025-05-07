export interface Comment {
  id?: number;
  text?: string;
  creationDate?: Date | null;
  noteId: number;
}
