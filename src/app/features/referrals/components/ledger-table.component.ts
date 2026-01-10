import { Component, inject } from '@angular/core';
import { ReferralStore } from '../referral.store';
import { CreditTransaction } from '../referral.models';
import { formatRelativeDate } from '../referral.utils';

@Component({
  selector: 'app-ledger-table',
  standalone: true,
  template: `
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Transaction History</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Recent credit activity</p>
      </div>
      
      <!-- Loading State -->
      @if (store.isLoading() && store.transactions().length === 0) {
        <div class="p-6 space-y-4">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="h-12 rounded-lg bg-slate-100 dark:bg-slate-700 animate-pulse"></div>
          }
        </div>
      } @else if (store.transactions().length === 0) {
        <!-- Empty State -->
        <div class="p-12 text-center">
          <div class="w-12 h-12 mx-auto mb-4 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p class="text-slate-500 dark:text-slate-400">No transactions yet</p>
        </div>
      } @else {
        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-700/50">
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Details
                </th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
              @for (transaction of store.transactions(); track transaction.id) {
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <!-- Date -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-slate-600 dark:text-slate-300">
                      {{ formatDate(transaction.date) }}
                    </span>
                  </td>
                  
                  <!-- Type Badge -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [class]="getTypeBadgeClass(transaction.type)">
                      {{ getTypeLabel(transaction.type) }}
                    </span>
                  </td>
                  
                  <!-- Details -->
                  <td class="px-6 py-4">
                    <span class="text-sm text-slate-600 dark:text-slate-300">
                      {{ transaction.details }}
                    </span>
                    @if (transaction.referralCode) {
                      <span class="ml-2 text-xs font-mono text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded">
                        {{ transaction.referralCode }}
                      </span>
                    }
                  </td>
                  
                  <!-- Amount -->
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <span 
                      class="text-sm font-semibold"
                      [class.text-emerald-600]="transaction.amount > 0"
                      [class.dark:text-emerald-400]="transaction.amount > 0"
                      [class.text-red-600]="transaction.amount < 0"
                      [class.dark:text-red-400]="transaction.amount < 0">
                      {{ transaction.amount > 0 ? '+' : '' }}{{ transaction.amount }} tokens
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class LedgerTableComponent {
  protected readonly store = inject(ReferralStore);
  
  formatDate(date: Date): string {
    return formatRelativeDate(date);
  }
  
  getTypeLabel(type: CreditTransaction['type']): string {
    const labels: Record<CreditTransaction['type'], string> = {
      referral: 'Referral',
      bonus: 'Bonus',
      redemption: 'Redemption',
      adjustment: 'Adjustment'
    };
    return labels[type];
  }
  
  getTypeBadgeClass(type: CreditTransaction['type']): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    const typeClasses: Record<CreditTransaction['type'], string> = {
      referral: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      bonus: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      redemption: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      adjustment: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400'
    };
    
    return `${baseClasses} ${typeClasses[type]}`;
  }
}
