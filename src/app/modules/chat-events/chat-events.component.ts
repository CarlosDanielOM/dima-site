import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  UserPlus,
  Heart,
  Zap,
  Users,
  MessageCircle,
  VolumeX,
  Gamepad2,
  Check,
  X,
  Wrench,
  Crown,
  Clock,
  Terminal,
  Award,
  Star,
  Trophy,
  FlaskConical,
  Lock,
  Trash2,
  Play,
  PlusCircle,
} from 'lucide-angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EventsubService } from '../../eventsub.service';
import { ToastService } from '../../toast.service';
import { UserService } from '../../user.service';
import { ConfirmationService } from '../../services/confirmation.service';
import { ReleaseStageService } from '../../services/release-stage.service';
import { LanguageService } from '../../services/language.service';
import { ReleaseStage } from '../../interfaces/releasestage';

// Interfaces remain the same
export interface CheerTier {
  id: string;
  name: string;
  message: string;
  minAmount: number;
  maxAmount: number;
}

export interface ConfigControl {
  id: string;
  dbId?: string;
  label: { en: string; es: string; };
  type: 'text' | 'number' | 'checkbox' | 'message-tiers' | 'select';
  value: string | number | boolean | CheerTier[];
  placeholder?: string;
  showIf?: { controlId: string; is: any; };
  canDisable?: boolean;
}

export interface ChatEvent {
  name:string;
  type: string;
  version: string;
  condition?: { [key: string]: string | undefined; };
  description: { en: string; es: string; };
  icon: any;
  color: string;
  textColor: string;
  releaseStage: ReleaseStage;
  enabled: boolean;
  premium?: boolean;
  premium_plus?: boolean;
  isConfiguring?: boolean;
  isSubscribed?: boolean;
  config?: ConfigControl[];
  tierLimits?: {
    premium: number;
    premium_plus: number;
  };
}

@Component({
  selector: 'app-chat-events',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, TranslateModule],
  templateUrl: './chat-events.component.html',
  styleUrl: './chat-events.component.css',
})
export class ChatEventsComponent implements OnInit {
  lang: 'en' | 'es' = this.languageService.getCurrentLanguage();
  crownIcon = Crown;
  checkIcon = Check;
  xIcon = X;
  lockIcon = Lock;
  trashIcon = Trash2;
  plusCircleIcon = PlusCircle;

  // Icon mapping from string names to actual icon components
  private iconMap: { [key: string]: any } = {
    'UserPlus': UserPlus,
    'Heart': Heart,
    'Zap': Zap,
    'Users': Users,
    'MessageCircle': MessageCircle,
    'VolumeX': VolumeX,
    'Gamepad2': Gamepad2,
    'Check': Check,
    'X': X,
    'Wrench': Wrench,
    'Crown': Crown,
    'Clock': Clock,
    'Terminal': Terminal,
    'Award': Award,
    'Star': Star,
    'Trophy': Trophy,
    'FlaskConical': FlaskConical,
    'Lock': Lock,
    'Trash2': Trash2,
    'Play': Play,
    'PlusCircle': PlusCircle,
  };
  tierInfoMessage: { message: string; level: 'upsell-plus' | 'upsell-premium' | 'limit-reached' } | null = null;

  userPremiumStatus: 'none' | 'premium' | 'premium_plus' = 'none';

  permissionMessages = {
    needs_premium: {
      en: 'Requires Premium',
      es: 'Requiere Premium',
    },
    needs_premium_plus: {
      en: 'Requires Premium Plus',
      es: 'Requiere Premium Plus',
    },
  };

  deleteConfirmationMessages = {
    title: {
      en: 'Confirm Deletion',
      es: 'Confirmar Eliminación',
    },
    areYouSure: {
      en: 'Are you sure you want to delete the event',
      es: '¿Estás seguro de que quieres eliminar el evento',
    },
    warning: {
      en: 'All associated data will be erased and it will need to be reconfigured if you want to use it again.',
      es: 'Todos los datos asociados se borrarán y deberá reconfigurarse si quieres volver a usarlo.',
    }
  };

