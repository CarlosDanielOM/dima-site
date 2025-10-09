import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RedemptionsService } from '../../services/redemptions.service';
import { Redemptions } from '../../interfaces/redemptions';
import { ToastService } from '../../toast.service';
import { ConfirmationService } from '../../services/confirmation.service';
import { ReleaseStageService } from '../../services/release-stage.service';
import { LanguageService } from '../../services/language.service';
import { UserService } from '../../user.service';
import { Crown, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-redemptions',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './redemptions.component.html',
  styleUrl: './redemptions.component.css'
})
export class RedemptionsComponent implements OnInit {

  crownIcon = Crown;

  redemptions: Redemptions[] = [];
  twitchRedemptions: Redemptions[] = [];
  isLoading = true;
  isLoadingTwitch = true;
  refreshCooldown = 0;
  twitchRefreshCooldown = 0;
  lang: 'en' | 'es' = 'en';
  
  // Cached computed properties to avoid getter calls on every change detection
  private _customRedemptions: Redemptions[] = [];
  private _uniqueTwitchRedemptions: Redemptions[] = [];
  
  // Editing state management
  editingField: { [key: string]: string } = {}; // redemptionID -> fieldName
  editingValue: { [key: string]: any } = {}; // redemptionID -> value
  bulkEditMode: { [key: string]: boolean } = {}; // redemptionID -> boolean
  originalValues: { [key: string]: any } = {}; // redemptionID -> original values
  originalFieldValues: { [key: string]: any } = {}; // redemptionID -> original field values for blur comparison
  
  // Color picker state management
  showColorPicker: { [key: string]: boolean } = {}; // redemptionID -> boolean
  colorPickerValue: { [key: string]: string } = {}; // redemptionID -> color value
  labels = {
    heading: { en: 'Redemptions', es: 'Recompensas' },
    cost: { en: 'Cost', es: 'Costo' },
    cooldown: { en: 'Cooldown', es: 'Enfriamiento' },
    enabled: { en: 'Enabled', es: 'Habilitado' },
    disabled: { en: 'Disabled', es: 'Deshabilitado' },
    edit: { en: 'Edit', es: 'Editar' },
    delete: { en: 'Delete', es: 'Eliminar' },
    enable: { en: 'Enable', es: 'Habilitar' },
    disable: { en: 'Disable', es: 'Deshabilitar' },
    confirmDeleteTitle: { en: 'Confirm Delete', es: 'Confirmar Eliminación' },
    confirmDeleteMsg: { en: 'Are you sure you want to delete this redemption?', es: '¿Estás seguro de eliminar esta redención?' },
    deletedTitle: { en: 'Deleted', es: 'Eliminado' },
    deletedMsg: { en: 'Redemption deleted successfully.', es: 'Redención eliminada correctamente.' },
    cancelTitle: { en: 'Cancelled', es: 'Cancelado' },
    cancelMsg: { en: 'Action was cancelled.', es: 'La acción fue cancelada.' },
    enabledTitle: { en: 'Enabled', es: 'Habilitado' },
    enabledMsg: { en: 'Redemption has been enabled.', es: 'La redención ha sido habilitada.' },
    disabledTitle: { en: 'Disabled', es: 'Deshabilitado' },
    disabledMsg: { en: 'Redemption has been disabled.', es: 'La redención ha sido deshabilitada.' },
    errorTitle: { en: 'Error', es: 'Error' },
    errorMsg: { en: 'Redemption ID is required.', es: 'El ID de la redención es requerido.' },
    refresh: { en: 'Refresh', es: 'Actualizar' },
    refreshTooltip: { en: 'Refresh data from server', es: 'Actualizar datos del servidor' },
    refreshTitle: { en: 'Refreshing...', es: 'Actualizando...' },
    refreshSuccess: { en: 'Data refreshed successfully', es: 'Datos actualizados correctamente' },
    uniqueTwitchTitle: { en: 'Unique Twitch Redemptions', es: 'Redenciones Únicas de Twitch' },
    uniqueTwitchInfo: { en: 'Shows only Twitch redemptions not already in your custom redemptions', es: 'Muestra solo las redenciones de Twitch que no están en tus redenciones personalizadas' },
    noUniqueFound: { en: 'No unique Twitch redemptions found', es: 'No se encontraron redenciones únicas de Twitch' },
    allTwitchAvailable: { en: 'All Twitch redemptions are already available as custom redemptions', es: 'Todas las redenciones de Twitch ya están disponibles como redenciones personalizadas' },
    noTwitchFound: { en: 'No Twitch redemptions found', es: 'No se encontraron redenciones de Twitch' },
    cooldownActive: { en: 'Refresh cooldown active', es: 'Enfriamiento activo para actualizar' },
    cooldownSeconds: { en: 'seconds remaining', es: 'segundos restantes' },
    save: { en: 'Save', es: 'Guardar' },
    cancel: { en: 'Cancel', es: 'Cancelar' },
    title: { en: 'Title', es: 'Título' },
    prompt: { en: 'Prompt', es: 'Descripción' },
    duration: { en: 'Duration', es: 'Duración' },
    editMode: { en: 'Edit Mode', es: 'Modo Edición' },
    exitEditMode: { en: 'Exit Edit Mode', es: 'Salir del Modo Edición' },
    saveAll: { en: 'Save All', es: 'Guardar Todo' },
    cancelAll: { en: 'Cancel All', es: 'Cancelar Todo' },
    originalCost: { en: 'Original Cost', es: 'Costo Original' },
    costChange: { en: 'Cost Change', es: 'Cambio de Costo' },
    returnToOriginalCost: { en: 'Return to Original Cost', es: 'Volver al Costo Original' },
    premiumFeature: { en: 'Premium Feature', es: 'Función Premium' },
    premiumRequired: { en: 'Premium subscription required', es: 'Suscripción premium requerida' },
    premiumPlusRequired: { en: 'Premium Plus subscription required', es: 'Suscripción Premium Plus requerida' },
    message: { en: 'Message', es: 'Mensaje' },
    noMessageAvailable: { en: 'No Message Available', es: 'Sin Mensaje Disponible' }
  };
  
