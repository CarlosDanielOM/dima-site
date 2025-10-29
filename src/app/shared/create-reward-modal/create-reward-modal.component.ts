import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, X } from 'lucide-angular';
import { LanguageService } from '../../services/language.service';
import { UserService } from '../../user.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-create-reward-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslateModule],
  templateUrl: './create-reward-modal.component.html',
  styleUrl: './create-reward-modal.component.css'
})
export class CreateRewardModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() rewardCreated = new EventEmitter<any>();

  plusIcon = Plus;
  xIcon = X;

  // Form data
  newReward = {
    title: '',
    cost: 0,
    prompt: '',
    cooldown: 0,
    background_color: '#6366f1',
    message: '',
    // Premium fields
    originalCost: 0,
    costChange: 0,
    returnToOriginalCost: false
  };

  // Form state
  isSubmitting = false;
  showColorPicker = false;
  validationErrors: { [key: string]: string } = {};

  // Preset colors
  presetColors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6',
    '#6366f1', '#8b5cf6', '#ec4899', '#6b7280', '#000000', '#ffffff'
  ];

  constructor(
    public languageService: LanguageService,
    private userService: UserService,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.resetForm();
  }

  ngOnChanges() {
    if (this.isOpen) {
      this.resetForm();
    }
  }

  resetForm() {
    this.newReward = {
      title: '',
      cost: 0,
      prompt: '',
      cooldown: 0,
      background_color: '#6366f1',
      message: '',
      originalCost: 0,
      costChange: 0,
      returnToOriginalCost: false
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

  onSubmit() {
    if (this.validateForm()) {
      this.isSubmitting = true;
      
      // Prepare reward data
      const rewardData = {
        title: this.newReward.title.trim(),
        cost: this.newReward.cost,
        prompt: this.newReward.prompt.trim(),
        cooldown: this.newReward.cooldown,
        background_color: this.newReward.background_color,
        message: this.newReward.message.trim(),
        type: 'custom',
        isEnabled: true,
        // Only include premium fields if user has premium access
        ...(this.isPremiumUser() && {
          originalCost: this.newReward.originalCost,
          costChange: this.newReward.costChange,
          returnToOriginalCost: this.newReward.returnToOriginalCost
        })
      };

      this.rewardCreated.emit(rewardData);
      this.closeModal();
    }
  }

  validateForm(): boolean {
    this.validationErrors = {};

    // Required fields
    if (!this.newReward.title.trim()) {
      this.validationErrors['title'] = this.translate.instant('createReward.titleRequired');
    }

    if (!this.newReward.cost || this.newReward.cost <= 0) {
      this.validationErrors['cost'] = this.translate.instant('createReward.costRequired');
    }

    // Optional field validations
    if (this.newReward.cooldown < 0) {
      this.validationErrors['cooldown'] = 'Cooldown cannot be negative';
    }

    if (this.newReward.background_color && !this.validateColor(this.newReward.background_color)) {
      this.validationErrors['background_color'] = 'Invalid color format';
    }

    return Object.keys(this.validationErrors).length === 0;
  }

  validateColor(color: string): boolean {
    if (!color || !color.trim()) return true; // Optional field
    
    const trimmedColor = color.trim();
    
    // Hex color validation
    const hexPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    if (hexPattern.test(trimmedColor)) return true;
    
    // RGB color validation
    const rgbPattern = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
    if (rgbPattern.test(trimmedColor)) return true;
    
    // RGBA color validation
    const rgbaPattern = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(0|0?\.\d+|1)\s*\)$/;
    if (rgbaPattern.test(trimmedColor)) return true;
    
    return false;
  }

  onPresetColorSelect(color: string) {
    this.newReward.background_color = color;
    this.showColorPicker = false;
  }

  toggleColorPicker() {
    this.showColorPicker = !this.showColorPicker;
  }

  // Premium functionality
  isPremiumUser(): boolean {
    return this.userService.getPremium() || this.userService.getPremiumPlus();
  }

  isPremiumPlusUser(): boolean {
    return this.userService.getPremiumPlus();
  }

  canEditPremiumField(field: string): boolean {
    switch (field) {
      case 'originalCost':
      case 'costChange':
      case 'returnToOriginalCost':
        return this.isPremiumUser();
      default:
        return true;
    }
  }

  getPremiumFieldTooltip(field: string): string {
    switch (field) {
      case 'originalCost':
      case 'costChange':
      case 'returnToOriginalCost':
        return this.isPremiumUser() ? '' : this.translate.instant('createReward.premiumRequired');
      default:
        return '';
    }
  }
}
