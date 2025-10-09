import { Directive, ElementRef, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { UserStateService } from '../services/user-state.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appBlockInactiveUser]',
  standalone: true
})
export class BlockInactiveUserDirective implements OnInit, OnDestroy {
  @Input() actionType: 'click' | 'submit' | 'all' = 'all';
  
  private subscription: Subscription = new Subscription();
  private isUserActive = false;

  constructor(
    private elementRef: ElementRef,
    private userStateService: UserStateService
  ) {}

  ngOnInit() {
    // Subscribe to user active status
    this.subscription.add(
      this.userStateService.isUserActive$.subscribe(isActive => {
        this.isUserActive = isActive;
        this.updateElementState();
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    if (this.actionType === 'click' || this.actionType === 'all') {
      this.handleAction(event);
    }
  }

  @HostListener('submit', ['$event'])
  onSubmit(event: Event) {
    if (this.actionType === 'submit' || this.actionType === 'all') {
      this.handleAction(event);
    }
  }

  private handleAction(event: Event) {
    if (!this.isUserActive) {
      event.preventDefault();
      event.stopPropagation();
      this.userStateService.blockAction();
    }
  }

  private updateElementState() {
    const element = this.elementRef.nativeElement;
    
    if (!this.isUserActive) {
      // Add visual indicators for inactive state
      element.style.opacity = '0.6';
      element.style.cursor = 'not-allowed';
      element.setAttribute('title', 'Complete setup to use this feature');
      element.classList.add('blocked-action');
    } else {
      // Remove visual indicators
      element.style.opacity = '1';
      element.style.cursor = '';
      element.removeAttribute('title');
      element.classList.remove('blocked-action');
    }
  }
}
