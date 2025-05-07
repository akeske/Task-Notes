import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Note } from '../models/note.model';

@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly apiUrl = 'http://localhost:3001/notes';

  constructor(private readonly http: HttpClient) {}

  getNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(this.apiUrl);
  }

  getParentNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl}/only-parents`);
  }

  getNoteById(id: number): Observable<Note> {
    return this.http.get<Note>(`${this.apiUrl}/${id}`);
  }

  getAllParents(id: number): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl}/all-parents/${id}`);
  }

  getNotesByParentId(parentId: number): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl}/parent-id/${parentId}`);
  }

  createNote(note: Note): Observable<Note> {
    note.creationDate = new Date();
    return this.http.post<Note>(this.apiUrl, note);
  }

  updateNote(id: number, note: Note): Observable<Note> {
    return this.http.put<Note>(`${this.apiUrl}/${id}`, note);
  }

  deleteNote(id: number) {
    return this.http.get(`${this.apiUrl}/delete/${id}`);
  }
}
