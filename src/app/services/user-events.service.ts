import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserEventsService {
  private userStatusChangedSubject = new Subject<void>();

  // Observable for when user status changes
  get userStatusChanged$() {
    return this.userStatusChangedSubject.asObservable();
  }

  // Method to notify that user status has changed
  notifyUserStatusChanged() {
    this.userStatusChangedSubject.next();
  }
}
