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
} from 'lucide-angular';
import { EventsubService } from '../../eventsub.service';
import { ToastService } from '../../toast.service';
import { UserService } from '../../user.service';

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
    private userService: UserService
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

    // If access is granted, proceed with the original status logic
    if (event.releaseStage === 'alpha' || event.releaseStage === 'beta') {
      const stageInfo = this.stageMap[event.releaseStage];
      const text = event.enabled
        ? `${stageInfo.message[this.lang]} Enabled`
        : `Try the ${stageInfo.message[this.lang]}!`;
      return { text, icon: stageInfo.icon, color: stageInfo.color };
    }

    if (event.releaseStage === 'stable') {
      if (event.enabled) {
        return { text: 'Enabled', icon: this.checkIcon, color: 'text-green-500' };
      } else {
        return { text: 'Disabled', icon: this.xIcon, color: 'text-red-500' };
      }
    }
    
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
        'Action Not Allowed',
        'This event cannot be disabled. To turn it off, clear the message in its configuration.'
      );
      return;
    }
    const newStatus = !eventToToggle.enabled;
    this.eventsubService.updateEventStatus(eventToToggle.type, newStatus).subscribe(() => {
      this.chatEvents = this.chatEvents.map(event => {
        if (event.name === eventToToggle.name) {
          return { ...event, enabled: newStatus };
        }
        return event;
      });
    });
  }

  saveConfiguration(eventToSave: ChatEvent): void {
    if (!eventToSave.config) return;
    this.eventsubService.saveEventConfiguration(eventToSave.name, eventToSave.config).subscribe(() => {
      this.toastService.success('Configuration Saved', `Your settings for ${eventToSave.name} have been updated.`);
      this.toggleConfigure(eventToSave.name);
    });
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
