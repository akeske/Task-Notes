import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  BaseEntity,
} from "typeorm";
import Note from "./Note";

@Entity()
export default class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  noteId: number;

  @Column("text")
  commentText: string;

  @CreateDateColumn()
  creationDate: Date;

  @ManyToOne(() => Note, (note) => note.comments)
  @JoinColumn({ name: "noteId" })
  note: Note;
}
