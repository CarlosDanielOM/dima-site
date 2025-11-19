import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TriggersService } from '../../services/triggers.service';
import { MediaService } from '../../services/media.service';
import { Trigger, MediaFile } from '../../interfaces/triggers';
import { ToastService } from '../../toast.service';
import { ConfirmationService } from '../../services/confirmation.service';
import { UserService } from '../../user.service';
import { LanguageService } from '../../services/language.service';
import { LucideAngularModule, Plus, Trash2, X, Menu, ChevronRight, ChevronLeft, Upload, RefreshCw } from 'lucide-angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CreateTriggerModalComponent } from '../../shared/create-trigger-modal/create-trigger-modal.component';
import { UploadMediaModalComponent } from '../../shared/upload-media-modal/upload-media-modal.component';

@Component({
  selector: 'app-triggers',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LucideAngularModule, 
    TranslateModule,
    CreateTriggerModalComponent,
    UploadMediaModalComponent
  ],
  templateUrl: './triggers.component.html',
  styleUrl: './triggers.component.css'
})
export class TriggersComponent implements OnInit {

  plusIcon = Plus;
  trashIcon = Trash2;
  xIcon = X;
  menuIcon = Menu;
  chevronRightIcon = ChevronRight;
  chevronLeftIcon = ChevronLeft;
  uploadIcon = Upload;
  refreshIcon = RefreshCw;

  triggers: Trigger[] = [];
  mediaFiles: MediaFile[] = [];
  
  isLoadingTriggers = true;
  isLoadingMedia = true;
  
  refreshCooldown = 0;
  
  // UI State
  isSidebarOpen = true; // Default open on desktop
  isMobile = false;
  
  // Modals
  showCreateTriggerModal = false;
  showUploadMediaModal = false;
  
  // Editing State
  editingField: { [key: string]: string } = {}; 
  editingValue: { [key: string]: any } = {};
  
  // Color Picker
  showColorPicker: { [key: string]: boolean } = {};
  colorPickerValue: { [key: string]: string } = {};

