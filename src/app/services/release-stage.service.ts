import { Injectable } from '@angular/core';
import { Crown, Lock, FlaskConical, Wrench, Clock, Check } from 'lucide-angular';
import { LanguageService } from './language.service';
import { ReleaseStage } from '../interfaces/releasestage';
import { StageInfo } from '../interfaces/stageinfo';


export interface DisplayStatus {
  text: string;
  icon: any;
  color: string;
}

export interface UserAccess {
  canAccess: boolean;
  reason?: 'needs_premium' | 'needs_premium_plus';
}

export interface ItemWithReleaseStage {
  releaseStage: ReleaseStage;
  premium?: boolean;
  premium_plus?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ReleaseStageService {
  // Icons for different states
  private icons = {
    crown: Crown,
    lock: Lock,
    flask: FlaskConical,
    wrench: Wrench,
    clock: Clock,
    check: Check,
  };

  // Stage configuration map
  private stageMap: Record<ReleaseStage, StageInfo> = {
    stable: {
      message: { en: 'Available', es: 'Disponible' },
      color: 'text-green-500',
      icon: this.icons.check,
    },
    beta: {
      message: { en: 'Beta', es: 'Beta' },
      color: 'text-orange-500',
      icon: this.icons.flask,
    },
    alpha: {
      message: { en: 'Alpha', es: 'Alfa' },
      color: 'text-purple-600',
      icon: this.icons.flask,
    },
    maintenance: {
      message: { en: 'Maintenance', es: 'Mantenimiento' },
      color: 'text-yellow-500',
      icon: this.icons.wrench,
    },
    coming_soon: {
      message: { en: 'Coming Soon', es: 'Próximamente' },
      color: 'text-blue-500',
      icon: this.icons.clock,
    },
    unavailable: {
      message: { en: 'Unavailable', es: 'No Disponible' },
      color: 'text-red-500',
      icon: this.icons.lock,
    },
    deprecated: {
      message: { en: 'Deprecated', es: 'Obsoleto' },
      color: 'text-red-500',
      icon: this.icons.lock,
    },
  };

  constructor(private languageService: LanguageService) {}

  /**
   * Get the base stage information for a release stage
   */
  getStageInfo(stage: ReleaseStage): StageInfo {
    return this.stageMap[stage];
  }

  /**
   * Get user access status for an item with premium requirements
   */
  getUserAccess(
    item: ItemWithReleaseStage,
    userPremiumStatus: 'none' | 'premium' | 'premium_plus' = 'none'
  ): UserAccess {
    if (item.premium_plus && userPremiumStatus !== 'premium_plus') {
      return { canAccess: false, reason: 'needs_premium_plus' };
    }
    if (item.premium && userPremiumStatus === 'none') {
      return { canAccess: false, reason: 'needs_premium' };
    }
    return { canAccess: true };
  }

  /**
   * Get display status for an item, considering user access and release stage
   */
  getDisplayStatus(
    item: ItemWithReleaseStage,
    userPremiumStatus: 'none' | 'premium' | 'premium_plus' = 'none',
    permissionMessages?: {
      needs_premium: { en: string; es: string };
      needs_premium_plus: { en: string; es: string };
    }
  ): DisplayStatus {
    const access = this.getUserAccess(item, userPremiumStatus);

    if (!access.canAccess && access.reason && permissionMessages) {
      return {
        text: this.languageService.getTranslation(permissionMessages[access.reason]),
        icon: this.icons.lock,
        color: 'text-yellow-600',
      };
    }

    const stageInfo = this.stageMap[item.releaseStage];
    if (!stageInfo) {
      // Fallback for unknown stages
      return {
        text: 'Unknown',
        icon: null,
        color: 'text-gray-500',
      };
    }

    return {
      text: this.languageService.getTranslation(stageInfo.message),
      icon: stageInfo.icon,
      color: stageInfo.color,
    };
  }

  /**
   * Get simplified status for design-like items (used in clips component)
   */
  getSimpleStatus(
    stage: ReleaseStage,
    isLocked: boolean = false,
    isSelected: boolean = false,
    isAvailable: boolean = true
  ): DisplayStatus {
    if (stage === 'maintenance') {
      return {
        text: 'Maintenance',
        icon: this.icons.wrench,
        color: 'text-orange-500'
      };
    }
    if (stage === 'coming_soon') {
      return {
        text: 'Coming Soon',
        icon: this.icons.clock,
        color: 'text-blue-500'
      };
    }
    if (isLocked) {
      return {
        text: 'Premium Required',
        icon: this.icons.lock,
        color: 'text-red-500'
      };
    }
    if (isSelected) {
      return {
        text: 'Selected',
        icon: null, // Could add a check icon if needed
        color: 'text-purple-500'
      };
    }
    if (isAvailable) {
      return {
        text: 'Available',
        icon: null, // Could add a check icon if needed
        color: 'text-green-500'
      };
    }

    return {
      text: 'Unknown',
      icon: null,
      color: 'text-gray-500'
    };
  }

  /**
   * Check if an item can be selected based on stage and premium status
   */
  canSelectItem(
    item: ItemWithReleaseStage,
    userPremiumStatus: 'none' | 'premium' | 'premium_plus' = 'none'
  ): boolean {
    const access = this.getUserAccess(item, userPremiumStatus);
    const isUnavailable = ['maintenance', 'coming_soon'].includes(item.releaseStage);
    return access.canAccess && !isUnavailable;
  }

  /**
   * Get stage badge info for UI display
   */
  getStageBadgeInfo(stage: ReleaseStage): { text: string; color: string } | null {
    const badgeMap: { [key in ReleaseStage]?: { text: string; color: string } } = {
      stable: { text: 'Stable', color: 'bg-purple-500 text-white' },
      beta: { text: 'Beta', color: 'bg-yellow-500 text-white' },
      alpha: { text: 'Alpha', color: 'bg-red-500 text-white' },
      maintenance: { text: 'Maintenance', color: 'bg-gray-500 text-white' },
      coming_soon: { text: 'Coming Soon', color: 'bg-blue-500 text-white' },
    };
    return badgeMap[stage] || null;
  }
}