  private prepareConfigForSave(configControls: ConfigControl[]): any {
    const payload: { [key: string]: any } = {};
    for (const control of configControls) {
      // Ensure dbId exists and value is not undefined before adding to payload
      if (control.dbId && control.value !== undefined) {
        payload[control.dbId] = control.value;
      }
    }
    return payload;
  }

  actionNotAllowedMessages = {
    title: {
      en: 'Action Not Allowed',
      es: 'Acción no permitida',
    },
    cannotDisable: {
      en: 'This event cannot be disabled. To turn it off, clear the message in its configuration.',
      es: 'Este evento no se puede desactivar. Para apagarlo, borra el contenido del mensaje en su configuración.',
    },
    cannotDelete: {
      en: 'This event cannot be deleted because it is essential for the bot to work properly.',
      es: 'Este evento no se puede eliminar porque es esencial para el funcionamiento del bot.',
    }
  };

  statusMessages = {
    notCreated: { en: 'Not Created', es: 'No Creado' },
    enabled: { en: 'Enabled', es: 'Activado' },
    disabled: { en: 'Disabled', es: 'Desactivado' },
    betaEnabled: { en: 'Beta Enabled', es: 'Beta Activada' },
    tryTheBeta: { en: 'Try the Beta!', es: '¡Prueba la Beta!' },
    alphaEnabled: { en: 'Alpha Enabled', es: 'Alfa Activada' },
    tryTheAlpha: { en: 'Try the Alpha!', es: '¡Prueba la Alfa!' },
  };

  
  chatEvents: ChatEvent[] = [];
  isLoading = true;

  constructor(
    private eventsubService: EventsubService,
    private toastService: ToastService,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private releaseStageService: ReleaseStageService,
    private languageService: LanguageService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.userPremiumStatus = this.userService.getPremiumStatus() as 'none' | 'premium' | 'premium_plus';
    this.lang = this.languageService.getCurrentLanguage();

    this.eventsubService.getEvents().subscribe(events => {
      this.chatEvents = events;
      this.isLoading = false;
    });
  }

  // Helper functions for translations
  getEventDescription(description: { en: string; es: string }): string {
    if (!description || typeof description !== 'object') {
      console.error('Invalid description object:', description);
      return 'Invalid description';
    }
    return this.languageService.getTranslation(description);
  }

  getControlLabel(label: { en: string; es: string }): string {
    if (!label || typeof label !== 'object') {
      console.error('Invalid label object:', label);
      return 'Invalid label';
    }
    return this.languageService.getTranslation(label);
  }

  getPermissionMessage(type: 'needs_premium' | 'needs_premium_plus'): string {
    return this.languageService.getTranslation(this.permissionMessages[type]);
  }

  getCurrentLanguage(): 'en' | 'es' {
    return this.languageService.getCurrentLanguage();
  }