  constructor(
    private redemptionsService: RedemptionsService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    private releaseStageService: ReleaseStageService,
    public languageService: LanguageService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.lang = this.languageService.getCurrentLanguage();
    this.loadRedemptions();
    this.loadTwitchRedemptions();
    this.startCooldownTimers();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Close color picker if clicking outside
    const target = event.target as HTMLElement;
    if (!target.closest('.color-picker-popup') && !target.closest('.color-bar')) {
      // Close all open color pickers
      Object.keys(this.showColorPicker).forEach(redemptionID => {
        if (this.showColorPicker[redemptionID]) {
          this.showColorPicker[redemptionID] = false;
          delete this.colorPickerValue[redemptionID];
        }
      });
    }
  }

  // Helper methods for translations
  getLabel(key: keyof typeof this.labels): string {
    return this.languageService.getTranslation(this.labels[key]) || 'Missing translation';
  }

  getHeading(): string {
    return this.languageService.getTranslation(this.labels.heading) || 'Redemptions';
  }

  getRefreshText(): string {
    return this.languageService.getTranslation(this.labels.refresh) || 'Refresh';
  }

  getCooldownActive(): string {
    return this.languageService.getTranslation(this.labels.cooldownActive) || 'Refresh cooldown active';
  }

  getCooldownSeconds(): string {
    return this.languageService.getTranslation(this.labels.cooldownSeconds) || 'seconds remaining';
  }

  getRefreshTooltip(): string {
    return this.languageService.getTranslation(this.labels.refreshTooltip) || 'Refresh data from server';
  }

  getEnabled(): string {
    return this.languageService.getTranslation(this.labels.enabled) || 'Enabled';
  }

