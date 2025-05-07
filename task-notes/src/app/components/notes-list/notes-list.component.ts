import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NotesService } from '../../services/notes.service';
import { Note } from '../../models/note.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotesFormComponent } from '../notes-form/notes-form.component';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { lastValueFrom } from 'rxjs';
import { SharedService } from '../../services/shared';

@Component({
  selector: 'app-notes-list',
  standalone: false,
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss'],
})
export class NotesListComponent implements OnInit {
  @Input() parentId: number | null = null;
  @Input() type: string | null = null;
  @Output() selectNote = new EventEmitter<Note>();
  @Output() refreshList = new EventEmitter<Note>();

  isSearch: boolean = false;
  faPencil = faPencil;
  faTrash = faTrash;
  notes: Note[] = [];
  selectedNoteId: number | null = null;

  constructor(
    private readonly notesService: NotesService,
    private readonly modalService: NgbModal,
    public sharedService: SharedService,
  ) {}

  ngOnInit(): void {
    this.fetchNotes();
  }

  selectParent(note: Note) {
    this.isSearch = false;
    if (note?.parentId) {
      this.selectNote.emit({ id: note.parentId });
    }
  }

  openModal(note: Note | null, createChild?: boolean) {
    if (note) note = this.editNote(note);
    const modalRef = this.modalService.open(NotesFormComponent, {
      size: 'xl',
      centered: true,
      scrollable: true,
      backdrop: 'static',
      keyboard: true,
    });
    modalRef.componentInstance.editNote = note || null;
    modalRef.componentInstance.createChild = createChild;
    modalRef.componentInstance.onCloseFunction = this.onModalClose;
    modalRef.result.then(
      (result) => {
        // console.log('Modal List closed with:', result);
        if (result === 'Save') {
          this.refreshList.emit();
        }
      },
      (dismissReason) => {
        // console.log('Modal edit dismissed:', dismissReason);
      },
    );
  }

  onModalClose(result: string) {
    // console.log('Modal edit closed with result:', result);
  }

  async fetchNotes() {
    this.isSearch = false;
    // Delay fetch to allow backend updates
    await new Promise((resolve) => setTimeout(resolve, 50));

    this.notes = await lastValueFrom(this.notesService.getNotes());
    this.notes.forEach((note) => {
      if (note.parentId === null) {
        note.class = 'table-header';
      } else {
        note.class = '';
      }
    });
    this.notes = this.notes.map((d) => ({
      ...d,
      creationDate: d.creationDate ? new Date(d.creationDate) : null,
      info: d.info ? d.info : [],
    }));

    this.notes = this.sharedService.addChildrenCount(this.notes);
  }

  fetchChildNotes(parentId: number): void {
    setTimeout(() => {
      this.notesService.getNotesByParentId(parentId).subscribe((data) => {
        this.notes = data.map((d) => ({
          ...d,
          creationDate: d.creationDate ? new Date(d.creationDate) : null,
          info: d.info ? d.info : [],
        }));
      });
    }, 50); // Delay fetch to allow backend updates
  }

  async fetchSearchNotes(result: any) {
    this.notes = []; // Clear previous notes

    for (const res of result.notes) {
      for (const id of res.ids) {
        const note = await lastValueFrom(this.notesService.getNoteById(id));
        note.mostValuable = res.mostValuable;
        if (res.mostValuable === 1) {
          note.class = 'table-warning';
        } else if (res.mostValuable === 2) {
          note.class = 'table-info';
        }
        this.notes.push(note); // Push in order
      }
    }

    this.isSearch = true; // Mark search completion
  }

  async deleteNote(noteId: number | undefined) {
    if (noteId) {
      await lastValueFrom(this.notesService.deleteNote(noteId));
    }
    await this.fetchNotes();
    this.refreshList.emit();
  }

  onRefreshList() {
    this.fetchNotes();
    this.refreshList.emit();
  }

  editNote(note?: Note): Note | null {
    if (note) {
      delete note['class'];
      if (note.id) {
        this.selectedNoteId = note.id;
      }
      return note;
    }
    return null;
  }
}
