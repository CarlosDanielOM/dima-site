import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RedemptionsService } from '../../services/redemptions.service';
import { Redemptions } from '../../interfaces/redemptions';
import { ToastService } from '../../toast.service';
import { ConfirmationService } from '../../services/confirmation.service';

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
  lang: 'EN' | 'ES' = (localStorage.getItem('lang') as 'EN' | 'ES') || 'EN';
  labels = {
    heading: { EN: 'Redemptions', ES: 'Recompensas' },
    cost: { EN: 'Cost', ES: 'Costo' },
    cooldown: { EN: 'Cooldown', ES: 'Enfriamiento' },
    enabled: { EN: 'Enabled', ES: 'Habilitado' },
    disabled: { EN: 'Disabled', ES: 'Deshabilitado' },
    edit: { EN: 'Edit', ES: 'Editar' },
    delete: { EN: 'Delete', ES: 'Eliminar' },
    enable: { EN: 'Enable', ES: 'Habilitar' },
    disable: { EN: 'Disable', ES: 'Deshabilitar' },
    confirmDeleteTitle: { EN: 'Confirm Delete', ES: 'Confirmar Eliminación' },
    confirmDeleteMsg: { EN: 'Are you sure you want to delete this redemption?', ES: '¿Estás seguro de eliminar esta redención?' },
    deletedTitle: { EN: 'Deleted', ES: 'Eliminado' },
    deletedMsg: { EN: 'Redemption deleted successfully.', ES: 'Redención eliminada correctamente.' },
    cancelTitle: { EN: 'Cancelled', ES: 'Cancelado' },
    cancelMsg: { EN: 'Action was cancelled.', ES: 'La acción fue cancelada.' },
    enabledTitle: { EN: 'Enabled', ES: 'Habilitado' },
    enabledMsg: { EN: 'Redemption has been enabled.', ES: 'La redención ha sido habilitada.' },
    disabledTitle: { EN: 'Disabled', ES: 'Deshabilitado' },
    disabledMsg: { EN: 'Redemption has been disabled.', ES: 'La redención ha sido deshabilitada.' },
    errorTitle: { EN: 'Error', ES: 'Error' },
    errorMsg: { EN: 'Redemption ID is required.', ES: 'El ID de la redención es requerido.' },
    refresh: { EN: 'Refresh', ES: 'Actualizar' },
    refreshTooltip: { EN: 'Refresh data from server', ES: 'Actualizar datos del servidor' },
    refreshTitle: { EN: 'Refreshing...', ES: 'Actualizando...' },
    refreshSuccess: { EN: 'Data refreshed successfully', ES: 'Datos actualizados correctamente' },
    uniqueTwitchTitle: { EN: 'Unique Twitch Redemptions', ES: 'Redenciones Únicas de Twitch' },
    uniqueTwitchInfo: { EN: 'Shows only Twitch redemptions not already in your custom redemptions', ES: 'Muestra solo las redenciones de Twitch que no están en tus redenciones personalizadas' },
    noUniqueFound: { EN: 'No unique Twitch redemptions found', ES: 'No se encontraron redenciones únicas de Twitch' },
    allTwitchAvailable: { EN: 'All Twitch redemptions are already available as custom redemptions', ES: 'Todas las redenciones de Twitch ya están disponibles como redenciones personalizadas' },
    noTwitchFound: { EN: 'No Twitch redemptions found', ES: 'No se encontraron redenciones de Twitch' },
    cooldownActive: { EN: 'Refresh cooldown active', ES: 'Enfriamiento activo para actualizar' },
    cooldownSeconds: { EN: 'seconds remaining', ES: 'segundos restantes' }
  };
  
  constructor(
    private redemptionsService: RedemptionsService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadRedemptions();
    this.loadTwitchRedemptions();
    this.startCooldownTimers();
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
        this.toastService.error(this.labels.errorTitle[this.lang], 'Failed to load redemptions');
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
      confirmText: { EN: 'Delete', ES: 'Eliminar' },
      cancelText: { EN: 'Cancel', ES: 'Cancelar' },
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