  getDisabled(): string {
    return this.languageService.getTranslation(this.labels.disabled) || 'Disabled';
  }

  getCost(): string {
    return this.languageService.getTranslation(this.labels.cost) || 'Cost';
  }

  getCooldown(): string {
    return this.languageService.getTranslation(this.labels.cooldown) || 'Cooldown';
  }

  getEdit(): string {
    return this.languageService.getTranslation(this.labels.edit) || 'Edit';
  }

  getDelete(): string {
    return this.languageService.getTranslation(this.labels.delete) || 'Delete';
  }

  getEnable(): string {
    return this.languageService.getTranslation(this.labels.enable) || 'Enable';
  }

  getDisable(): string {
    return this.languageService.getTranslation(this.labels.disable) || 'Disable';
  }

  getSave(): string {
    return this.languageService.getTranslation(this.labels.save) || 'Save';
  }

  getCancel(): string {
    return this.languageService.getTranslation(this.labels.cancel) || 'Cancel';
  }

  getTitle(): string {
    return this.languageService.getTranslation(this.labels.title) || 'Title';
  }

  getPrompt(): string {
    return this.languageService.getTranslation(this.labels.prompt) || 'Prompt';
  }

  getDuration(): string {
    return this.languageService.getTranslation(this.labels.duration) || 'Duration';
  }

  getEditMode(): string {
    return this.languageService.getTranslation(this.labels.editMode) || 'Edit Mode';
  }

  getExitEditMode(): string {
    return this.languageService.getTranslation(this.labels.exitEditMode) || 'Exit Edit Mode';
  }

  getSaveAll(): string {
    return this.languageService.getTranslation(this.labels.saveAll) || 'Save All';
  }

  getCancelAll(): string {
    return this.languageService.getTranslation(this.labels.cancelAll) || 'Cancel All';
  }

  getOriginalCost(): string {
    return this.languageService.getTranslation(this.labels.originalCost) || 'Original Cost';
  }

  getCostChange(): string {
    return this.languageService.getTranslation(this.labels.costChange) || 'Cost Change';
  }

  getReturnToOriginalCost(): string {
    return this.languageService.getTranslation(this.labels.returnToOriginalCost) || 'Return to Original Cost';
  }

  getPremiumFeature(): string {
    return this.languageService.getTranslation(this.labels.premiumFeature) || 'Premium Feature';
  }

  getPremiumRequired(): string {
    return this.languageService.getTranslation(this.labels.premiumRequired) || 'Premium subscription required';
  }

  getPremiumPlusRequired(): string {
    return this.languageService.getTranslation(this.labels.premiumPlusRequired) || 'Premium Plus subscription required';
  }

  getMessage(): string {
    return this.languageService.getTranslation(this.labels.message) || 'Message';
  }

  getNoMessageAvailable(): string {
    return this.languageService.getTranslation(this.labels.noMessageAvailable) || 'No Message Available';
  }

  // Color picker methods
  onColorDoubleClick(redemption: Redemptions) {
    const redemptionID = redemption.rewardID || redemption.eventsubID;
    if (!redemptionID) return;
    
    this.showColorPicker[redemptionID] = true;
    this.colorPickerValue[redemptionID] = redemption.background_color || '#6366f1';
    
    // Focus the color input field after a brief delay to ensure it's rendered
    setTimeout(() => {
      this.focusColorInput(redemptionID);
    }, 0);
  }

  onColorPickerSave(redemption: Redemptions) {
    const redemptionID = redemption.rewardID || redemption.eventsubID;
    if (!redemptionID) return;
    
    const newColor = this.colorPickerValue[redemptionID];
    
    // Validate color format
    if (this.validateColor(newColor)) {
      this.redemptionsService.updateRedemptionField(redemptionID, 'background_color', newColor).subscribe({
        next: () => {
          redemption.background_color = newColor;
          this.showColorPicker[redemptionID] = false;
          delete this.colorPickerValue[redemptionID];
          this.toastService.success('Updated', 'Background color updated successfully');
        },
        error: (error) => {
          console.error('Error updating background color:', error);
          this.toastService.error('Error', 'Failed to update background color');
        }
      });
    } else {
      this.toastService.error('Invalid Color', 'Please enter a valid color format (hex, rgb, or rgba)');
    }
  }

