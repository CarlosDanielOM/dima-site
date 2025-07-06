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
  Lock, // <-- Import Lock icon
} from 'lucide-angular';
import { EventsubService } from '../../eventsub.service';
import { ToastService } from '../../toast.service';

// Interfaces remain the same
export interface ConfigControl {
  id: string;
  label: { EN: string; ES: string; };
  type: 'text' | 'number' | 'checkbox';
  value: string | number | boolean;
  placeholder?: string;
  showIf?: { controlId: string; is: any; };
}

export type ReleaseStage = 'stable' | 'beta' | 'alpha' | 'maintenance' | 'coming_soon';
export interface StageInfo { message: { EN: string; ES: string; }; color: string; icon: any; }

export interface ChatEvent {
  name:string;
  type: string;
  version: string;
  condition?: { broadcaster_user_id?: string; moderator_user_id?: string; };
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
  lockIcon = Lock; // <-- Add property for Lock icon

  // MOCK: This would come from an authentication service.
  // You can change this to 'none' or 'premium_plus' to test the UI.
  userPremiumStatus: 'none' | 'premium' | 'premium_plus' = 'premium_plus';

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
  };
  
  chatEvents: ChatEvent[] = [];
  isLoading = true;

  constructor(
    private eventsubService: EventsubService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // This should now call the merged getEvents() function from your service
    this.eventsubService.getEvents().subscribe(events => {
      this.chatEvents = events;
      this.isLoading = false;
    });
  }

  // NEW: A single function to determine the visual status, including permissions
  getEventDisplayStatus(event: ChatEvent): { text: string; icon: any; color: string } {
    const access = this.getUserAccess(event);
    if (!access.canAccess && access.reason) {
      return {
        text: this.permissionMessages[access.reason][this.lang],
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

  // NEW: Helper to check if the user has permission to interact with the event
  getUserAccess(event: ChatEvent): { canAccess: boolean; reason?: 'needs_premium' | 'needs_premium_plus' } {
    if (event.premium_plus && this.userPremiumStatus !== 'premium_plus') {
      return { canAccess: false, reason: 'needs_premium_plus' };
    }
    if (event.premium && this.userPremiumStatus === 'none') {
      return { canAccess: false, reason: 'needs_premium' };
    }
    return { canAccess: true };
  }
  
  toggleConfigure(eventName: string): void {
     this.chatEvents = this.chatEvents.map(event => {
      if (event.name === eventName) {
        return { ...event, isConfiguring: !event.isConfiguring };
      }
      return { ...event, isConfiguring: false };
    });
  }

  toggleFeature(eventToToggle: ChatEvent): void {
    const newStatus = !eventToToggle.enabled;
    this.eventsubService.updateEventStatus(eventToToggle.type, newStatus).subscribe(() => {
      this.chatEvents = this.chatEvents.map(event => {
        if (event.name === eventToToggle.name) {
          return { ...event, enabled: newStatus };
        }
        return event;
      });
      const statusText = newStatus ? 'enabled' : 'disabled';
      this.toastService.success('Status Updated', `${eventToToggle.name} has been ${statusText}.`);
    });
  }

  saveConfiguration(eventToSave: ChatEvent): void {
    if (!eventToSave.config) return;
    this.eventsubService.saveEventConfiguration(eventToSave.name, eventToSave.config).subscribe(() => {
      this.toastService.success('Configuration Saved', `Your settings for ${eventToSave.name} have been updated.`);
      this.toggleConfigure(eventToSave.name);
    });
  }

  getControlValue(config: ConfigControl[] | undefined, controlId: string): any {
    if (!config) return undefined;
    return config.find(c => c.id === controlId)?.value;
  }

  trackByName(index: number, event: ChatEvent): string {
    return event.name;
  }
}
