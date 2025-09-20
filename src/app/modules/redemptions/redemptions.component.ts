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
  isLoading = true;
  lang: 'EN' | 'ES' = (localStorage.getItem('lang') as 'EN' | 'ES') || 'EN';

  labels = {
    heading: { EN: 'Redemptions', ES: 'Redenciones' },
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
    errorMsg: { EN: 'Redemption ID is required.', ES: 'El ID de la redención es requerido.' }
  };
  
  constructor(
    private redemptionsService: RedemptionsService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.redemptionsService.getRedemptions().subscribe((redemptions) => {
      this.redemptions = redemptions as Redemptions[];
      this.isLoading = false;
    });
  }

  get customRedemptions(): Redemptions[] {
    return (this.redemptions || []).filter(r => r.type === 'custom');
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

    this.redemptionsService.deleteRedemption(redemption.rewardID as string).subscribe(() => {
      this.toastService.success(this.labels.deletedTitle[this.lang], this.labels.deletedMsg[this.lang]);
      this.redemptionsService.getRedemptions(true).subscribe((redemptions) => {
        this.redemptions = redemptions as Redemptions[];
      });
      this.redemptions = this.redemptions.filter(r => r !== redemption);
    });
    
  }

  onToggleEnable(redemption: Redemptions) {
    redemption.isEnabled = !redemption.isEnabled;
    // TODO: call service to persist enable/disable
    if (redemption.isEnabled) {
      this.toastService.success(this.labels.enabledTitle[this.lang], this.labels.enabledMsg[this.lang]);
    } else {
      this.toastService.warn(this.labels.disabledTitle[this.lang], this.labels.disabledMsg[this.lang]);
    }
  }
}