  onColorPickerCancel(redemption: Redemptions) {
    const redemptionID = redemption.rewardID || redemption.eventsubID;
    if (!redemptionID) return;
    
    this.showColorPicker[redemptionID] = false;
    delete this.colorPickerValue[redemptionID];
  }

  onPresetColorSelect(redemption: Redemptions, color: string) {
    const redemptionID = redemption.rewardID || redemption.eventsubID;
    if (!redemptionID) return;
    
    this.colorPickerValue[redemptionID] = color;
  }

  isColorPickerOpen(redemption: Redemptions): boolean {
    const redemptionID = redemption.rewardID || redemption.eventsubID;
    return redemptionID ? this.showColorPicker[redemptionID] || false : false;
  }

  private validateColor(color: string): boolean {
    if (!color || !color.trim()) return false;
    
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

  private focusInputField(redemptionID: string, field: string) {
    const inputId = `${field}Input_${redemptionID}`;
    const inputElement = document.getElementById(inputId) as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
      inputElement.select();
    }
  }

  private focusColorInput(redemptionID: string) {
    const colorInputId = `colorInput_${redemptionID}`;
    const colorInputElement = document.getElementById(colorInputId) as HTMLInputElement;
    if (colorInputElement) {
      colorInputElement.focus();
      colorInputElement.select();
    }
  }

  // Premium functionality methods
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

  hasPremiumData(redemption: Redemptions): boolean {
    return redemption.originalCost !== undefined || 
           redemption.costChange !== undefined || 
           redemption.returnToOriginalCost !== undefined;
  }

  getPremiumFieldTooltip(field: string): string {
    switch (field) {
      case 'originalCost':
      case 'costChange':
      case 'returnToOriginalCost':
        return this.isPremiumUser() ? '' : this.getPremiumRequired();
      default:
        return '';
    }
  }

  getRedemptionMessage(redemption: Redemptions): string {
    return redemption.message && redemption.message.trim() ? redemption.message : this.getNoMessageAvailable();
  }

  private startCooldownTimers() {
    // Update cooldown counters every second
    setInterval(() => {
      if (this.refreshCooldown > 0) {
        this.refreshCooldown--;
      }
      if (this.twitchRefreshCooldown > 0) {
        this.twitchRefreshCooldown--;
      }
    }, 1000);
  }

  private startRefreshCooldown() {
    this.refreshCooldown = 30; // 30 seconds cooldown
  }

  private startTwitchRefreshCooldown() {
    this.twitchRefreshCooldown = 30; // 30 seconds cooldown
  }

