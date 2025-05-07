import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { NotesService } from '../../services/notes.service';
import { Note } from '../../models/note.model';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  faTrash,
  faPlus,
  faFloppyDisk,
} from '@fortawesome/free-solid-svg-icons';
import { NgSelectConfig } from '@ng-select/ng-select';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { SharedService } from '../../services/shared';
import { Editor, Toolbar } from 'ngx-editor';

@Component({
  selector: 'app-notes-form',
  standalone: false,
  templateUrl: './notes-form.component.html',
  styleUrls: ['./notes-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NotesFormComponent implements OnInit, OnDestroy {
  @Input() editNote: Note = {};
  @Input() createChild: boolean = false;
  @Input() onCloseFunction: Function = () => {};

  faTrash = faTrash;
  faPlus = faPlus;
  faFloppyDisk = faFloppyDisk;

  notes: Note[] = [];
  parentNotes: Note[] = [];

  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h3', 'h4'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  constructor(
    private readonly notesService: NotesService,
    private readonly modalService: NgbModal,
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    private readonly config: NgSelectConfig,
  ) {
    this.config.notFoundText = 'Custom not found';
  }

  ngOnInit(): void {
    this.editor = new Editor({
      content: '',
      plugins: [],
      nodeViews: {},
      history: true,
      keyboardShortcuts: true,
      inputRules: true,
    });
    if (this.createChild) {
      this.editNote = {
        title: '',
        content: '',
        priority: 3,
        status: 1,
        parentId: this.editNote.id,
        dueDate: this.sharedService.formatDate(new Date()),
        info: [
          { key: 'ticket snow', value: '' },
          { key: 'email', value: '' },
          { key: 'email', value: '' },
        ],
      };
    } else if (!this.editNote.id) {
      this.editNote = {
        priority: 3,
        status: 1,
        parentId: this.editNote.id,
        dueDate: this.sharedService.formatDate(new Date()),
        info: [
          { key: 'ticket snow', value: '' },
          { key: 'email', value: '' },
          { key: 'email', value: '' },
        ],
      };
    }
    this.displayParents();
    this.fetchNotes();
    this.editor = new Editor();
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  async displayParents() {
    if (this.editNote.id) {
      this.parentNotes = await firstValueFrom(
        this.notesService.getAllParents(this.editNote.id),
      );
    }
  }

  addInfo(): void {
    this.editNote?.info?.push({ key: '', value: '' });
  }

  remoreInfo(indexToRemove: number): void {
    // if (indexToRemove > -1 && indexToRemove < this.editNote.info?.length) {
    this.editNote?.info?.splice(indexToRemove, 1);
    // }
  }

  fetchNotes(): void {
    this.notesService.getNotes().subscribe((data: Note[]) => {
      this.notes = data.map((d) => ({
        ...d,
        creationDate: d.creationDate ? new Date(d.creationDate) : null,
        customTitle: `${d.id} - ${d.title}`,
      }));
    });
  }

  closeModal(result: string) {
    this.saveNote();
    this.activeModal.close(result); // Close the modal
  }

  saveNote(): void {
    // if (!this.editNote.metadata) {
    //   this.editNote.metadata = { urls: [], emailSubjects: [], dates: [] };
    // }

    // this.editNote.info = this.info;
    delete this.editNote['parent'];

    this.editNote = this.sharedService.trimObjectProperties(this.editNote);
    if (this.editNote?.title && this.editNote.content) {
      if (this.editNote.id) {
        this.notesService
          .updateNote(this.editNote.id, this.editNote)
          .subscribe();
      } else {
        this.notesService.createNote(this.editNote).subscribe();
      }
    }
  }

  async deleteNote(content: TemplateRef<any>, noteId: number | undefined) {
    this.modalService.open(content, { centered: true }).result.then(
      async (result) => {
        if (result === 'yes') {
          if (noteId) {
            await lastValueFrom(this.notesService.deleteNote(noteId));
          }
          this.activeModal.close('Save');
          this.ngOnInit();
        }
      },
      () => {},
    );
  }
}
