import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Crown, LucideAngularModule, Palette, Sparkles, Zap, CheckCircle, XCircle, AlertTriangle, Lock, Wrench, FlaskConical, Boxes } from 'lucide-angular';
import { SafePipe } from '../../safe.pipe';
import { UserService } from '../../user.service';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../toast.service';

export type ReleaseStage = 'stable' | 'beta' | 'alpha' | 'maintenance' | 'coming_soon';

interface Design {
  id: string;
  name: {
    EN: string;
    ES: string;
  };
  description: {
    EN: string;
    ES: string;
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
  imports: [CommonModule, FormsModule, LucideAngularModule, SafePipe],
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
  lockIcon = Lock;
  wrenchIcon = Wrench;
  flaskConicalIcon = FlaskConical;
  boxesIcon = Boxes;
  lang: 'EN' | 'ES' = localStorage.getItem('lang') as 'EN' | 'ES' || 'EN';
  userId = 0;
  login = '';
  isPremium = false;
  selectedDesign: Design | null = null;
  timeoutSeconds: number = 30;

  constructor(
    private userService: UserService,
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.userId = this.userService.getUserId();
    this.isPremium = this.userService.getPremium();
    this.login = this.userService.getLogin();
  }

  get designs(): Design[] {
    return [
      {
        id: 'design1',
        name: {
          EN: 'Classic Design',
          ES: 'Diseño Clásico'
        },
        description: {
          EN: 'Shows the clips with the users streamer information on the right side',
          ES: 'Muestra los clips con la información del streamer del usuario en el lado derecho'
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
          EN: 'Simple Design',
          ES: 'Diseño Simple'
        },
        description: {
          EN: 'Contemporary design with sleek animations and effects',
          ES: 'Diseño contemporáneo con animaciones y efectos suaves'
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
          EN: 'Custom Design',
          ES: 'Diseño Personalizado'
        },
        description: {
          EN: 'Fully customizable design with premium features',
          ES: 'Diseño completamente personalizable con características premium'
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
    if (design.releaseStage === 'maintenance') {
      return { text: 'Maintenance', icon: this.wrenchIcon, color: 'text-orange-500' };
    }
    if (design.releaseStage === 'coming_soon') {
      return { text: 'Coming Soon', icon: this.boxesIcon, color: 'text-blue-500' };
    }
    const isLocked = (design.premium && !this.isPremium) || (design.premium_plus && !this.isPremium);
    if (isLocked) {
      return { text: 'Premium Required', icon: this.lockIcon, color: 'text-red-500' };
    }
    if (this.selectedDesign?.id === design.id) {
        return { text: 'Selected', icon: this.checkCircleIcon, color: 'text-purple-500' };
    }
    return { text: 'Available', icon: this.checkCircleIcon, color: 'text-green-500' };
  }

  getStageInfo(stage: ReleaseStage): { text: string, color: string } | null {
    const info: { [key in ReleaseStage]?: { text: string, color: string } } = {
      stable: { text: 'Stable', color: 'bg-purple-500 text-white' },
      beta: { text: 'Beta', color: 'bg-yellow-500 text-white' },
      alpha: { text: 'Alpha', color: 'bg-red-500 text-white' },
      maintenance: { text: 'Maintenance', color: 'bg-gray-500 text-white' },
      coming_soon: { text: 'Coming Soon', color: 'bg-blue-500 text-white' },
    };
    return info[stage] || null;
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
    const isLocked = (design.premium && !this.isPremium) || (design.premium_plus && !this.isPremium);
    const isUnavailable = ['maintenance', 'coming_soon'].includes(design.releaseStage);
    return !isLocked && !isUnavailable;
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