  private loadRedemptions(forceRefresh = false) {
    this.isLoading = true;
    this.redemptionsService.getRedemptions(forceRefresh).subscribe({
      next: (redemptions) => {
        this.redemptions = redemptions as Redemptions[];
        // Only update if Twitch redemptions are already loaded
        if (this.twitchRedemptions.length > 0) {
          this.updateCustomRedemptions();
          this.updateUniqueTwitchRedemptions();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading redemptions:', error);
        this.isLoading = false;
        this.toastService.error(this.labels.errorTitle[this.lang], this.labels.errorMsg[this.lang]);
      }
    });
  }

  private loadTwitchRedemptions(forceRefresh = false) {
    this.isLoadingTwitch = true;
    this.redemptionsService.getTwitchRedemptions(forceRefresh).subscribe({
      next: (redemptions) => {
        // Map Twitch API response to our Redemptions interface
        this.twitchRedemptions = redemptions.map((twitchReward: any) => ({
          eventsubID: twitchReward.id,
          channelID: twitchReward.broadcaster_id,
          channel: twitchReward.broadcaster_login,
          rewardID: twitchReward.id,
          id: twitchReward.id,
          title: twitchReward.title,
          type: 'twitch',
          prompt: twitchReward.prompt || '',
          originalCost: twitchReward.cost,
          cost: twitchReward.cost,
          isEnabled: twitchReward.is_enabled,
          message: '',
          costChange: 0,
          returnToOriginalCost: false,
          duration: 0,
          cooldown: twitchReward.global_cooldown_setting?.global_cooldown_seconds || 0,
          background_color: twitchReward.background_color
        })) as Redemptions[];
        // Always update both when Twitch data is loaded
        this.updateCustomRedemptions();
        this.updateUniqueTwitchRedemptions();
        this.isLoadingTwitch = false;
      },
      error: (error) => {
        console.error('❌ Error loading Twitch redemptions:', error);
        this.isLoadingTwitch = false;
        this.toastService.error(this.labels.errorTitle[this.lang], 'Failed to load Twitch redemptions');
      }
    });
  }

  get customRedemptions(): Redemptions[] {
    return this._customRedemptions;
  }

  get uniqueTwitchRedemptions(): Redemptions[] {
    return this._uniqueTwitchRedemptions;
  }

  private updateCustomRedemptions() {
    const customRedemptions = (this.redemptions || []).filter(r => r.type === 'custom');
    
    // Merge custom redemptions with Twitch data where titles match
    this._customRedemptions = customRedemptions.map(customRedemption => {
      // Find matching Twitch redemption by title (case-insensitive)
      const matchingTwitch = (this.twitchRedemptions || []).find(twitch => 
        twitch.title.toLowerCase().trim() === customRedemption.title.toLowerCase().trim()
      );
      
      if (matchingTwitch) {
        // Merge data: custom takes priority, but fill missing fields from Twitch
        return {
          ...matchingTwitch, // Start with Twitch data as base
          ...customRedemption, // Override with custom data (priority)
          // Ensure we keep the custom redemption's unique identifiers
          rewardID: customRedemption.rewardID,
          id: customRedemption.id,
          type: customRedemption.type,
          // Keep custom's cost, cooldown, enabled status, etc.
          cost: customRedemption.cost,
          cooldown: customRedemption.cooldown,
          isEnabled: customRedemption.isEnabled,
          prompt: customRedemption.prompt,
          // But keep Twitch's background_color if custom doesn't have it
          background_color: customRedemption.background_color || matchingTwitch.background_color
        };
      }
      
      return customRedemption;
    });
  }

  private updateUniqueTwitchRedemptions() {
    const customTitles = new Set((this.redemptions || []).map(r => r.title.toLowerCase().trim()));
    this._uniqueTwitchRedemptions = (this.twitchRedemptions || []).filter(r => !customTitles.has(r.title.toLowerCase().trim()));
  }

  getCardColor(redemption: Redemptions): string {
    const fallback = '#6366f1'; // indigo-500
    const color = redemption.background_color?.trim();
    // Basic validation for hex or rgb(a)
    if (!color) return fallback;
    const isHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color);
    const isRgb = /^rgb\((\s*\d+\s*,){2}\s*\d+\s*\)$/.test(color);
    const isRgba = /^rgba\((\s*\d+\s*,){3}\s*(0|0?\.\d+|1)\s*\)$/.test(color);
    return (isHex || isRgb || isRgba) ? color : fallback;
  }

  getDisabledFilter(isEnabled: boolean): string {
    return isEnabled ? 'none' : 'saturate(90%) brightness(0.9)';
  }

