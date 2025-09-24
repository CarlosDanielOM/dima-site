import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RedemptionsService } from '../../services/redemptions.service';
import { Redemptions } from '../../interfaces/redemptions';
import { ToastService } from '../../toast.service';
import { ConfirmationService } from '../../services/confirmation.service';
import { ReleaseStageService } from '../../services/release-stage.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-redemptions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './redemptions.component.html',
  styleUrl: './redemptions.component.css'
})
export class RedemptionsComponent implements OnInit {

  redemptions: Redemptions[] = [];
  twitchRedemptions: Redemptions[] = [];
  isLoading = true;
  isLoadingTwitch = true;
  refreshCooldown = 0;
  twitchRefreshCooldown = 0;
  lang: 'en' | 'es' = 'en';
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
    cooldownSeconds: { en: 'seconds remaining', es: 'segundos restantes' }
  };
  
  constructor(
    private redemptionsService: RedemptionsService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    private releaseStageService: ReleaseStageService,
    public languageService: LanguageService
  ) {}

  ngOnInit() {
    this.lang = this.languageService.getCurrentLanguage();
    this.loadRedemptions();
    this.loadTwitchRedemptions();
    this.startCooldownTimers();
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
        this.twitchRedemptions = redemptions as Redemptions[];
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
    return (this.redemptions || []).filter(r => r.type === 'custom');
  }

  get uniqueTwitchRedemptions(): Redemptions[] {
    const customTitles = new Set((this.redemptions || []).map(r => r.title.toLowerCase().trim()));
    const filtered = (this.twitchRedemptions || []).filter(r => !customTitles.has(r.title.toLowerCase().trim()));
    return filtered;
  }

  getCardColor(redemption: Redemptions): string {
    const fallback = '#6366f1'; // indigo-500
    const color = redemption.color?.trim();
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

  onEdit(redemption: Redemptions) {
    console.log('Edit redemption clicked', redemption);
    // TODO: route to edit form/modal in future iteration
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
    this.loadRedemptions(true); // Force refresh from server
    this.loadTwitchRedemptions(true); // Force refresh from server
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
