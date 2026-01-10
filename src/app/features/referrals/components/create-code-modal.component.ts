import { Component, output, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReferralStore } from '../referral.store';

@Component({
  selector: 'app-create-code-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      (click)="onBackdropClick($event)">
      
      <!-- Modal -->
      <div 
        class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-modal-enter"
        (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">New Campaign</h2>
            <button 
              (click)="close.emit()"
              class="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
              <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create a unique referral code for your campaign
          </p>
        </div>
        
        <!-- Form -->
        <form (ngSubmit)="onSubmit()" class="p-6 space-y-5">
          <!-- Label Input -->
          <div>
            <label for="label" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Campaign Label
            </label>
            <input 
              type="text"
              id="label"
              [(ngModel)]="label"
              name="label"
              placeholder="e.g., Twitch Stream, YouTube Video"
              class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required />
          </div>
          
          <!-- Code Input -->
          <div>
            <label for="code" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Referral Code
            </label>
            <input 
              type="text"
              id="code"
              [(ngModel)]="code"
              name="code"
              (input)="onCodeInput()"
              placeholder="e.g., alex_twitch"
              maxlength="16"
              class="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono"
              [class.border-slate-300]="!codeError()"
              [class.dark:border-slate-600]="!codeError()"
              [class.border-red-500]="codeError()"
              required />
            <div class="flex items-center justify-between mt-2">
              @if (codeError()) {
                <p class="text-sm text-red-500">{{ codeError() }}</p>
              } @else {
                <p class="text-xs text-slate-400">Alphanumeric and underscores only</p>
              }
              <p class="text-xs text-slate-400">{{ code().length }}/16</p>
            </div>
          </div>
          
          <!-- Preview -->
          @if (code().length > 0 && !codeError()) {
            <div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
              <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Your referral link will be:</p>
              <p class="text-sm font-mono text-purple-600 dark:text-purple-400 break-all">
                {{ store.getReferralLink(code()) }}
              </p>
            </div>
          }
          
          <!-- API Error -->
          @if (store.error()) {
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p class="text-sm text-red-600 dark:text-red-400">{{ store.error() }}</p>
            </div>
          }
          
          <!-- Actions -->
          <div class="flex items-center gap-3 pt-2">
            <button 
              type="button"
              (click)="close.emit()"
              class="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button 
              type="submit"
              [disabled]="!isValid() || store.isLoading()"
              class="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              @if (store.isLoading()) {
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating...</span>
              } @else {
                <span>Create Campaign</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    @keyframes modal-enter {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    .animate-modal-enter {
      animation: modal-enter 0.2s ease-out;
    }
  `]
})
export class CreateCodeModalComponent {
  protected readonly store = inject(ReferralStore);
  
  close = output<void>();
  created = output<void>();
  
  label = signal('');
  code = signal('');
  codeError = signal<string | null>(null);
  
  onCodeInput(): void {
    const value = this.code();
    this.store.clearError();
    
    // Validate code format
    if (value.length > 0) {
      const validRegex = /^[a-zA-Z0-9_]*$/;
      if (!validRegex.test(value)) {
        this.codeError.set('Only letters, numbers, and underscores allowed');
        return;
      }
    }
    
    this.codeError.set(null);
  }
  
  isValid(): boolean {
    return (
      this.label().trim().length > 0 &&
      this.code().trim().length > 0 &&
      !this.codeError()
    );
  }
  
  async onSubmit(): Promise<void> {
    if (!this.isValid()) return;
    
    try {
      await this.store.createCode(this.code().trim(), this.label().trim());
      this.created.emit();
      this.close.emit();
    } catch (error) {
      // Error is already set in the store
    }
  }
  
  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