  // Editing methods
  onEdit(redemption: Redemptions) {
    const redemptionID = redemption.rewardID || redemption.eventsubID;
    if (!redemptionID) return;
    
    this.bulkEditMode[redemptionID] = true;
    this.originalValues[redemptionID] = {
      title: redemption.title,
      prompt: redemption.prompt,
      cost: redemption.cost,
      cooldown: redemption.cooldown,
      message: redemption.message,
      background_color: redemption.background_color,
      originalCost: redemption.originalCost,
      costChange: redemption.costChange,
      returnToOriginalCost: redemption.returnToOriginalCost
    };
  }

  exitBulkEditMode(redemption: Redemptions) {
    const redemptionID = redemption.rewardID || redemption.eventsubID;
    if (!redemptionID) return;
    
    this.bulkEditMode[redemptionID] = false;
    delete this.originalValues[redemptionID];
  }

  onFieldDoubleClick(redemption: Redemptions, field: string) {
    const redemptionID = redemption.rewardID || redemption.eventsubID;
    if (!redemptionID) return;
    
    // Check if user can edit premium fields
    if (!this.canEditPremiumField(field)) {
      this.toastService.warn(this.getPremiumFeature(), this.getPremiumFieldTooltip(field));
      return;
    }
    
    this.editingField[redemptionID] = field;
    this.editingValue[redemptionID] = (redemption as any)[field];
    
    // Store the original value for blur comparison
    this.originalFieldValues[redemptionID] = (redemption as any)[field];
    
    // Focus the input field after a brief delay to ensure it's rendered
    setTimeout(() => {
      this.focusInputField(redemptionID, field);
    }, 0);
  }

  saveFieldEdit(redemption: Redemptions) {
    const redemptionID = redemption.rewardID || redemption.eventsubID;
    if (!redemptionID || !this.editingField[redemptionID]) return;
    
    const field = this.editingField[redemptionID];
    const value = this.editingValue[redemptionID];
    
    // Check if user can edit premium fields
    if (!this.canEditPremiumField(field)) {
      this.toastService.warn(this.getPremiumFeature(), this.getPremiumFieldTooltip(field));
      return;
    }
    
    // Validate input
    if (this.validateField(field, value)) {
      this.redemptionsService.updateRedemptionField(redemptionID, field, value).subscribe({
        next: () => {
          (redemption as any)[field] = value;
          delete this.editingField[redemptionID];
          delete this.editingValue[redemptionID];
          delete this.originalFieldValues[redemptionID];
          this.toastService.success('Updated', `${field} updated successfully`);
        },
        error: (error) => {
          console.error('Error updating field:', error);
          this.toastService.error('Error', `Failed to update ${field}`);
        }
      });
    }
  }

  cancelFieldEdit(redemption: Redemptions) {
    const redemptionID = redemption.rewardID || redemption.eventsubID;
    if (!redemptionID) return;
    
    delete this.editingField[redemptionID];
    delete this.editingValue[redemptionID];
    delete this.originalFieldValues[redemptionID];
  }

  onFieldBlur(redemption: Redemptions, field: string) {
    const redemptionID = redemption.rewardID || redemption.eventsubID;
    if (!redemptionID || !this.editingField[redemptionID]) return;
    
    const currentValue = this.editingValue[redemptionID];
    const originalValue = this.originalFieldValues[redemptionID];
    
    // Compare values to determine if we should save or cancel
    if (this.valuesAreEqual(currentValue, originalValue)) {
      // Values are the same, cancel the edit
      this.cancelFieldEdit(redemption);
    } else {
      // Values are different, save the edit
      this.saveFieldEdit(redemption);
    }
  }

  onColorInputBlur(redemption: Redemptions) {
    const redemptionID = redemption.rewardID || redemption.eventsubID;
    if (!redemptionID) return;
    
    const currentValue = this.colorPickerValue[redemptionID];
    const originalValue = redemption.background_color || '#6366f1';
    
    // Compare values to determine if we should save or cancel
    if (this.valuesAreEqual(currentValue, originalValue)) {
      // Values are the same, cancel the color picker
      this.onColorPickerCancel(redemption);
    } else {
      // Values are different, save the color
      this.onColorPickerSave(redemption);
    }
  }

