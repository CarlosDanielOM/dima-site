import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Crown, LucideAngularModule, Palette, Sparkles, Zap } from 'lucide-angular';
import { SafePipe } from '../../safe.pipe';
import { UserService } from '../../user.service';
import { HttpClient } from '@angular/common/http';

interface Design {
  id: string;
  name: string;
  description: {
    EN: string;
    ES: string;
  };
  previewUrl: string;
  premium: boolean;
  premium_plus?: boolean;
  icon: any;
  disabled: boolean;
  disabled_message: string;
  disabled_icon: any;
  disabled_color: string;
  disabled_text_color: string;
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
  lang: 'EN' | 'ES' = localStorage.getItem('lang') as 'EN' | 'ES' || 'EN';
  userId = 0;
  login = '';
  isPremium = false;
  selectedDesign: Design | null = null;
  timeoutSeconds: number = 30;
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  constructor(
    private userService: UserService,
    private http: HttpClient
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
        name: 'Classic Design',
        description: {
          EN: 'Shows the clips with the users streamer information on the right side',
          ES: 'Muestra los clips con la información del streamer del usuario en el lado derecho'
        },
        previewUrl: `https://api.domdimabot.com/clip/${this.userId}`,
        premium: false,
        icon: this.paletteIcon,
        disabled: false,
        disabled_message: 'This design is not available yet. Please check back later.',
        disabled_icon: this.paletteIcon,
        disabled_color: 'bg-red-500',
        disabled_text_color: 'text-white'
      },
      {
        id: 'design2',
        name: 'Simple Design',
        description: {
          EN: 'Contemporary design with sleek animations and effects',
          ES: 'Diseño contemporáneo con animaciones y efectos suaves'
        },
        previewUrl: `https://api.domdimabot.com/clip/${this.userId}?design=2`,
        premium: false,
        icon: this.sparklesIcon,
        disabled: false,
        disabled_message: 'This design is not available yet. Please check back later.',
        disabled_icon: this.sparklesIcon,
        disabled_color: 'bg-red-500',
        disabled_text_color: 'text-white'
      },
      {
        id: 'design3',
        name: 'Custom Design',
        description: {
          EN: 'Fully customizable design with premium features',
          ES: 'Diseño completamente personalizable con características premium'
        },
        previewUrl: `https://api.domdimabot.com/clip/${this.userId}?design=custom`,
        premium: true,
        premium_plus: false,
        icon: this.zapIcon,
        disabled: true,
        disabled_message: 'This design is not available yet. Please check back later.',
        disabled_icon: this.zapIcon,
        disabled_color: 'bg-red-500',
        disabled_text_color: 'text-white'
      }
    ];
  }

  getSelectedDesignUrl(): string {
    if (!this.selectedDesign) return '';
    
    const baseUrl = this.selectedDesign.previewUrl;
    const timeoutParam = this.timeoutSeconds > 0 ? `&timeout=${this.timeoutSeconds}` : '';
    
    // Check if URL already has parameters
    const separator = baseUrl.includes('?') ? '&' : '?';
    return baseUrl + separator + 'timeout=' + this.timeoutSeconds;
  }

  selectDesign(design: Design) {
    if (design.premium && !this.isPremium) {
      return; // Don't allow selection if premium and user is not premium
    }
    this.selectedDesign = design;
  }

  canSelectDesign(design: Design): boolean {
    return !design.premium || this.isPremium;
  }

  copyUrl() {
    const url = this.getSelectedDesignUrl();
    navigator.clipboard.writeText(url).then(() => {
      this.showToastMessage('URL copied to clipboard!', 'success');
    }).catch(() => {
      this.showToastMessage('Failed to copy URL', 'error');
    });
  }

  testDesign() {
    const url = this.getSelectedDesignUrl();
    this.http.post('https://api.domdimabot.com/clip/test', {
      channelID: this.userId,
      streamer: this.login,
      timeout: this.timeoutSeconds
    }).subscribe({
      next: (data) => {
        console.log(data);
        this.showToastMessage('Design test sent successfully!', 'success');
      },
      error: (error) => {
        console.error('Error testing design:', error);
        this.showToastMessage('Failed to test design', 'error');
      }
    });
  }

  showToastMessage(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  onTimeoutChange() {
    // Ensure timeout is between 1 and 30
    if (this.timeoutSeconds < 1) this.timeoutSeconds = 1;
    if (this.timeoutSeconds > 30) this.timeoutSeconds = 30;
  }
}
