import {
  NgModule,
  NO_ERRORS_SCHEMA,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotesFormComponent } from './components/notes-form/notes-form.component';
import { NotesListComponent } from './components/notes-list/notes-list.component';
import { NotesService } from './services/notes.service';
import { provideHttpClient } from '@angular/common/http';
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NoteAccordComponent } from './components/note-accord/note-accord.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedService } from './services/shared';
import { NotificationService } from './services/notification.service';
import { NgxEditorModule } from 'ngx-editor';

@NgModule({
  declarations: [
    AppComponent,
    NotesFormComponent,
    NotesListComponent,
    NoteAccordComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    NgbModalModule,
    NgbModule,
    FontAwesomeModule,
    NgSelectModule,
    NgxEditorModule,
  ],
  providers: [
    NotesService,
    SharedService,
    NotificationService,
    provideHttpClient(),
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppModule {}