  private valuesAreEqual(value1: any, value2: any): boolean {
    // Handle different data types appropriately
    if (typeof value1 === 'string' && typeof value2 === 'string') {
      return value1.trim() === value2.trim();
    }
    
    if (typeof value1 === 'number' && typeof value2 === 'number') {
      return value1 === value2;
    }
    
    if (typeof value1 === 'boolean' && typeof value2 === 'boolean') {
      return value1 === value2;
    }
    
    // Fallback to strict equality
    return value1 === value2;
  }

  saveBulkEdit(redemption: Redemptions) {
    const redemptionID = redemption.rewardID || redemption.eventsubID;
    if (!redemptionID) return;
    
    const updatedRedemption: Partial<Redemptions> = {
      title: redemption.title,
      prompt: redemption.prompt,
      cost: redemption.cost,
      cooldown: redemption.cooldown,
      message: redemption.message,
      background_color: redemption.background_color
    };

    // Only include premium fields if user has premium access
    if (this.isPremiumUser()) {
      updatedRedemption.originalCost = redemption.originalCost;
      updatedRedemption.costChange = redemption.costChange;
      updatedRedemption.returnToOriginalCost = redemption.returnToOriginalCost;
    }
    
    this.redemptionsService.updateRedemption(redemptionID, updatedRedemption).subscribe({
      next: () => {
        this.bulkEditMode[redemptionID] = false;
        delete this.originalValues[redemptionID];
        this.toastService.success('Updated', 'Redemption updated successfully');
      },
      error: (error) => {
        console.error('Error updating redemption:', error);
        this.toastService.error('Error', 'Failed to update redemption');
      }
    });
  }

  cancelBulkEdit(redemption: Redemptions) {
    const redemptionID = redemption.rewardID || redemption.eventsubID;
    if (!redemptionID || !this.originalValues[redemptionID]) return;
    
    const original = this.originalValues[redemptionID];
    redemption.title = original.title;
    redemption.prompt = original.prompt;
    redemption.cost = original.cost;
    redemption.cooldown = original.cooldown;
    redemption.message = original.message;
    redemption.background_color = original.background_color;
    
    // Only restore premium fields if they were originally present
    if (original.originalCost !== undefined) {
      redemption.originalCost = original.originalCost;
    }
    if (original.costChange !== undefined) {
      redemption.costChange = original.costChange;
    }
    if (original.returnToOriginalCost !== undefined) {
      redemption.returnToOriginalCost = original.returnToOriginalCost;
    }
    
    this.bulkEditMode[redemptionID] = false;
    delete this.originalValues[redemptionID];
  }

  private validateField(field: string, value: any): boolean {
    switch (field) {
      case 'title':
        return typeof value === 'string' && value.trim().length > 0;
      case 'prompt':
        return typeof value === 'string';
      case 'message':
        return typeof value === 'string';
      case 'cost':
        return typeof value === 'number' && value >= 0;
      case 'cooldown':
        return typeof value === 'number' && value >= 0;
      case 'originalCost':
        return typeof value === 'number' && value >= 0;
      case 'costChange':
        return typeof value === 'number';
      case 'returnToOriginalCost':
        return typeof value === 'boolean';
      case 'background_color':
        return typeof value === 'string' && this.validateColor(value);
      default:
        return true;
    }
  }

  isEditingField(redemption: Redemptions, field: string): boolean {
    const redemptionID = redemption.rewardID || redemption.eventsubID;
    return redemptionID ? this.editingField[redemptionID] === field : false;
  }

  isInBulkEditMode(redemption: Redemptions): boolean {
    const redemptionID = redemption.rewardID || redemption.eventsubID;
    return redemptionID ? this.bulkEditMode[redemptionID] || false : false;
  }

