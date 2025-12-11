import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaFile } from '../../interfaces/triggers';
import { LucideAngularModule, X, ChevronRight, Upload, Trash2 } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-media-library-sidebar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslateModule],
  templateUrl: './media-library-sidebar.component.html',
  styleUrl: './media-library-sidebar.component.css'
})
export class MediaLibrarySidebarComponent {
  @Input() isOpen = false;
  @Input() isMobile = false;
  @Input() mediaFiles: MediaFile[] = [];
  @Input() isLoading = false;

  @Output() toggle = new EventEmitter<void>();
  @Output() upload = new EventEmitter<void>();
  @Output() delete = new EventEmitter<MediaFile>();

  // Icons
  xIcon = X;
  chevronRightIcon = ChevronRight;
  uploadIcon = Upload;
  trashIcon = Trash2;

  onToggle() {
    this.toggle.emit();
  }

  onUpload() {
    this.upload.emit();
  }

  onDelete(file: MediaFile) {
    this.delete.emit(file);
  }
}
