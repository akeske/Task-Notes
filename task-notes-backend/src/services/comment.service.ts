/** @format */

import { AppDataSource } from '../config/database';
import Comment from '../entities/Comment';

export class CommentService {
  static async createComment(data: Partial<Comment>) {
    console.error('create Comment');
    const commentRepo = AppDataSource.getRepository(Comment);
    const comment = commentRepo.create(data);
    return await commentRepo.save(comment);
  }

  static async getCommentsByNoteId(noteId: number) {
    console.error('get Comments');
    const commentRepo = AppDataSource.getRepository(Comment);

    let query = commentRepo.createQueryBuilder('comment').orderBy('comment.creationDate', 'ASC');

    if (noteId) {
      query = query.where('note.noteId = :noteId', { noteId });
    }
    const notes = await query.getMany();
    return notes;

    // return await commentRepo.find({
    //   relations: ["note"],
    //   order: {
    //     creationDate: "DESC",
    //   },
    // });
  }

  static async getComments() {
    console.error('get Comments');
    const commentRepo = AppDataSource.getRepository(Comment);
    return await commentRepo.find({
      relations: ['note'],
      order: {
        creationDate: 'DESC',
      },
    });
  }

  static async getCommentById(id: number) {
    console.error('get Comment by id');
    const commentRepo = AppDataSource.getRepository(Comment);
    return await commentRepo.findOne({ where: { id }, relations: ['note'] });
  }

  static async updateComment(id: number, data: Partial<Comment>) {
    console.error('updateComment');
    const commentRepo = AppDataSource.getRepository(Comment);
    await commentRepo.update(id, data);
    return await commentRepo.findOne({ where: { id } });
  }

  static async deleteComment(id: number) {
    console.error('deleteComment');
    const commentRepo = AppDataSource.getRepository(Comment);
    await commentRepo.delete(id);
  }
}