  async onDelete(redemption: Redemptions) {
    if (!redemption.rewardID) {
      this.toastService.error(this.labels.errorTitle[this.lang], this.labels.errorMsg[this.lang]);
      return;
    }

    let deleteConfirmed = await this.confirmationService.confirm({
      title: this.labels.confirmDeleteTitle,
      message: this.labels.confirmDeleteMsg,
      confirmText: { en: 'Delete', es: 'Eliminar' },
      cancelText: { en: 'Cancel', es: 'Cancelar' },
      variant: 'danger'
    });

    if (!deleteConfirmed) {
      this.toastService.info(this.labels.cancelTitle[this.lang], this.labels.cancelMsg[this.lang]);
      return;
    }

    this.redemptionsService.deleteRedemption(redemption.rewardID as string).subscribe({
      next: () => {
        this.toastService.success(this.labels.deletedTitle[this.lang], this.labels.deletedMsg[this.lang]);
        this.loadRedemptions(true); // Refresh redemptions after deletion (force refresh)
      },
      error: (error) => {
        console.error('Error deleting redemption:', error);
        // Revert the UI change since deletion failed
        redemption.isEnabled = !redemption.isEnabled;
      }
    });
    
  }

  onToggleEnable(redemption: Redemptions) {
    const wasEnabled = redemption.isEnabled;
    redemption.isEnabled = !wasEnabled;

    const field = 'isEnabled';
    this.redemptionsService.updateRedemptionField(redemption.rewardID!, field, redemption.isEnabled).subscribe({
      next: () => {
        const successTitle = redemption.isEnabled ? this.labels.enabledTitle[this.lang] : this.labels.disabledTitle[this.lang];
        const successMsg = redemption.isEnabled ? this.labels.enabledMsg[this.lang] : this.labels.disabledMsg[this.lang];
        this.toastService.success(successTitle, successMsg);
      },
      error: (error) => {
        console.error('Error updating redemption:', error);
        // Revert the UI change since update failed
        redemption.isEnabled = wasEnabled;
        this.toastService.error(this.labels.errorTitle[this.lang], 'Failed to update redemption status');
      }
    });
  }

  refreshData() {
    if (this.refreshCooldown > 0) {
      this.toastService.warn(this.labels.cooldownActive[this.lang], `${this.refreshCooldown} ${this.labels.cooldownSeconds[this.lang]}`);
      return;
    }

    this.toastService.info(this.labels.refreshTitle[this.lang], '');
    // Load Twitch redemptions first, then custom redemptions to ensure proper merging
    this.loadTwitchRedemptions(true); // Force refresh from server
    this.loadRedemptions(true); // Force refresh from server
    this.startRefreshCooldown();

    // Show success message after a brief delay
    setTimeout(() => {
      this.toastService.success(this.labels.refreshSuccess[this.lang], '');
    }, 500);
  }

  refreshRedemptions() {
    if (this.refreshCooldown > 0) {
      this.toastService.warn(this.labels.cooldownActive[this.lang], `${this.refreshCooldown} ${this.labels.cooldownSeconds[this.lang]}`);
      return;
    }

    this.toastService.info(this.labels.refreshTitle[this.lang], '');
    this.loadRedemptions(true); // Force refresh from server
    this.startRefreshCooldown();

    // Show success message after a brief delay
    setTimeout(() => {
      this.toastService.success(this.labels.refreshSuccess[this.lang], '');
    }, 500);
  }

  refreshTwitchRedemptions() {
    if (this.twitchRefreshCooldown > 0) {
      this.toastService.warn(this.labels.cooldownActive[this.lang], `${this.twitchRefreshCooldown} ${this.labels.cooldownSeconds[this.lang]}`);
      return;
    }

    this.toastService.info(this.labels.refreshTitle[this.lang], '');
    this.loadTwitchRedemptions(true); // Force refresh from server
    this.startTwitchRefreshCooldown();

    // Show success message after a brief delay
    setTimeout(() => {
      this.toastService.success(this.labels.refreshSuccess[this.lang], '');
    }, 500);
  }
}