  // NEW: A single function to determine the visual status, including permissions
  getEventDisplayStatus(event: ChatEvent): { text: string; icon: any; color: string } {
    const access = this.getUserAccess(event);
    if (!access.canAccess && access.reason) {
      // New logic to add context to the permission message
      let message = this.getPermissionMessage(access.reason);
      if (event.releaseStage === 'alpha' || event.releaseStage === 'beta') {
        const stageInfo = this.releaseStageService.getStageInfo(event.releaseStage);
        message += ` (${this.languageService.getTranslation(stageInfo.message)} Access)`;
      }
      return {
        text: message,
        icon: this.lockIcon,
        color: 'text-yellow-600',
      };
    }

    // Handle Alpha and Beta stages specifically
    if (event.releaseStage === 'alpha' || event.releaseStage === 'beta') {
      const stageInfo = this.releaseStageService.getStageInfo(event.releaseStage);

      if (event.isSubscribed === false) {
        // Not subscribed, show call to action
        const text = event.releaseStage === 'alpha'
          ? this.languageService.getTranslation(this.statusMessages.tryTheAlpha)
          : this.languageService.getTranslation(this.statusMessages.tryTheBeta);
        return { text, icon: stageInfo.icon, color: stageInfo.color };
      } else {
        // Is subscribed, check if enabled or disabled
        if (event.enabled) {
          const text = event.releaseStage === 'alpha'
            ? this.languageService.getTranslation(this.statusMessages.alphaEnabled)
            : this.languageService.getTranslation(this.statusMessages.betaEnabled);
          return { text, icon: stageInfo.icon, color: stageInfo.color };
        } else {
          return { text: this.languageService.getTranslation(this.statusMessages.disabled), icon: this.xIcon, color: 'text-red-500' };
        }
      }
    }

    // Handle Stable stage
    if (event.releaseStage === 'stable') {
      if (event.isSubscribed === false) {
        return { text: this.languageService.getTranslation(this.statusMessages.notCreated), icon: this.plusCircleIcon, color: 'text-gray-500' };
      } else {
        if (event.enabled) {
          return { text: this.languageService.getTranslation(this.statusMessages.enabled), icon: this.checkIcon, color: 'text-green-500' };
        } else {
          return { text: this.languageService.getTranslation(this.statusMessages.disabled), icon: this.xIcon, color: 'text-red-500' };
        }
      }
    }

    // Fallback for other stages like 'coming_soon', 'maintenance'
    const stageInfo = this.releaseStageService.getStageInfo(event.releaseStage);
    return { text: this.languageService.getTranslation(stageInfo.message), icon: stageInfo.icon, color: stageInfo.color };
  }

  canBeDisabled(event: ChatEvent): boolean {
    if (!event.config || event.config.length === 0) {
      return true;
    }
    return event.config[0].canDisable !== false;
  }

  // NEW: Helper to check if the user has permission to interact with the event
  getUserAccess(event: ChatEvent): { canAccess: boolean; reason?: 'needs_premium' | 'needs_premium_plus' } {
    return this.releaseStageService.getUserAccess(event, this.userPremiumStatus);
  }
  
  toggleConfigure(eventName: string): void {
    let configuringEvent: ChatEvent | undefined;
     this.chatEvents = this.chatEvents.map(event => {
      if (event.name === eventName) {
        configuringEvent = event;
        return { ...event, isConfiguring: !event.isConfiguring };
      }
      return { ...event, isConfiguring: false };
    });

    if (configuringEvent && configuringEvent.config) {
      const tierControl = configuringEvent.config.find(c => c.id === 'cheerTiers');
      if (tierControl) {
        this.setTierInfoMessage(configuringEvent, tierControl.value);
      }
    } else {
      this.tierInfoMessage = null;
    }
  }

  toggleFeature(eventToToggle: ChatEvent): void {
    if (!this.canBeDisabled(eventToToggle) && eventToToggle.enabled) {
      this.toastService.info(
        this.languageService.getTranslation(this.actionNotAllowedMessages.title),
        this.languageService.getTranslation(this.actionNotAllowedMessages.cannotDisable)
      );
      return;
    }
    const newStatus = !eventToToggle.enabled;
    // We only need to refetch if we are CREATING a subscription for the first time.
    const shouldRefetch = eventToToggle.isSubscribed === false;

    this.eventsubService.updateEventStatus(eventToToggle.type, newStatus).subscribe(() => {
      if (shouldRefetch) {
        this.isLoading = true;
        this.eventsubService.getEvents().subscribe(events => {
          this.chatEvents = events;
          this.isLoading = false;
        });
      } else {
        // Otherwise, just update the local state.
        this.chatEvents = this.chatEvents.map(event => {
          if (event.type === eventToToggle.type) {
            return { ...event, enabled: newStatus };
          }
          return event;
        });
      }
    });
  }

