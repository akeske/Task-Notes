/** @format */

import express from 'express';
import { NotesController } from '../controllers/notes.controller';

const apiv1 = express.Router();
// http://localhost:3001/notes
apiv1.get('/notes', NotesController.getNotes);
apiv1.get('/notes/only-parents', NotesController.getParentNotes);
apiv1.post('/notes', NotesController.createNote);
apiv1.get('/notes/:id', NotesController.getNoteById);
apiv1.get('/notes/parent-id/:id', NotesController.getNotesByParentId);
apiv1.put('/notes/:id', NotesController.updateNote);
apiv1.get('/notes/delete/:id', NotesController.deleteNote);
apiv1.get('/notes/all-parents/:id', NotesController.getAllParents);

export default apiv1;
