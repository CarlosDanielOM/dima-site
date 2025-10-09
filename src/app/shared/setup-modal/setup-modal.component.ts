import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertCircle, X, Twitch } from 'lucide-angular';

@Component({
  selector: 'app-setup-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './setup-modal.component.html',
  styleUrls: ['./setup-modal.component.css']
})
export class SetupModalComponent {
  @Input() isOpen = false;
  @Input() userName = '';
  @Output() close = new EventEmitter<void>();
  @Output() startSetup = new EventEmitter<void>();

  // Icons
  alertIcon = AlertCircle;
  closeIcon = X;
  twitchIcon = Twitch;

  onClose() {
    this.close.emit();
  }

  onStartSetup() {
    this.startSetup.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