  saveConfiguration(eventToSave: ChatEvent): void {
    if (!eventToSave.config) {
      console.warn('No configuration to save for', eventToSave.name);
      this.toastService.error(
        this.translate.instant('chatEvents.toasts.noConfigurationTitle'),
        this.translate.instant('chatEvents.toasts.noConfigurationMsg')
      );
      return;
    }
  
    const configPayload = this.prepareConfigForSave(eventToSave.config);
  
    // Call the service to save the configuration.
    this.eventsubService.saveEventConfiguration(eventToSave.type, configPayload).subscribe(() => {
      // On success, exit configuration mode.
      this.toggleConfigure(eventToSave.name);
      this.toastService.success(
        this.translate.instant('chatEvents.toasts.configurationSavedTitle'),
        this.translate.instant('chatEvents.toasts.configurationSavedMsg')
      );
    });
  }

  shouldShowControl(control: ConfigControl, parentEvent: ChatEvent): boolean {
    // If there's no condition, always show the control.
    if (!control.showIf) {
      return true;
    }
  
    // If there's a condition but no config to check against, do not show.
    if (!parentEvent.config) {
      return false;
    }
  
    // Find the control that this control's visibility depends on.
    const sourceControl = parentEvent.config.find(c => c.id === control.showIf!.controlId);
  
    // If the source control doesn't exist, do not show this control.
    if (!sourceControl) {
      return false;
    }
  
    // Robustly check the condition. If `is` is a boolean, we should compare booleans.
    const requiredValue = control.showIf.is;
    if (typeof requiredValue === 'boolean') {
      return !!sourceControl.value === requiredValue;
    }
  
    // Otherwise, use strict equality.
    return sourceControl.value === requiredValue;
  }

  async deleteEvent(eventToDelete: ChatEvent): Promise<void> {
    if (!this.canBeDisabled(eventToDelete)) {
      this.toastService.info(
        this.languageService.getTranslation(this.actionNotAllowedMessages.title),
        this.languageService.getTranslation(this.actionNotAllowedMessages.cannotDelete)
      );
      return;
    }

    const confirmationMessage = {
      en: `${this.languageService.getTranslation(this.deleteConfirmationMessages.areYouSure)} "${eventToDelete.name}"?\n\n${this.languageService.getTranslation(this.deleteConfirmationMessages.warning)}`,
      es: `${this.languageService.getTranslation(this.deleteConfirmationMessages.areYouSure)} "${eventToDelete.name}"?\n\n${this.languageService.getTranslation(this.deleteConfirmationMessages.warning)}`
    };
    
    const confirmation = await this.confirmationService.confirm({
      title: this.deleteConfirmationMessages.title,
      message: { en: confirmationMessage.en, es: confirmationMessage.es },
      confirmText: { en: 'Delete', es: 'Eliminar' },
      cancelText: { en: 'Cancel', es: 'Cancelar' },
      variant: 'danger'
    });

    if (confirmation) {
      this.isLoading = true; // Show loading state
      this.eventsubService.deleteEvent(eventToDelete.type).subscribe({
        next: () => {
          const message = this.translate.instant('chatEvents.toasts.eventUnsubscribedMsg', { eventName: eventToDelete.name });
          this.toastService.success(
            this.translate.instant('chatEvents.toasts.eventUnsubscribedTitle'),
            message
          );
          // The cache is cleared in the service, so we refetch to get the updated state
          this.eventsubService.getEvents().subscribe(events => {
            this.chatEvents = events;
            this.isLoading = false;
          });
        },
        error: () => {
          // Re-enable interaction if the deletion fails
          this.isLoading = false;
        }
      });
    }
  }

  getTierLimit(event: ChatEvent): number {
    if (!event.tierLimits) {
      return Infinity;
    }
    switch (this.userPremiumStatus) {
      case 'premium_plus':
        return event.tierLimits.premium_plus;
      case 'premium':
        return event.tierLimits.premium;
      default:
        return 0;
    }
  }