  constructor(
    private triggersService: TriggersService,
    private mediaService: MediaService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    private userService: UserService,
    public languageService: LanguageService,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.checkScreenSize();
    this.loadTriggers();
    this.loadMedia();
    this.startCooldownTimer();
    
    // Ensure translation works
    const currentLang = this.languageService.getCurrentLanguage();
    if (!this.translate.currentLang) {
        this.translate.use(currentLang);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.color-picker-popup') && !target.closest('.color-bar')) {
      Object.keys(this.showColorPicker).forEach(key => {
        if (this.showColorPicker[key]) {
          this.showColorPicker[key] = false;
        }
      });
    }
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 1024; // lg breakpoint
    if (this.isMobile) {
      this.isSidebarOpen = false;
    } else {
      this.isSidebarOpen = true;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // Data Loading
  loadTriggers(forceRefresh = false) {
    this.isLoadingTriggers = true;
    this.triggersService.getTriggers(forceRefresh).subscribe({
      next: (data) => {
        this.triggers = data;
        this.isLoadingTriggers = false;
      },
      error: (err) => {
        console.error('Error loading triggers', err);
        this.isLoadingTriggers = false;
        this.toastService.error(this.translate.instant('triggers.errorTitle'), this.translate.instant('triggers.errorMsg'));
      }
    });
  }

  loadMedia(forceRefresh = false) {
    this.isLoadingMedia = true;
    this.mediaService.getMediaFiles(forceRefresh).subscribe({
      next: (data) => {
        this.mediaFiles = data;
        this.isLoadingMedia = false;
      },
      error: (err) => {
        console.error('Error loading media', err);
        this.isLoadingMedia = false;
      }
    });
  }

  refreshData() {
    if (this.refreshCooldown > 0) return;
    
    this.loadTriggers(true);
    this.loadMedia(true);
    this.refreshCooldown = 30;
    this.toastService.success(this.translate.instant('triggers.refreshSuccess'), '');
  }

  startCooldownTimer() {
    setInterval(() => {
      if (this.refreshCooldown > 0) {
        this.refreshCooldown--;
      }
    }, 1000);
  }

  // Trigger Actions
  onTriggerCreated(triggerData: any) {
    // We need to find the media file to get the correct mimeType (MIME type)
    const mediaFile = this.mediaFiles.find(f => f.name === triggerData.mediaName);
    
    if (!mediaFile) {
      this.toastService.error('Error', 'Selected media file not found');
      return;
    }
    
    // Prepare data for API
    // The backend expects: { name, file, type, mediaType (MIME), cost, prompt, fileID, cooldown, volume }
    const apiPayload = {
        ...triggerData,
        mediaType: mediaFile.mimeType, // Send MIME type (e.g., 'video/mp4', 'image/png')
    };
    
    this.triggersService.createTrigger(apiPayload).subscribe({
      next: (newTrigger) => {
        this.triggers.push(newTrigger);
        this.showCreateTriggerModal = false;
        this.toastService.success('Success', 'Trigger created successfully');
        this.loadTriggers(true);
      },
      error: (err) => {
        console.error('Error creating trigger', err);
        this.toastService.error('Error', 'Failed to create trigger');
      }
    });
  }

  async onDeleteTrigger(trigger: Trigger) {
    // API delete route uses internal _id (triggerID), NOT rewardID
    // Ensure we use trigger._id or trigger.id (mapped to _id)
    const idToDelete = trigger._id || trigger.id; 

    if (!idToDelete) {
        console.error('No internal ID found for trigger', trigger);
        return;
    }

    const confirmed = await this.confirmationService.confirm({
        title: this.translate.instant('triggers.confirmDeleteTitle'),
        message: this.translate.instant('triggers.confirmDeleteMsg'),
        confirmText: this.translate.instant('common.delete'),
        cancelText: this.translate.instant('common.cancel'),
        variant: 'danger'
    });

    if (confirmed) {
        this.triggersService.deleteTrigger(idToDelete).subscribe({
            next: () => {
                this.triggers = this.triggers.filter(t => t._id !== idToDelete);
                this.toastService.success(this.translate.instant('triggers.deletedTitle'), this.translate.instant('triggers.deletedMsg'));
            },
            error: (err) => {
                this.toastService.error('Error', 'Failed to delete trigger');
            }
        });
    }
  }

  onToggleEnable(trigger: Trigger) {
    const newValue = !trigger.isEnabled;
    const oldValue = trigger.isEnabled;
    
    trigger.isEnabled = newValue; // Optimistic
    
    // The backend does not seem to expose a direct "enable/disable" toggle in the provided code.
    // It only shows PATCH for name, cost, etc.
    // If we can't toggle it via API, we should warn or revert.
    // However, RedemptionsService usually handles Twitch rewards.
    // If this is a Twitch reward, we might be able to use RedemptionsService.
    // But I am not injecting RedemptionsService to avoid circular deps issues if any.
    // For now, I will try to update it using the service method, which will fail if not supported.
    
    // Since the user specifically asked for "enable and disable action buttons", 
    // and said "triggers are just redemptions", presumably they SHOULD be toggleable.
    // If the backend code provided is incomplete regarding 'enable', I'll assume I can't do it yet via that endpoint.
    // But I will leave the UI hook.
    
    this.triggersService.updateTriggerField(trigger._id!, 'isEnabled', newValue).subscribe({
        next: () => {
            const msg = newValue ? 'triggers.enabledMsg' : 'triggers.disabledMsg';
            this.toastService.success('Success', this.translate.instant(msg));
        },
        error: () => {
            trigger.isEnabled = oldValue; // Revert
            this.toastService.error('Error', 'Failed to update status - Not supported by API yet');
        }
    });
  }

  // Inline Editing
  onFieldDoubleClick(trigger: Trigger, field: string) {
    // Use internal ID for editing state key to avoid conflicts if rewardID is shared (though unlikely)
    const id = trigger._id || trigger.id;
    if (!id) return;
    
    this.editingField[id] = field;
    this.editingValue[id] = (trigger as any)[field];
    
    setTimeout(() => {
        // We need to make sure the HTML uses the same ID for the input
        const input = document.getElementById(`${field}Input_${id}`);
        if (input) input.focus();
    }, 0);
  }

  saveFieldEdit(trigger: Trigger) {
    const id = trigger._id || trigger.id;
    if (!id || !this.editingField[id]) return;

    const field = this.editingField[id];
    const value = this.editingValue[id];

    this.triggersService.updateTriggerField(id, field, value).subscribe({
        next: () => {
            (trigger as any)[field] = value;
            delete this.editingField[id];
            delete this.editingValue[id];
            this.toastService.success('Updated', 'Field updated');
        },
        error: () => {
             this.toastService.error('Error', 'Failed to update field');
        }
    });
  }

  cancelFieldEdit(trigger: Trigger) {
    const id = trigger._id || trigger.id;
    if (id) {
        delete this.editingField[id];
        delete this.editingValue[id];
    }
  }

  isEditingField(trigger: Trigger, field: string): boolean {
    const id = trigger._id || trigger.id;
    return id ? this.editingField[id] === field : false;
  }

  // Color Picker
  onColorDoubleClick(trigger: Trigger) {
    const id = trigger._id || trigger.id;
    if (!id) return;
    
    this.showColorPicker[id] = true;
    this.colorPickerValue[id] = trigger.background_color || '#6366f1';
  }

  onColorPickerSave(trigger: Trigger) {
    const id = trigger._id || trigger.id;
    if (!id) return;
    
    const newColor = this.colorPickerValue[id];
    this.triggersService.updateTriggerField(id, 'background_color', newColor).subscribe({
        next: () => {
            trigger.background_color = newColor;
            this.showColorPicker[id] = false;
            delete this.colorPickerValue[id];
        },
        error: () => this.toastService.error('Error', 'Failed to update color')
    });
  }
  
  onColorPickerCancel(trigger: Trigger) {
     const id = trigger._id || trigger.id;
     if (id) {
       this.showColorPicker[id] = false;
       delete this.colorPickerValue[id];
     }
  }

  isColorPickerOpen(trigger: Trigger): boolean {
    const id = trigger._id || trigger.id;
    return id ? this.showColorPicker[id] : false;
  }

  // Media Actions
  onMediaUploaded(media: MediaFile) {
    this.mediaFiles.unshift(media);
    this.loadMedia(true); // Refresh to ensure sync
  }

  async deleteMedia(file: MediaFile) {
    const confirmed = await this.confirmationService.confirm({
        title: this.translate.instant('media.confirmDeleteTitle'),
        message: this.translate.instant('media.confirmDeleteMsg'),
        confirmText: this.translate.instant('common.delete'),
        cancelText: this.translate.instant('common.cancel'),
        variant: 'danger'
    });

    if (confirmed) {
        this.mediaService.deleteMedia(file.id).subscribe({
            next: () => {
                this.mediaFiles = this.mediaFiles.filter(f => f.id !== file.id);
                this.toastService.success(this.translate.instant('media.deletedTitle'), this.translate.instant('media.deletedMsg'));
            },
            error: () => this.toastService.error('Error', 'Failed to delete media')
        });
    }
  }

  getCardColor(trigger: Trigger): string {
    return trigger.background_color || '#6366f1';
  }
  
  getDisabledFilter(isEnabled: boolean): string {
    return isEnabled ? 'none' : 'saturate(90%) brightness(0.9)';
  }
}
