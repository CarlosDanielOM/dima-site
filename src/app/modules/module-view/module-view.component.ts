import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Crown,
  Lock,
  FlaskConical,
  Wrench,
  Clock,
} from 'lucide-angular';
import { Module, ReleaseStage, StageInfo } from '../../services/module.service';
import { ModuleService } from '../../services/module.service';

@Component({
  selector: 'app-module-view',
  standalone: true,
  imports: [RouterModule, CommonModule, LucideAngularModule],
  templateUrl: './module-view.component.html',
  styleUrl: './module-view.component.css',
})
export class ModuleViewComponent implements OnInit {
  lang: 'EN' | 'ES' = (localStorage.getItem('lang') as 'EN' | 'ES') || 'EN';
  crownIcon = Crown;
  lockIcon = Lock;

  // MOCK: This would come from an authentication service.
  userPremiumStatus: 'none' | 'premium' | 'premium_plus' = 'premium';

  modules: Module[] = [];
  isLoading = true;

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
    stable: {
      message: { EN: 'Available', ES: 'Disponible' },
      color: 'text-green-500',
      icon: null,
    },
    beta: {
      message: { EN: 'Beta', ES: 'Beta' },
      color: 'text-orange-500',
      icon: FlaskConical,
    },
    alpha: {
      message: { EN: 'Alpha', ES: 'Alfa' },
      color: 'text-purple-600',
      icon: FlaskConical,
    },
    maintenance: {
      message: { EN: 'Maintenance', ES: 'Mantenimiento' },
      color: 'text-yellow-500',
      icon: Wrench,
    },
    coming_soon: {
      message: { EN: 'Coming Soon', ES: 'Próximamente' },
      color: 'text-blue-500',
      icon: Clock,
    },
  };

  constructor(private moduleService: ModuleService) {}

  ngOnInit(): void {
    this.moduleService.getModules().subscribe((modules) => {
      this.modules = modules;
      this.isLoading = false;
    });
  }

  getUserAccess(module: Module): {
    canAccess: boolean;
    reason?: 'needs_premium' | 'needs_premium_plus';
  } {
    if (module.premium_plus && this.userPremiumStatus !== 'premium_plus') {
      return { canAccess: false, reason: 'needs_premium_plus' };
    }
    if (module.premium && this.userPremiumStatus === 'none') {
      return { canAccess: false, reason: 'needs_premium' };
    }
    return { canAccess: true };
  }

  getModuleDisplayStatus(module: Module): {
    text: string;
    icon: any;
    color: string;
  } {
    const access = this.getUserAccess(module);
    if (!access.canAccess && access.reason) {
      return {
        text: this.permissionMessages[access.reason][this.lang],
        icon: this.lockIcon,
        color: 'text-yellow-600',
      };
    }

    const stageInfo = this.stageMap[module.releaseStage];
    return {
      text: stageInfo.message[this.lang],
      icon: stageInfo.icon,
      color: stageInfo.color,
    };
  }

  trackByName(index: number, module: Module): string {
    return module.name;
  }
}

