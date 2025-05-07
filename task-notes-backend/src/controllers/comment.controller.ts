import { Request, Response } from "express";
import Comment from "../entities/Comment";
import { CommentService } from "../services/comment.service";

export class CoemmntController {
  static async createComment(req: Request, res: Response) {}
  static async getCommentById(req: Request, res: Response) {
    console.error("get by id");
    const note = await CommentService.getCommentById(Number(req.params.id));
    res.json(note);
  }
  static async updateComment(req: Request, res: Response) {
    console.error("update");
    const note = await CommentService.updateComment(Number(req.params.id), req.body);
    res.json(note);
  }
  static async deleteComment(req: Request, res: Response) {
    console.error("delete");
    await CommentService.deleteComment(Number(req.params.id));
    res.sendStatus(204);
  }
}
