import { Injectable } from '@angular/core';
import { SharedService } from './shared';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly sharedService: SharedService) {}

  init(): boolean {
    const enabled = this.sharedService.flexibleParseBoolean(
      localStorage.getItem('noti') ?? '',
    );
    if (enabled) {
      this.startScheduledNotifications(); // restart interval
    }
    return enabled;
  }

  // Request permission to show notifications
  requestPermission(): void {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications.');
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
      } else {
        console.log(`Notification permission: ${permission}`);
      }
    });
  }

  // Show a notification
  showNotification(title: string, options?: NotificationOptions): void {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, options);
      notification.onclick = () => {
        window.open('http://localhost:3000/', '_blank');
      };
    } else {
      console.log('Notification permission not granted.');
    }
  }

  // Start scheduled notifications
  startScheduledNotifications(): boolean {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
    }

    this.notificationInterval = setInterval(
      () => {
        this.showNotification('Reminder!', {
          body: 'Feed me with more notes, please!',
          icon: 'http://localhost:3000/note.png',
        });
      },
      30 * 60 * 1000,
    ); // 30 minutes

    localStorage.setItem('noti', 'true');
    return true;
  }

  // Stop notifications
  stopScheduledNotifications(): boolean {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
      this.notificationInterval = null;
    }
    localStorage.setItem('noti', 'false');
    return false;
  }
}
