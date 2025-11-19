import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, X, Image } from 'lucide-angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Trigger, MediaFile } from '../../interfaces/triggers';
import { MediaService } from '../../services/media.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-create-trigger-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslateModule],
  templateUrl: './create-trigger-modal.component.html',
  styleUrl: './create-trigger-modal.component.css'
})
export class CreateTriggerModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() triggerCreated = new EventEmitter<Partial<Trigger>>();
  
  plusIcon = Plus;
  xIcon = X;
  imageIcon = Image;

  newTrigger = {
    title: '',
    cost: 0,
    prompt: '',
    cooldown: 0,
    background_color: '#6366f1',
    message: '',
    mediaName: '',
    volume: 100, // New field
    type: 'redemption',
    // Premium fields
    originalCost: 0,
    costChange: 0,
    returnToOriginalCost: false,
    isEnabled: true
  };

  mediaFiles: MediaFile[] = [];
  isLoadingMedia = false;

  isSubmitting = false;
  showColorPicker = false;
  validationErrors: { [key: string]: string } = {};
  
  presetColors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6',
    '#6366f1', '#8b5cf6', '#ec4899', '#6b7280', '#000000', '#ffffff'
  ];

  constructor(
    private mediaService: MediaService,
    public translate: TranslateService,
    public languageService: LanguageService
  ) {}

  ngOnInit() {
    this.loadMediaFiles();
  }

  ngOnChanges() {
    if (this.isOpen) {
      this.resetForm();
      this.loadMediaFiles();
    }
  }

  loadMediaFiles() {
    this.isLoadingMedia = true;
    this.mediaService.getMediaFiles().subscribe({
      next: (files) => {
        this.mediaFiles = files;
        this.isLoadingMedia = false;
      },
      error: (err) => {
        console.error('Error loading media files', err);
        this.isLoadingMedia = false;
      }
    });
  }

  resetForm() {
    this.newTrigger = {
      title: '',
      cost: 0,
      prompt: '',
      cooldown: 0,
      background_color: '#6366f1',
      message: '',
      mediaName: '',
      volume: 100,
      type: 'redemption',
      originalCost: 0,
      costChange: 0,
      returnToOriginalCost: false,
      isEnabled: true
    };
    this.validationErrors = {};
    this.showColorPicker = false;
    this.isSubmitting = false;
  }

  closeModal() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.resetForm();
  }

  selectMedia(mediaName: string) {
    this.newTrigger.mediaName = mediaName;
  }

  onColorSelect(color: string) {
    this.newTrigger.background_color = color;
    this.showColorPicker = false;
  }

  toggleColorPicker() {
    this.showColorPicker = !this.showColorPicker;
  }

  validateForm(): boolean {
    this.validationErrors = {};
    let isValid = true;

    if (!this.newTrigger.title.trim()) {
      this.validationErrors['title'] = this.translate.instant('createReward.titleRequired');
      isValid = false;
    }

    if (this.newTrigger.cost < 0) {
      this.validationErrors['cost'] = this.translate.instant('createReward.costRequired');
      isValid = false;
    }

    if (!this.newTrigger.mediaName) {
        this.validationErrors['mediaName'] = this.translate.instant('clips.toasts.selectionRequiredMsg'); 
        isValid = false;
    }

    return isValid;
  }

  onSubmit() {
    if (this.validateForm()) {
      this.isSubmitting = true;
      
      const triggerData = {
        ...this.newTrigger,
        title: this.newTrigger.title.trim(),
        prompt: this.newTrigger.prompt.trim(),
        message: this.newTrigger.message.trim()
      };
      
      this.triggerCreated.emit(triggerData);
      // Parent component will handle the API call and closing modal
      this.isSubmitting = false; 
    }
  }
}
