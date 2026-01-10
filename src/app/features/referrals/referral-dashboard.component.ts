import { Component, signal, inject } from '@angular/core';
import { StatsHeaderComponent } from './components/stats-header.component';
import { CampaignGridComponent } from './components/campaign-grid.component';
import { LedgerTableComponent } from './components/ledger-table.component';
import { CreateCodeModalComponent } from './components/create-code-modal.component';
import { ReferralStore } from './referral.store';

@Component({
  selector: 'app-referral-dashboard',
  standalone: true,
  imports: [
    StatsHeaderComponent,
    CampaignGridComponent,
    LedgerTableComponent,
    CreateCodeModalComponent
  ],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Referral Dashboard
          </h1>
          <p class="text-slate-500 dark:text-slate-400 mt-2">
            Manage your referral campaigns and track your earnings
          </p>
        </div>
        
        <!-- Stats Header -->
        <app-stats-header />
        
        <!-- Campaign Grid -->
        <app-campaign-grid (newCampaign)="showModal.set(true)" />
        
        <!-- Ledger Table -->
        <app-ledger-table />
      </div>
      
      <!-- Create Code Modal -->
      @if (showModal()) {
        <app-create-code-modal 
          (close)="showModal.set(false)"
          (created)="onCampaignCreated()" />
      }
    </div>
  `
})
export class ReferralDashboardComponent {
  private readonly store = inject(ReferralStore);
  
  showModal = signal(false);
  
  onCampaignCreated(): void {
    // Modal will close automatically
    // Optionally refresh data or show a success message
  }
}
