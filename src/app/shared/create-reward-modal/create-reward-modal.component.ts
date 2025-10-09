import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, X } from 'lucide-angular';
import { LanguageService } from '../../services/language.service';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-create-reward-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
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

  labels = {
    createReward: { en: 'Create Reward', es: 'Crear Recompensa' },
    title: { en: 'Title', es: 'Título' },
    titleRequired: { en: 'Title is required', es: 'El título es requerido' },
    cost: { en: 'Cost', es: 'Costo' },
    costRequired: { en: 'Cost is required and must be greater than 0', es: 'El costo es requerido y debe ser mayor que 0' },
    prompt: { en: 'Prompt (Optional)', es: 'Descripción (Opcional)' },
    cooldown: { en: 'Cooldown (Optional)', es: 'Enfriamiento (Opcional)' },
    backgroundColor: { en: 'Background Color (Optional)', es: 'Color de Fondo (Opcional)' },
    message: { en: 'Message (Optional)', es: 'Mensaje (Opcional)' },
    premiumFeatures: { en: 'Premium Features', es: 'Características Premium' },
    originalCost: { en: 'Original Cost', es: 'Costo Original' },
    costChange: { en: 'Cost Change', es: 'Cambio de Costo' },
    returnToOriginalCost: { en: 'Return to Original Cost', es: 'Volver al Costo Original' },
    premiumRequired: { en: 'Premium subscription required', es: 'Suscripción premium requerida' },
    premiumPlusRequired: { en: 'Premium Plus subscription required', es: 'Suscripción Premium Plus requerida' },
    create: { en: 'Create', es: 'Crear' },
    cancel: { en: 'Cancel', es: 'Cancelar' },
    presetColors: { en: 'Preset Colors', es: 'Colores Predefinidos' },
    customColor: { en: 'Custom Color', es: 'Color Personalizado' }
  };

  constructor(
    public languageService: LanguageService,
    private userService: UserService
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
      this.validationErrors['title'] = this.getLabel('titleRequired');
    }

    if (!this.newReward.cost || this.newReward.cost <= 0) {
      this.validationErrors['cost'] = this.getLabel('costRequired');
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
        return this.isPremiumUser() ? '' : this.getLabel('premiumRequired');
      default:
        return '';
    }
  }

  // Translation helpers
  getLabel(key: keyof typeof this.labels): string {
    return this.languageService.getTranslation(this.labels[key]) || 'Missing translation';
  }

  getCreateReward(): string {
    return this.getLabel('createReward');
  }

  getTitle(): string {
    return this.getLabel('title');
  }

  getCost(): string {
    return this.getLabel('cost');
  }

  getPrompt(): string {
    return this.getLabel('prompt');
  }

  getCooldown(): string {
    return this.getLabel('cooldown');
  }

  getBackgroundColor(): string {
    return this.getLabel('backgroundColor');
  }

  getMessage(): string {
    return this.getLabel('message');
  }

  getPremiumFeatures(): string {
    return this.getLabel('premiumFeatures');
  }

  getOriginalCost(): string {
    return this.getLabel('originalCost');
  }

  getCostChange(): string {
    return this.getLabel('costChange');
  }

  getReturnToOriginalCost(): string {
    return this.getLabel('returnToOriginalCost');
  }

  getPremiumRequired(): string {
    return this.getLabel('premiumRequired');
  }

  getCreate(): string {
    return this.getLabel('create');
  }

  getCancel(): string {
    return this.getLabel('cancel');
  }

  getPresetColors(): string {
    return this.getLabel('presetColors');
  }

  getCustomColor(): string {
    return this.getLabel('customColor');
  }
}
