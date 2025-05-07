/** @format */

import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import Comment from './Comment';

@Entity()
export default class Note extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column('json')
  content: any;

  @Column({ type: 'boolean', default: false })
  isNote: boolean;

  // 1 To Do
  // 2 In Progress
  // 3 On Hold
  // 4 Completed
  // 5 Canceled
  @Column({ type: 'int', default: 1 })
  status: number;

  // 1 Low
  // 2 Medium
  // 3 High
  // 4 Urgent
  @Column({ type: 'int', default: 2 })
  priority: number;

  @Column({ type: 'date', nullable: true })
  dueDate?: Date;

  @Column({ nullable: true })
  parentId?: number | null;

  @ManyToOne(() => Note, (note) => note.id, { nullable: true })
  parent?: Note;

  @CreateDateColumn()
  creationDate?: Date;

  @Column('simple-json', { nullable: true })
  info?: { [key: string]: string };

  @OneToMany(() => Comment, (comment) => comment.note)
  comments: Comment[];

  @Column('simple-json', { nullable: true })
  metadata?: { urls?: string[]; emailSubjects?: string[]; dates?: string[] };
}
