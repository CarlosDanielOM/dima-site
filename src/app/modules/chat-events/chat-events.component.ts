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
import { EventsubService } from '../../eventsub.service';
import { ToastService } from '../../toast.service';
import { UserService } from '../../user.service';
import { ConfirmationService } from '../../services/confirmation.service';

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
  label: { EN: string; ES: string; };
  type: 'text' | 'number' | 'checkbox' | 'message-tiers' | 'select';
  value: string | number | boolean | CheerTier[];
  placeholder?: string;
  showIf?: { controlId: string; is: any; };
  canDisable?: boolean;
}

export type ReleaseStage = 'stable' | 'beta' | 'alpha' | 'maintenance' | 'coming_soon' | 'unavailable' | 'deprecated';
export interface StageInfo { message: { EN: string; ES: string; }; color: string; icon: any; }

export interface ChatEvent {
  name:string;
  type: string;
  version: string;
  condition?: { [key: string]: string | undefined; };
  description: { EN: string; ES: string; };
  icon: any;
  color: string;
  textColor: string;
  releaseStage: ReleaseStage;
  enabled: boolean;
  premium: boolean;
  premium_plus: boolean;
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
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './chat-events.component.html',
  styleUrl: './chat-events.component.css',
})
export class ChatEventsComponent implements OnInit {
  lang: 'EN' | 'ES' = (localStorage.getItem('lang') as 'EN' | 'ES') || 'EN';
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
      EN: 'Requires Premium',
      ES: 'Requiere Premium',
    },
    needs_premium_plus: {
      EN: 'Requires Premium Plus',
      ES: 'Requiere Premium Plus',
    },
  };

  deleteConfirmationMessages = {
    title: {
      EN: 'Confirm Deletion',
      ES: 'Confirmar Eliminación',
    },
    areYouSure: {
      EN: 'Are you sure you want to delete the event',
      ES: '¿Estás seguro de que quieres eliminar el evento',
    },
    warning: {
      EN: 'All associated data will be erased and it will need to be reconfigured if you want to use it again.',
      ES: 'Todos los datos asociados se borrarán y deberá reconfigurarse si quieres volver a usarlo.',
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
      EN: 'Action Not Allowed',
      ES: 'Acción no permitida',
    },
    cannotDisable: {
      EN: 'This event cannot be disabled. To turn it off, clear the message in its configuration.',
      ES: 'Este evento no se puede desactivar. Para apagarlo, borra el contenido del mensaje en su configuración.',
    },
    cannotDelete: {
      EN: 'This event cannot be deleted because it is essential for the bot to work properly.',
      ES: 'Este evento no se puede eliminar porque es esencial para el funcionamiento del bot.',
    }
  };

  statusMessages = {
    notCreated: { EN: 'Not Created', ES: 'No Creado' },
    enabled: { EN: 'Enabled', ES: 'Activado' },
    disabled: { EN: 'Disabled', ES: 'Desactivado' },
    betaEnabled: { EN: 'Beta Enabled', ES: 'Beta Activada' },
    tryTheBeta: { EN: 'Try the Beta!', ES: '¡Prueba la Beta!' },
    alphaEnabled: { EN: 'Alpha Enabled', ES: 'Alfa Activada' },
    tryTheAlpha: { EN: 'Try the Alpha!', ES: '¡Prueba la Alfa!' },
  };

  stageMap: Record<ReleaseStage, StageInfo> = {
    stable: { message: { EN: '', ES: '' }, color: '', icon: null },
    beta: { message: { EN: 'Beta', ES: 'Beta' }, color: 'text-orange-500', icon: FlaskConical },
    alpha: { message: { EN: 'Alpha', ES: 'Alfa' }, color: 'text-purple-600', icon: FlaskConical },
    maintenance: { message: { EN: 'Maintenance', ES: 'Mantenimiento' }, color: 'text-yellow-500', icon: Wrench },
    coming_soon: { message: { EN: 'Coming Soon', ES: 'Próximamente' }, color: 'text-blue-500', icon: Clock },
    unavailable: { message: { EN: 'Unavailable', ES: 'No Disponible' }, color: 'text-red-500', icon: Lock },
    deprecated: { message: { EN: 'Deprecated', ES: 'Obsoleto' }, color: 'text-red-500', icon: Lock },
  };
  
  chatEvents: ChatEvent[] = [];
  isLoading = true;

  constructor(
    private eventsubService: EventsubService,
    private toastService: ToastService,
    private userService: UserService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.userPremiumStatus = this.userService.getPremiumStatus() as 'none' | 'premium' | 'premium_plus';
    
    this.eventsubService.getEvents().subscribe(events => {
      this.chatEvents = events;
      this.isLoading = false;
    });
  }

  // NEW: A single function to determine the visual status, including permissions
  getEventDisplayStatus(event: ChatEvent): { text: string; icon: any; color: string } {
    const access = this.getUserAccess(event);
    if (!access.canAccess && access.reason) {
      // New logic to add context to the permission message
      let message = this.permissionMessages[access.reason][this.lang];
      if (event.releaseStage === 'alpha' || event.releaseStage === 'beta') {
        const stageInfo = this.stageMap[event.releaseStage];
        message += ` (${stageInfo.message[this.lang]} Access)`;
      }
      return {
        text: message,
        icon: this.lockIcon,
        color: 'text-yellow-600',
      };
    }

    // Handle Alpha and Beta stages specifically
    if (event.releaseStage === 'alpha' || event.releaseStage === 'beta') {
      const stageInfo = this.stageMap[event.releaseStage];

      if (event.isSubscribed === false) {
        // Not subscribed, show call to action
        const text = event.releaseStage === 'alpha'
          ? this.statusMessages.tryTheAlpha[this.lang]
          : this.statusMessages.tryTheBeta[this.lang];
        return { text, icon: stageInfo.icon, color: stageInfo.color };
      } else {
        // Is subscribed, check if enabled or disabled
        if (event.enabled) {
          const text = event.releaseStage === 'alpha'
            ? this.statusMessages.alphaEnabled[this.lang]
            : this.statusMessages.betaEnabled[this.lang];
          return { text, icon: stageInfo.icon, color: stageInfo.color };
        } else {
          return { text: this.statusMessages.disabled[this.lang], icon: this.xIcon, color: 'text-red-500' };
        }
      }
    }

    // Handle Stable stage
    if (event.releaseStage === 'stable') {
      if (event.isSubscribed === false) {
        return { text: this.statusMessages.notCreated[this.lang], icon: this.plusCircleIcon, color: 'text-gray-500' };
      } else {
        if (event.enabled) {
          return { text: this.statusMessages.enabled[this.lang], icon: this.checkIcon, color: 'text-green-500' };
        } else {
          return { text: this.statusMessages.disabled[this.lang], icon: this.xIcon, color: 'text-red-500' };
        }
      }
    }
    
    // Fallback for other stages like 'coming_soon', 'maintenance'
    const stageInfo = this.stageMap[event.releaseStage];
    return { text: stageInfo.message[this.lang], icon: stageInfo.icon, color: stageInfo.color };
  }

  canBeDisabled(event: ChatEvent): boolean {
    if (!event.config || event.config.length === 0) {
      return true;
    }
    return event.config[0].canDisable !== false;
  }

  // NEW: Helper to check if the user has permission to interact with the event
  getUserAccess(event: ChatEvent): { canAccess: boolean; reason?: 'needs_premium' | 'needs_premium_plus' } {
    const isPremiumPlus = this.userPremiumStatus === 'premium_plus';
    const isPremium = this.userPremiumStatus === 'premium';

    // Event requires Premium Plus subscription
    if (event.premium_plus && !isPremiumPlus) {
      return { canAccess: false, reason: 'needs_premium_plus' };
    }

    // Event requires at least a Premium subscription
    if (event.premium && !isPremium && !isPremiumPlus) {
      return { canAccess: false, reason: 'needs_premium' };
    }
    
    // // Alpha features are exclusive to Premium Plus
    // if (event.releaseStage === 'alpha' && !isPremiumPlus) {
    //     return { canAccess: true, reason: 'needs_premium_plus' };
    // }

    // // Beta features are available to Premium and Premium Plus
    // if (event.releaseStage === 'beta' && !isPremium && !isPremiumPlus) {
    //     return { canAccess: true, reason: 'needs_premium' };
    // }

    return { canAccess: true };
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
        this.actionNotAllowedMessages.title[this.lang],
        this.actionNotAllowedMessages.cannotDisable[this.lang]
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
      this.toastService.error('No Configuration', 'No configuration to save for this event.');
      return;
    }
  
    const configPayload = this.prepareConfigForSave(eventToSave.config);
  
    // Call the service to save the configuration.
    this.eventsubService.saveEventConfiguration(eventToSave.type, configPayload).subscribe(() => {
      // On success, exit configuration mode.
      this.toggleConfigure(eventToSave.name);
      this.toastService.success('Configuration Saved', 'Configuration for this event has been saved.');
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
        this.actionNotAllowedMessages.title[this.lang],
        this.actionNotAllowedMessages.cannotDelete[this.lang]
      );
      return;
    }

    const confirmationMessage = {
      EN: `${this.deleteConfirmationMessages.areYouSure[this.lang]} "${eventToDelete.name}"?\n\n${this.deleteConfirmationMessages.warning[this.lang]}`,
      ES: `${this.deleteConfirmationMessages.areYouSure[this.lang]} "${eventToDelete.name}"?\n\n${this.deleteConfirmationMessages.warning[this.lang]}`
    };
    
    const confirmation = await this.confirmationService.confirm({
      title: this.deleteConfirmationMessages.title,
      message: { EN: confirmationMessage.EN, ES: confirmationMessage.ES },
      confirmText: { EN: 'Delete', ES: 'Eliminar' },
      cancelText: { EN: 'Cancel', ES: 'Cancelar' },
      variant: 'danger'
    });

    if (confirmation) {
      this.isLoading = true; // Show loading state
      this.eventsubService.deleteEvent(eventToDelete.type).subscribe({
        next: () => {
          this.toastService.success('Event Unsubscribed', `The event "${eventToDelete.name}" has been reset.`);
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
      return 'Add a new message tier';
    }

    const limit = this.getTierLimit(event);
    if (this.userPremiumStatus === 'none') {
      return 'Requires Premium to add message tiers.';
    }
    if (this.userPremiumStatus === 'premium') {
      return `You have reached the max of ${limit} tiers. Upgrade to Premium Plus for more.`;
    }
    return `You have reached the maximum of ${limit} tiers.`;
  }

  getTierLimitInfoMessage(event: ChatEvent, currentTiers: any): { message: string; level: 'upsell-plus' | 'upsell-premium' | 'limit-reached' } | null {
    if (this.canAddTier(event, currentTiers)) {
      return null;
    }

    const limit = this.getTierLimit(event);

    if (this.userPremiumStatus === 'none') {
      return {
        message: 'Tiered messages are a Premium feature.',
        level: 'upsell-premium'
      };
    }

    if (this.userPremiumStatus === 'premium') {
      return {
        message: `You've reached your ${limit}-tier limit. Upgrade to Premium Plus for more!`,
        level: 'upsell-plus'
      };
    }

    // This must be premium_plus
    return {
      message: `You have reached the maximum of ${limit} tiers.`,
      level: 'limit-reached'
    };
  }

  addTier(tiers: any, event: ChatEvent): void {
    if (!this.canAddTier(event, tiers)) {
      this.toastService.info('Limit Reached', this.getAddTierTooltip(event, tiers));
      return;
    }
    if (!Array.isArray(tiers)) return;
    tiers.push({
      id: `new-tier-${Date.now()}`,
      name: 'New Tier',
      message: '',
      minAmount: 0,
      maxAmount: 0,
    });
    this.setTierInfoMessage(event, tiers);
    this.toastService.success('Tier Added', 'A new tier has been added to your message.');
  }

  removeTier(tiers: any, tierId: string, event: ChatEvent): void {
    if (!Array.isArray(tiers)) return;
    const index = tiers.findIndex((t: CheerTier) => t.id === tierId);
    if (index > -1) {
      tiers.splice(index, 1);
    }
    this.setTierInfoMessage(event, tiers);
    this.toastService.success('Tier Removed', 'A tier has been removed from your message.');
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
