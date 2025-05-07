import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';
import { NotesService } from '../../services/notes.service';
import { Note } from '../../models/note.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotesFormComponent } from '../notes-form/notes-form.component';
import {
  faPencil,
  faTrash,
  faPlus,
  faExpand,
} from '@fortawesome/free-solid-svg-icons';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { SharedService } from '../../services/shared';

@Component({
  selector: 'app-note-accord',
  standalone: false,
  templateUrl: './note-accord.component.html',
  styleUrls: ['./note-accord.component.scss'],
})
export class NoteAccordComponent implements OnInit {
  @Input() type: string | null = null;
  @Input() childrenNotes: Note[] | undefined;
  @Input() parentId: number | undefined;
  @Output() refreshList = new EventEmitter<any>();

  notes: Note[] = [];
  isSearch: boolean = false;

  faPencil = faPencil;
  faTrash = faTrash;
  faPlus = faPlus;
  faExpand = faExpand;

  constructor(
    private readonly notesService: NotesService,
    private readonly modalService: NgbModal,
    public sharedService: SharedService,
  ) {}

  ngOnInit(): void {
    if (this.type === 'main') {
      this.fetchNotes();
    } else {
      this.fetchChild(this.parentId);
    }
  }

  async fetchChild(parentId?: number) {
    this.notes = this.childrenNotes || [];
    let notes: Note[];
    if (parentId !== undefined) {
      notes = await firstValueFrom(
        this.notesService.getNotesByParentId(parentId),
      );
      // Fetch children for each parent note in a for‑loop
      for (const note of notes) {
        if (note.id) {
          note.children = await firstValueFrom(
            this.notesService.getNotesByParentId(note.id),
          );
        }
      }
      this.notes = notes;
    }
  }

  async fetchNotes() {
    await new Promise((resolve) => setTimeout(resolve, 50));
    try {
      let notes: Note[];
      if (this.type === 'main') {
        notes = await firstValueFrom(this.notesService.getParentNotes());
      } else {
        notes = await firstValueFrom(this.notesService.getNotes());
      }
      notes = this.sharedService.addChildrenCount(notes);

      // Fetch children for each parent note in a for‑loop
      for (const note of notes) {
        if (note.id) {
          note.children = await firstValueFrom(
            this.notesService.getNotesByParentId(note.id),
          );
        }
      }

      // Format the notes as needed
      const transformedNotes = [];
      for (const element of notes) {
        const note = element;
        transformedNotes.push({
          ...note,
          creationDate: note.creationDate ? new Date(note.creationDate) : null,
          info: note.info || [],
        });
      }
      this.notes = transformedNotes;
    } catch (error) {
      this.notes = [];
    }
  }

  openModal(note: Note | null, createChild?: boolean, parentId?: number) {
    const modalRef = this.modalService.open(NotesFormComponent, {
      size: 'xl',
      centered: true,
      scrollable: true,
      backdrop: 'static',
      keyboard: true,
    });
    modalRef.componentInstance.editNote = note || null;
    modalRef.componentInstance.createChild = createChild;
    modalRef.componentInstance.parentId = parentId;
    modalRef.componentInstance.onCloseFunction = this.onModalClose;
    modalRef.result.then(
      (result: string) => {
        // console.log('Modal Accord closed with:', result);
        if (result === 'Save' || result === 'Delete') {
          if (this.parentId) {
            this.fetchChild(this.parentId);
          } else {
            this.ngOnInit();
          }
          this.refreshList.emit();
        }
      },
      (dismissReason: any) => {
        // console.log('Modal edit dismissed:', dismissReason);
      },
    );
  }

  onRefreshList(event: any) {
    // console.log(`Forwarding event from ${event?.name} to higher level`);
    this.refreshList.emit(event); // Forward to upper-level parent
  }

  onModalClose(result: string) {
    // console.log('Modal Accord closed with result:', result);
  }

  async deleteNote(content: TemplateRef<any>, noteId: number | undefined) {
    this.modalService.open(content, { centered: true }).result.then(
      async (result) => {
        if (result === 'yes') {
          if (noteId) {
            await lastValueFrom(this.notesService.deleteNote(noteId));
          }
          this.ngOnInit();
          this.refreshList.emit();
        }
      },
      () => {},
    );
  }
}
