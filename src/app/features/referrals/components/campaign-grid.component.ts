import { Component, output, inject } from '@angular/core';
import { ReferralStore } from '../referral.store';
import { ReferralCardComponent } from './referral-card.component';

@Component({
  selector: 'app-campaign-grid',
  standalone: true,
  imports: [ReferralCardComponent],
  template: `
    <div class="mb-8">
      <!-- Section Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Your Campaigns</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {{ store.remainingSlots() }} slots remaining on {{ store.userPlan().name }} plan
          </p>
        </div>
        
        @if (store.canCreateCode()) {
          <button 
            (click)="newCampaign.emit()"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 active:scale-95">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>New Campaign</span>
          </button>
        }
      </div>
      
      <!-- Loading State -->
      @if (store.isLoading() && store.codes().length === 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (i of [1, 2, 3]; track i) {
            <div class="h-48 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
          }
        </div>
      } @else {
        <!-- Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (code of store.codes(); track code.id) {
            <app-referral-card [code]="code" />
          }
          
          <!-- Add New Card (Alternative) -->
          @if (store.canCreateCode()) {
            <button 
              (click)="newCampaign.emit()"
              class="h-48 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-purple-400 dark:hover:border-purple-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 flex flex-col items-center justify-center gap-3 group">
              <div class="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 flex items-center justify-center transition-colors">
                <svg class="w-6 h-6 text-slate-400 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p class="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Add New Campaign
              </p>
            </button>
          }
        </div>
        
        <!-- Empty State -->
        @if (store.codes().length === 0 && !store.isLoading()) {
          <div class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">No campaigns yet</h3>
            <p class="text-slate-500 dark:text-slate-400 mb-4">Create your first referral campaign to start earning credits</p>
            <button 
              (click)="newCampaign.emit()"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Campaign</span>
            </button>
          </div>
        }
      }
    </div>
  `
})
export class CampaignGridComponent {
  protected readonly store = inject(ReferralStore);
  
  newCampaign = output<void>();
}
