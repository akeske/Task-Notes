import { Component, OnInit, ViewChild } from '@angular/core';
import { Note } from './models/note.model';
import { NotesListComponent } from './components/notes-list/notes-list.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotesService } from './services/notes.service';
import { NotesFormComponent } from './components/notes-form/notes-form.component';
import { OpenAI } from 'openai';
import { lastValueFrom } from 'rxjs';
import { NotificationService } from './services/notification.service';
import { NoteAccordComponent } from './components/note-accord/note-accord.component';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  version: string = '1.2.1';

  @ViewChild('allNotesList') allNotesList!: NotesListComponent;
  @ViewChild('childNotesList') childNotesList!: NotesListComponent;
  @ViewChild(NoteAccordComponent) mainAccord?: NoteAccordComponent;

  search: string | undefined;
  selectedParentId: number | null = null;
  selectedNote: Note | undefined;
  chatGPTResponse: string | undefined;
  notificationStatus: boolean = false;

  constructor(
    private readonly notesService: NotesService,
    private readonly modalService: NgbModal,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.notificationService.requestPermission();
    this.notificationStatus = this.notificationService.init(); // restore notification interval if needed
  }

  onParentSelect(parent: any) {
    this.childNotesList.fetchChildNotes(parent.id);
  }

  onRefreshList() {
    this.childNotesList.fetchNotes();
    this.mainAccord?.fetchNotes();
  }

  resetList() {
    this.childNotesList.fetchNotes();
    this.chatGPTResponse = '';
  }

  openModal() {
    const modalRef = this.modalService.open(NotesFormComponent, {
      size: 'xl',
      centered: true,
      scrollable: true,
      modalDialogClass: 'dark-modal',
      backdropClass: 'light-blue-backdrop',
      windowClass: 'dark-modal',
    });
    modalRef.componentInstance.onCloseFunction = this.onModalClose;
    modalRef.result.then(
      (result) => {
        // console.log('Modal App closed with:', result);
        if (result === 'Save' || result === 'Delete') {
          this.onRefreshList();
        }
      },
      (dismissReason) => {
        // console.log('Modal new dismissed:', dismissReason);
      },
    );
  }

  onModalClose(result: string) {}

  async searchChatGPT() {
    if (this.search) {
      this.chatGPTResponse = 'Loading...';
      const result = await this.sendNotesToChatGPT(this.search);
      await this.askChatGPT(this.search);

      // const noteIds: number[] = result.notes.flatMap(
      //   (note: { ids: number[] }) => note.ids
      // );
      this.childNotesList.fetchSearchNotes(result);
    }
  }

  async sendNotesToChatGPT(search: string): Promise<any> {
    const apiKey =
      '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';
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });

    try {
      const data = await lastValueFrom(this.notesService.getNotes());

      const prompt = `
      The notes are: ${JSON.stringify(data)}.
      User Search Input: "${search}"
      Each note should be evaluated and assigned a mostValuable value based on the following criteria:

      Find the notes that are most relevant to the search input. The mostValuable value for each note should be assigned based on relevance to the search input:
      1: Most relevant to the search input (highly matched content, title, or associated info)
      2: Very relevant (moderate match or specific context related to the input)
      3: Moderately relevant (some relevance but less direct match)
      4: Less relevant (low relevance to the search query)
      5: Least relevant (no significant match to the search input)
      Return the relevant notes in JSON format, ordered from the most valuable (1) to the least valuable (5), based on their relevance to the search input."


      {
        "notes":[
          "mostValuable": range(1..5),
          ids: [noteId]
        }],
      }
      `;
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        store: false,
        messages: [
          {
            role: 'system',
            content:
              'You are an AI assistant. Always return answers in JSON format.',
          },
          { role: 'user', content: prompt },
        ],
      });
      // Extract response text
      const chatGPTResult = completion.choices[0]?.message?.content || '';
      console.info(chatGPTResult);

      // Clean JSON format if wrapped in triple backticks
      const cleanedResult = chatGPTResult
        .replace(/^```json\s*/, '')
        .replace(/```$/, '');

      // Parse JSON safely
      const parsedResult = JSON.parse(cleanedResult);

      return parsedResult;
    } catch (error) {
      console.error('Error fetching from OpenAI:', error);
      return null;
    }
  }

  async askChatGPT(search: string) {
    const apiKey = '';
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });

    try {
      const data = await lastValueFrom(this.notesService.getNotes());

      const prompt = `
      The notes are: ${JSON.stringify(data)}.
      User SearchInput: "${search}"
      Make a brief summary / explanation of the notes based on the SearchInput.
      `;
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        store: false,
        messages: [
          {
            role: 'system',
            content:
              'You are an AI assistant. Always return answers in HTML format.',
          },
          {
            role: 'system',
            content:
              'Assign also the note ids as reference to the most relevant notes.',
          },
          { role: 'user', content: prompt },
        ],
      });
      // Extract response text
      this.chatGPTResponse = completion.choices[0]?.message?.content ?? '';
    } catch (error) {
      console.error('Error fetching from OpenAI:', error);
    }
  }

  changeNotifications(): void {
    if (this.notificationStatus === true) {
      this.notificationStatus =
        this.notificationService.stopScheduledNotifications();
    } else {
      this.notificationStatus =
        this.notificationService.startScheduledNotifications();
    }
  }
}
