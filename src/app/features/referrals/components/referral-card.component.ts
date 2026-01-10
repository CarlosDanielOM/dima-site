import { Component, input, output, inject, signal } from '@angular/core';
import { ReferralCode } from '../referral.models';
import { ReferralStore } from '../referral.store';
import { getCardGradient } from '../referral.utils';

@Component({
  selector: 'app-referral-card',
  standalone: true,
  template: `
    <div 
      class="relative w-full h-48 rounded-2xl p-6 shadow-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
      [class]="gradientClass()">
      
      <!-- Decorative elements -->
      <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
      
      <!-- Card content -->
      <div class="relative z-10 h-full flex flex-col justify-between">
        <!-- Top section: Label -->
        <div class="flex items-start justify-between">
          <div>
            <p class="text-white/70 text-xs font-medium uppercase tracking-wider">Campaign</p>
            <p class="text-white font-semibold text-lg mt-1">{{ code().label }}</p>
          </div>
          <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
        </div>
        
        <!-- Center: Code -->
        <div class="text-center">
          <p class="text-white text-2xl font-mono font-bold tracking-widest">
            {{ code().code.toUpperCase() }}
          </p>
        </div>
        
        <!-- Bottom section: Stats and Copy button -->
        <div class="flex items-end justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <div class="flex-1 h-1.5 bg-white/20 rounded-full w-24 overflow-hidden">
                <div 
                  class="h-full bg-white rounded-full transition-all duration-500"
                  [style.width.%]="conversionRate()">
                </div>
              </div>
              <span class="text-white/70 text-xs">{{ conversionRate().toFixed(0) }}%</span>
            </div>
            <p class="text-white font-medium text-sm">
              <span class="text-white/90">{{ code().stats.conversions }}</span>
              <span class="text-white/60"> Conversions</span>
            </p>
          </div>
          
          @if (copied()) {
            <button 
              (click)="onCopy($event)"
              class="flex items-center gap-2 bg-green-500/80 hover:bg-green-500/90 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 active:scale-95">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </button>
          } @else {
            <button 
              (click)="onCopy($event)"
              class="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 active:scale-95">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Copy Link</span>
            </button>
          }
        </div>
      </div>
    </div>
  `
})
export class ReferralCardComponent {
  private readonly store = inject(ReferralStore);
  
  code = input.required<ReferralCode>();
  
  copied = signal(false);
  
  gradientClass() {
    return getCardGradient(this.code().code);
  }
  
  conversionRate(): number {
    const { clicks, conversions } = this.code().stats;
    if (clicks === 0) return 0;
    return Math.min((conversions / clicks) * 100, 100);
  }
  
  async onCopy(event: Event): Promise<void> {
    event.stopPropagation();
    const link = this.store.getReferralLink(this.code().code);
    const success = await this.store.copyToClipboard(link);
    
    if (success) {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }
}
