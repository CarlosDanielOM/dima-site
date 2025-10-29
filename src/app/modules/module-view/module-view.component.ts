import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Crown, Lock } from 'lucide-angular';
import { TranslatePipe } from '@ngx-translate/core';
import { Module } from '../../interfaces/module';
import { ModuleService } from '../../services/module.service';
import { UserService } from '../../user.service';
import { LanguageService } from '../../services/language.service';
import { ReleaseStageService, DisplayStatus } from '../../services/release-stage.service';

@Component({
  selector: 'app-module-view',
  standalone: true,
  imports: [RouterModule, CommonModule, LucideAngularModule, TranslatePipe],
  templateUrl: './module-view.component.html',
  styleUrl: './module-view.component.css',
})
export class ModuleViewComponent implements OnInit {
  crownIcon = Crown;
  lockIcon = Lock;

  // MOCK: This would come from an authentication service.
  userPremiumStatus: 'none' | 'premium' | 'premium_plus' = 'none';

  modules: Module[] = [];
  isLoading = true;

  // Translation messages using the language service
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

  constructor(
    private moduleService: ModuleService,
    private userService: UserService,
    private languageService: LanguageService,
    private releaseStageService: ReleaseStageService
  ) {}

  // Computed properties for reactive language handling
  currentLanguage = this.languageService.currentLanguage;

  ngOnInit(): void {
    this.userPremiumStatus = this.userService.getPremiumStatus() as 'none' | 'premium' | 'premium_plus';
    
    this.moduleService.getModules().subscribe((modules) => {
      this.modules = modules;
      this.isLoading = false;
    });
  }

  getUserAccess(module: Module): {
    canAccess: boolean;
    reason?: 'needs_premium' | 'needs_premium_plus';
  } {
    return this.releaseStageService.getUserAccess(module, this.userPremiumStatus);
  }

  getModuleDisplayStatus(module: Module): DisplayStatus {
    const result = this.releaseStageService.getDisplayStatus(module as any, this.userPremiumStatus, this.permissionMessages);
    return {
      text: result.text,
      icon: result.icon,
      color: result.color
    };
  }

  getModuleDescription(description: { en: string; es: string }): string {
    return this.languageService.getTranslation(description);
  }

  trackByName(index: number, module: Module): string {
    return module.name;
  }
}

