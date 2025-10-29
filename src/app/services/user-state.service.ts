import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserService } from '../user.service';
import { UserEventsService } from './user-events.service';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private isUserActiveSubject = new BehaviorSubject<boolean>(false);
  private setupModalOpenSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private userService: UserService,
    private userEventsService: UserEventsService
  ) {
    // Set up subscription first to catch all notifications
    this.userEventsService.userStatusChanged$.subscribe(() => {
      this.checkUserStatus();
    });
    
    // Try to restore user from sessionStorage if not already restored
    // This ensures user state is available even if guard hasn't run yet
    if (!this.userService.getUser()) {
      this.userService.restoreUser();
    }
    
    // Initial status check
    this.checkUserStatus();
  }

  private checkUserStatus() {
    const user = this.userService.getUser();
    if (user && user.actived) {
      this.isUserActiveSubject.next(true);
    } else {
      this.isUserActiveSubject.next(false);
      // Don't auto-show modal - only show on blocked actions
    }
  }

  // Observable for user active status
  get isUserActive$(): Observable<boolean> {
    return this.isUserActiveSubject.asObservable();
  }

  // Observable for setup modal visibility
  get isSetupModalOpen$(): Observable<boolean> {
    return this.setupModalOpenSubject.asObservable();
  }

  // Get current user active status
  get isUserActive(): boolean {
    return this.isUserActiveSubject.value;
  }

  // Get current setup modal status
  get isSetupModalOpen(): boolean {
    return this.setupModalOpenSubject.value;
  }

  // Show setup modal
  showSetupModal() {
    this.setupModalOpenSubject.next(true);
  }

  // Hide setup modal
  hideSetupModal() {
    this.setupModalOpenSubject.next(false);
  }

  // Update user active status (called after successful setup)
  updateUserStatus() {
    this.checkUserStatus();
  }

  // Check if action should be blocked
  canPerformAction(): boolean {
    return this.isUserActiveSubject.value;
  }

  // Block action with user feedback
  blockAction(): void {
    if (!this.canPerformAction()) {
      this.showSetupModal();
    }
  }
}
