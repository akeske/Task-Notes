import { Injectable } from '@angular/core';
import { Note } from '../models/note.model';

@Injectable({ providedIn: 'root' })
export class SharedService {
  // 1 To Do
  // 2 In Progress
  // 3 On Hold
  // 4 Completed
  // 5 Canceled
  getStatusDetails(status: number | undefined): {
    color: string;
    text: string;
  } {
    const statusMap: { [key: number]: { color: string; text: string } } = {
      1: { color: 'bg-danger', text: 'To Do' },
      2: { color: 'bg-warning text-dark ', text: 'In Progress' },
      3: { color: 'bg-primary', text: 'On Hold' },
      4: { color: 'bg-success', text: 'Completed' },
      5: { color: 'bg-secondary', text: 'Canceled' },
    };
    return (
      statusMap[status ?? 5] || {
        color: 'bg-warning text-dark',
        text: 'In Progress',
      }
    );
  }

  // 1 Low
  // 2 Medium
  // 3 High
  // 4 Urgent
  getPriorityDetails(status: number | undefined): {
    color: string;
    text: string;
  } {
    const statusMap: { [key: number]: { color: string; text: string } } = {
      1: { color: 'bg-primary', text: 'Low' },
      2: { color: 'bg-warning text-dark', text: 'Medium' },
      3: { color: 'bg-warning text-dark', text: 'High' },
      4: { color: 'bg-danger', text: 'Urgent' },
    };
    return (
      statusMap[status ?? 4] || {
        color: 'bg-primary',
        text: 'Low',
      }
    );
  }

  trimObjectProperties(obj: Note): Note {
    return {
      ...obj, // Keep all other properties unchanged
      title: obj.title?.trim(),
      info: obj.info?.map(({ key, value }) => ({
        key: key.trim(),
        value: value.trim(),
      })),
    };
  }

  isFutureDate(date: Date | string | null): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);

    if (!date) return 'bg-secondary'; // Default to future after one week
    const inputDate = new Date(date);

    if (inputDate < today) return 'bg-light text-dark'; // Old time
    if (inputDate >= today && inputDate < oneWeekLater) return 'bg-danger'; // Within one week
    return 'bg-secondary'; // Future after one week
  }

  setMostValuable(mostValuable: number): string {
    if (mostValuable === 1) {
      return 'bg-success';
    } else if (mostValuable === 2) {
      return 'bg-info';
    }
    return 'bg-dark';
  }

  mostValuable(mostValuable: number): string {
    if (mostValuable === 1) {
      return 'table-warning';
    }
    return '';
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ensure 2-digit month
    const day = date.getDate().toString().padStart(2, '0'); // Ensure 2-digit day
    return `${year}-${month}-${day}`;
  }

  addChildrenCount(notes: Note[]): Note[] {
    const counts: Record<number, number> = {};

    // Count how many times each ID appears as a parent
    notes.forEach((note) => {
      const parentId = note.parent?.id;
      if (parentId !== undefined) {
        counts[parentId] = (counts[parentId] || 0) + 1;
      }
    });

    // Add childrenCount to each item
    return notes.map((note) => ({
      ...note,
      childrenCount: note.id !== undefined ? counts[note.id] || 0 : 0,
    }));
  }

  flexibleParseBoolean(value: string | null): boolean {
    if (value === null || value === undefined) return false;
    const val = value.trim().toLowerCase();
    return ['true', '1', 'yes', 'y'].includes(val);
  }
}
