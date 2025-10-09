import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Crown, LucideAngularModule, Palette, Sparkles, Zap, CheckCircle, XCircle, AlertTriangle, Lock, Wrench, FlaskConical, Boxes } from 'lucide-angular';
import { SafePipe } from '../../safe.pipe';
import { UserService } from '../../user.service';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../toast.service';
import { ReleaseStageService } from '../../services/release-stage.service';
import { ReleaseStage } from '../../interfaces/releasestage';
import { LanguageService } from '../../services/language.service';
import { BlockInactiveUserDirective } from '../../directives/block-inactive-user.directive';

interface Design {
  id: string;
  name: {
    en: string;
    es: string;
  };
  description: {
    en: string;
    es: string;
  };
  previewUrl: string;
  premium: boolean;
  premium_plus: boolean;
  icon: any;
  releaseStage: ReleaseStage;
}

@Component({
  selector: 'app-clips',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, SafePipe, BlockInactiveUserDirective],
  templateUrl: './clips.component.html',
  styleUrl: './clips.component.css'
})
export class ClipsComponent {
  crownIcon = Crown;
  paletteIcon = Palette;
  sparklesIcon = Sparkles;
  zapIcon = Zap;
  checkCircleIcon = CheckCircle;
  xCircleIcon = XCircle;
  alertTriangleIcon = AlertTriangle;
  userId = 0;
  login = '';
  isPremium = false;
  selectedDesign: Design | null = null;
  timeoutSeconds: number = 30;

  constructor(
    private userService: UserService,
    private http: HttpClient,
    private toastService: ToastService,
    private releaseStageService: ReleaseStageService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.userId = this.userService.getUserId();
    this.isPremium = this.userService.getPremium();
    this.login = this.userService.getLogin();
  }

  // Helper methods for translations
  getDesignName(design: Design): string {
    return this.languageService.getTranslation(design.name);
  }

  getDesignDescription(design: Design): string {
    return this.languageService.getTranslation(design.description);
  }

  get designs(): Design[] {
    return [
      {
        id: 'design1',
        name: {
          en: 'Classic Design',
          es: 'Diseño Clásico'
        },
        description: {
          en: 'Shows the clips with the users streamer information on the right side',
          es: 'Muestra los clips con la información del streamer del usuario en el lado derecho'
        },
        previewUrl: `https://api.domdimabot.com/clip/${this.userId}`,
        premium: false,
        premium_plus: false,
        icon: this.paletteIcon,
        releaseStage: 'stable',
      },
      {
        id: 'design2',
        name: {
          en: 'Simple Design',
          es: 'Diseño Simple'
        },
        description: {
          en: 'Contemporary design with sleek animations and effects',
          es: 'Diseño contemporáneo con animaciones y efectos suaves'
        },
        previewUrl: `https://api.domdimabot.com/clip/${this.userId}?design=2`,
        premium: false,
        premium_plus: false,
        icon: this.sparklesIcon,
        releaseStage: 'beta',
      },
      {
        id: 'design3',
        name: {
          en: 'Custom Design',
          es: 'Diseño Personalizado'
        },
        description: {
          en: 'Fully customizable design with premium features',
          es: 'Diseño completamente personalizable con características premium'
        },
        previewUrl: `https://api.domdimabot.com/clip/${this.userId}?design=custom`,
        premium: true,
        premium_plus: true,
        icon: this.zapIcon,
        releaseStage: 'coming_soon',
      }
    ];
  }

  getDesignStatus(design: Design): { text: string; icon: any; color: string } {
    const isLocked = (design.premium && !this.isPremium) || (design.premium_plus && !this.isPremium);
    const isSelected = this.selectedDesign?.id === design.id;

    return this.releaseStageService.getSimpleStatus(
      design.releaseStage,
      isLocked,
      isSelected,
      !isLocked && !['maintenance', 'coming_soon'].includes(design.releaseStage)
    );
  }

  getStageInfo(stage: string): { text: string, color: string } | null {
    return this.releaseStageService.getStageBadgeInfo(stage as any);
  }

  getSelectedDesignUrl(): string {
    if (!this.selectedDesign) return '';
    
    const baseUrl = this.selectedDesign.previewUrl;
    
    // Check if URL already has parameters
    const separator = baseUrl.includes('?') ? '&' : '?';
    return baseUrl + separator + 'timeout=' + this.timeoutSeconds;
  }

  selectDesign(design: Design) {
    if (!this.canSelectDesign(design)) {
      if (['maintenance', 'coming_soon'].includes(design.releaseStage)) {
          this.toastService.error('Not Available', 'This design is not available yet.');
      } else if ((design.premium && !this.isPremium) || (design.premium_plus && !this.isPremium)) {
          this.toastService.error('Premium Required', 'This is a premium feature. Please upgrade to use it.');
      }
      return;
    }
    this.selectedDesign = design;
  }

  canSelectDesign(design: Design): boolean {
    const userPremiumStatus = this.isPremium ? 'premium' : 'none';
    return this.releaseStageService.canSelectItem(design, userPremiumStatus);
  }

  copyUrl() {
    if (!this.selectedDesign) {
      this.toastService.error('Selection Required', 'Please select a design first');
      return;
    }
    const url = this.getSelectedDesignUrl();
    navigator.clipboard.writeText(url).then(() => {
      this.toastService.success('Copied!', 'URL copied to clipboard!');
    }).catch(() => {
      this.toastService.error('Copy Failed', 'Failed to copy URL to clipboard');
    });
  }

  testDesign() {
    if (!this.selectedDesign) {
      this.toastService.error('Selection Required', 'Please select a design first');
      return;
    }
    const url = this.getSelectedDesignUrl();
    this.http.post('https://api.domdimabot.com/clip/test', {
      channelID: this.userId,
      streamer: this.login,
      timeout: this.timeoutSeconds
    }).subscribe({
      next: (data) => {
        console.log(data);
        this.toastService.success('Test Sent', 'Design test sent successfully!');
      },
      error: (error) => {
        console.error('Error testing design:', error);
        this.toastService.error('Test Failed', 'Failed to send test design');
      }
    });
  }

  onTimeoutChange() {
    // Ensure timeout is between 1 and 30
    if (this.timeoutSeconds < 1) this.timeoutSeconds = 1;
    if (this.timeoutSeconds > 30) this.timeoutSeconds = 30;
  }
}