  canAddTier(event: ChatEvent, currentTiers: any): boolean {
    if (!event.tierLimits || !Array.isArray(currentTiers)) {
      return true;
    }
    const limit = this.getTierLimit(event);
    return currentTiers.length < limit;
  }

  getAddTierTooltip(event: ChatEvent, currentTiers: any): string {
    if (this.canAddTier(event, currentTiers)) {
      return this.translate.instant('chatEvents.tooltips.addTierDefault');
    }

    const limit = this.getTierLimit(event);
    if (this.userPremiumStatus === 'none') {
      return this.translate.instant('chatEvents.tooltips.addTierRequiresPremium');
    }
    if (this.userPremiumStatus === 'premium') {
      return this.translate.instant('chatEvents.tooltips.addTierUpgradePrompt', { limit });
    }
    return this.translate.instant('chatEvents.tooltips.addTierMaxReached', { limit });
  }

  getTierLimitInfoMessage(event: ChatEvent, currentTiers: any): { message: string; level: 'upsell-plus' | 'upsell-premium' | 'limit-reached' } | null {
    if (this.canAddTier(event, currentTiers)) {
      return null;
    }

    const limit = this.getTierLimit(event);

    if (this.userPremiumStatus === 'none') {
      return {
        message: this.translate.instant('chatEvents.tierInfo.premiumFeature'),
        level: 'upsell-premium'
      };
    }

    if (this.userPremiumStatus === 'premium') {
      return {
        message: this.translate.instant('chatEvents.tierInfo.upgradePrompt', { limit }),
        level: 'upsell-plus'
      };
    }

    // This must be premium_plus
    return {
      message: this.translate.instant('chatEvents.tierInfo.maxReached', { limit }),
      level: 'limit-reached'
    };
  }

  addTier(tiers: any, event: ChatEvent): void {
    if (!this.canAddTier(event, tiers)) {
      this.toastService.info(
        this.translate.instant('chatEvents.toasts.limitReachedTitle'),
        this.getAddTierTooltip(event, tiers)
      );
      return;
    }
    if (!Array.isArray(tiers)) return;
    tiers.push({
      id: `new-tier-${Date.now()}`,
      name: this.translate.instant('chatEvents.newTier'),
      message: '',
      minAmount: 0,
      maxAmount: 0,
    });
    this.setTierInfoMessage(event, tiers);
    this.toastService.success(
      this.translate.instant('chatEvents.toasts.tierAddedTitle'),
      this.translate.instant('chatEvents.toasts.tierAddedMsg')
    );
  }

  removeTier(tiers: any, tierId: string, event: ChatEvent): void {
    if (!Array.isArray(tiers)) return;
    const index = tiers.findIndex((t: CheerTier) => t.id === tierId);
    if (index > -1) {
      tiers.splice(index, 1);
    }
    this.setTierInfoMessage(event, tiers);
    this.toastService.success(
      this.translate.instant('chatEvents.toasts.tierRemovedTitle'),
      this.translate.instant('chatEvents.toasts.tierRemovedMsg')
    );
  }

  getControlValue(config: ConfigControl[] | undefined, controlId: string): any {
    if (!config) return undefined;
    return config.find(c => c.id === controlId)?.value;
  }

  trackByName(index: number, event: ChatEvent): string {
    return event.name;
  }

  isArray(value: any): value is any[] {
    return Array.isArray(value);
  }

  setTierInfoMessage(event: ChatEvent, currentTiers: any): void {
    this.tierInfoMessage = this.getTierLimitInfoMessage(event, currentTiers);
  }

  // Method to get icon component from string name
  getIconComponent(iconName: string): any {
    return this.iconMap[iconName] || this.iconMap['X']; // Default to X icon if not found
  }
}
