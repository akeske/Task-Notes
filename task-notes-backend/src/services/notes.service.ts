/** @format */

import { IsNull } from 'typeorm';
import { AppDataSource } from '../config/database';
import Note from '../entities/Note';

export class NotesService {
  static async createNote(data: Partial<Note>): Promise<Note> {
    console.info('createNote');
    const noteRepo = AppDataSource.getRepository(Note);
    // Object.assign(noteToUpdate, data);
    const note = noteRepo.create(data);
    return await noteRepo.save(note);

    // try {
    //   const {
    //     title,
    //     shortDescription,
    //     content,
    //     status,
    //     priority,
    //     dueDate,
    //     parentId,
    //     metadata,
    //     attachments,
    //     comments,
    //   } = req.body;

    //   const newNote = new Note();
    //   newNote.title = title;
    //   newNote.shortDescription = shortDescription;
    //   newNote.content = content;
    //   newNote.status = status || "To Do";
    //   newNote.priority = priority || "Medium";
    //   newNote.dueDate = dueDate || null;
    //   newNote.parentId = parentId || null;
    //   newNote.metadata = metadata || { urls: [], emailSubjects: [], dates: [] };
    //   newNote.attachments = attachments || [];
    //   newNote.comments = comments || [];
    //   newNote.creationDate = new Date();

    //   const savedNote = await noteRepository.save(newNote);
    //   return res.status(201).json(savedNote);
    // } catch (error) {
    //   console.error("Error creating note:", error);
    //   return res.status(500).json({ error: "Internal Server Error" });
    // }
  }

  static async getNotes() {
    const noteRepo = AppDataSource.getRepository(Note);
    return await noteRepo.find({
      relations: ['parent'],
      order: {
        isNote: 'DESC',
        status: 'ASC',
        title: 'ASC',
        priority: 'DESC',
      },
    });
  }

  static async getParentNotes() {
    const noteRepo = AppDataSource.getRepository(Note);
    return await noteRepo.find({
      where: {
        parent: IsNull(),
      },
      order: {
        isNote: 'DESC',
        title: 'ASC',
        status: 'ASC',
        priority: 'DESC',
      },
    });
  }

  static async getNoteById(id: number) {
    const noteRepo = AppDataSource.getRepository(Note);
    return await noteRepo.findOne({ where: { id }, relations: ['parent', 'comments'] });
  }

  static async getAllParents(id: number) {
    const allParentNnotes: Note[] = [];
    let currentEntity = await this.getNoteById(id);
    while (currentEntity && currentEntity.parentId !== null) {
      const parent = await this.getNoteById(currentEntity.parentId);
      if (!parent) break;

      allParentNnotes.push(parent);
      currentEntity = parent;
    }
    return allParentNnotes;
  }

  static async getNotesByParentId(parentId: number) {
    const noteRepo = AppDataSource.getRepository(Note);
    let query = noteRepo.createQueryBuilder('note').orderBy('note.creationDate', 'ASC');

    if (parentId) {
      query = query.where('note.parentId = :parentId', { parentId });
    }
    const notes = await query.getMany();
    return notes;
  }

  static async updateNote(id: number, data: Partial<Note>) {
    console.info(`updateNote ${id}`);
    const noteRepo = AppDataSource.getRepository(Note);
    const noteToUpdate = await noteRepo.findOne({
      where: { id },
      relations: ['parent'],
    });
    Object.assign(noteToUpdate, data);
    if (noteToUpdate) {
      if (data.parentId) {
        const newParentNote = await noteRepo.findOne({ where: { id: data.parentId } });
        noteToUpdate.parent = newParentNote;
      } else {
        noteToUpdate.parentId = null;
        noteToUpdate.parent = null; // If you want to remove the parent
      }
      await noteRepo.save(noteToUpdate);
    }
    return await noteRepo.findOne({ where: { id } });
  }

  static async deleteNote(id: number) {
    console.info(`deleteNote ${id}`);
    const noteRepo = AppDataSource.getRepository(Note);
    const notes = await this.getNotesByParentId(id);
    for (const note of notes) {
      note.parentId = null;
      note.parent = null;
      await this.updateNote(note.id, note);
      this.updateNote(note.id, note);
    }
    return await noteRepo.delete(id);
  }
}
