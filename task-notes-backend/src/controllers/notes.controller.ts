/** @format */

import { Request, Response } from 'express';
import { NotesService } from '../services/notes.service';
import Note from '../entities/Note';

export class NotesController {
  static async createNote(req: Request, res: Response) {
    const { title, content, status, priority, dueDate, parentId, comments, info, isNote } = req.body;
    const newNote = new Note();
    newNote.title = title;
    newNote.content = content;
    newNote.isNote = isNote;
    newNote.status = status || 'To Do';
    newNote.priority = priority || 'Medium';
    newNote.dueDate = dueDate || null;
    newNote.parentId = parentId || null;
    // newNote.metadata = metadata || { urls: [], emailSubjects: [], dates: [] };
    newNote.comments = comments || [];
    newNote.info = info;
    newNote.creationDate = new Date();
    const note = await NotesService.createNote(newNote);
    res.json(note);
  }

  static async getNotes(req: Request, res: Response) {
    const notes = await NotesService.getNotes();

    // Step 1: Group notes by parentId
    const groupedNotes = new Map<number | null, any[]>();
    notes.forEach((note) => {
      const parentId = note.parentId ?? null; // Handle null parentIds
      if (!groupedNotes.has(parentId)) {
        groupedNotes.set(parentId, []);
      }
      groupedNotes.get(parentId)?.push(note);
    });

    // Step 2: Sort each group by ID
    // groupedNotes.forEach((group) => {
    //   group.sort((a, b) => a.id - b.id);
    // });
    // Step 3: Recursively build the hierarchical list
    const sortedNotes: any[] = [];
    function addNotes(parentId: number | null, level: number = 0) {
      if (groupedNotes.has(parentId)) {
        groupedNotes.get(parentId)?.forEach((note) => {
          sortedNotes.push({ ...note, level }); // Add note with indentation level
          addNotes(note.id, level + 1); // Recursively add children
        });
      }
    }

    addNotes(null); // Start with root parents (parentId = null)

    res.json(sortedNotes);
    // res.json(notes);
  }

  static async getParentNotes(req: Request, res: Response) {
    const notes = await NotesService.getParentNotes();
    res.json(notes);
  }

  static async getAllParents(req: Request, res: Response) {
    let notes = await NotesService.getAllParents(Number(req.params.id));
    notes = notes.reverse();
    res.json(notes);
  }

  static async getNotesByParentId(req: Request, res: Response) {
    const notes = await NotesService.getNotesByParentId(Number(req.params.id));
    if (!notes) {
      return res.status(404).json({ message: 'Notes not found' });
    }
    res.json(notes);
  }

  static async getNoteById(req: Request, res: Response) {
    const note = await NotesService.getNoteById(Number(req.params.id));

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  }

  static async updateNote(req: Request, res: Response) {
    const note = await NotesService.updateNote(Number(req.params.id), req.body);
    res.json(note);
  }

  static async deleteNote(req: Request, res: Response) {
    const deleteNote = await NotesService.deleteNote(Number(req.params.id));
    // res.json(deleteNote);
    res.sendStatus(204);
  }
}
