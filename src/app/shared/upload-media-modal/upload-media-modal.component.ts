import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Upload, X, File as FileIcon } from 'lucide-angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MediaService } from '../../services/media.service';
import { UserService } from '../../user.service';
import { ToastService } from '../../toast.service';

@Component({
  selector: 'app-upload-media-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslateModule],
  templateUrl: './upload-media-modal.component.html',
  styleUrl: './upload-media-modal.component.css'
})
export class UploadMediaModalComponent {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() mediaUploaded = new EventEmitter<any>();

  uploadIcon = Upload;
  xIcon = X;
  fileIcon = FileIcon;

  fileName = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isDragging = false;
  isUploading = false;
  uploadProgress = 0;

  constructor(
    private mediaService: MediaService,
    private userService: UserService,
    private toastService: ToastService,
    private translate: TranslateService
  ) {}

  closeModal() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.resetForm();
  }

  resetForm() {
    this.fileName = '';
    this.selectedFile = null;
    this.previewUrl = null;
    this.isUploading = false;
    this.uploadProgress = 0;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFileSelection(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
  }

  handleFileSelection(file: File) {
    // Validate file size
    const limitMB = this.getFileSizeLimitMB();
    const limitBytes = limitMB * 1024 * 1024;
    
    if (file.size > limitBytes) {
      this.toastService.error(
        this.translate.instant('triggers.errorTitle'),
        this.translate.instant('triggers.fileSizeError', { limit: limitMB })
      );
      return;
    }

    this.selectedFile = file;
    this.fileName = file.name.split('.')[0]; // Default name to filename without extension
    
    // Create preview
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.previewUrl = null;
    }
  }

  getFileSizeLimitMB(): number {
    if (this.userService.getPremiumPlus()) return 15;
    if (this.userService.getPremium()) return 10;
    return 5;
  }

  upload() {
    if (!this.selectedFile || !this.fileName.trim()) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    // Simulate progress since placeholder service doesn't support real progress events yet
    // In real implementation, subscribe to HttpEvents
    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 90) clearInterval(interval);
    }, 200);

    this.mediaService.uploadMedia(this.selectedFile, this.fileName).subscribe({
      next: (media) => {
        clearInterval(interval);
        this.uploadProgress = 100;
        setTimeout(() => {
          this.toastService.success(
            this.translate.instant('media.uploaded'),
            this.translate.instant('triggers.uploadSuccess')
          );
          this.mediaUploaded.emit(media);
          this.closeModal();
        }, 500);
      },
      error: (err) => {
        clearInterval(interval);
        this.isUploading = false;
        console.error('Upload error', err);
        this.toastService.error(
          this.translate.instant('triggers.errorTitle'), 
          this.translate.instant('triggers.errorMsg')
        );
      }
    });
  }
}

