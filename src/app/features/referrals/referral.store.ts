import { Injectable, signal, computed, inject } from '@angular/core';
import { ReferralCode, CreditTransaction, UserPlan } from './referral.models';

@Injectable({
  providedIn: 'root'
})
export class ReferralStore {
  // State signals
  readonly codes = signal<ReferralCode[]>([]);
  readonly transactions = signal<CreditTransaction[]>([]);
  readonly balance = signal<number>(0);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  
  // User plan - could be fetched from a user service
  readonly userPlan = signal<UserPlan>({
    name: 'Pro',
    maxCodes: 10
  });

  // Computed values
  readonly canCreateCode = computed(() => {
    return this.codes().length < this.userPlan().maxCodes;
  });

  readonly totalConversions = computed(() => {
    return this.codes().reduce((sum, code) => sum + code.stats.conversions, 0);
  });

  readonly totalClicks = computed(() => {
    return this.codes().reduce((sum, code) => sum + code.stats.clicks, 0);
  });

  readonly remainingSlots = computed(() => {
    return this.userPlan().maxCodes - this.codes().length;
  });

  constructor() {
    // Initialize with mock data
    this.fetchData();
  }

  /**
   * Fetch referral data (mocked for development)
   */
  fetchData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Simulate API delay
    setTimeout(() => {
      // Mock referral codes
      const mockCodes: ReferralCode[] = [
        {
          id: '1',
          code: 'alex_twitch',
          label: 'Twitch Stream',
          createdAt: new Date('2025-11-15'),
          stats: { conversions: 12, clicks: 245 }
        },
        {
          id: '2',
          code: 'alex_yt',
          label: 'YouTube Channel',
          createdAt: new Date('2025-12-01'),
          stats: { conversions: 8, clicks: 180 }
        },
        {
          id: '3',
          code: 'alex_x',
          label: 'X/Twitter Bio',
          createdAt: new Date('2025-12-20'),
          stats: { conversions: 5, clicks: 92 }
        }
      ];

      // Mock transactions
      const mockTransactions: CreditTransaction[] = [
        {
          id: 't1',
          date: new Date('2026-01-09'),
          type: 'referral',
          amount: 2,
          details: 'New signup via alex_twitch',
          referralCode: 'alex_twitch'
        },
        {
          id: 't2',
          date: new Date('2026-01-08'),
          type: 'bonus',
          amount: 5,
          details: 'Weekly activity bonus'
        },
        {
          id: 't3',
          date: new Date('2026-01-07'),
          type: 'referral',
          amount: 2,
          details: 'New signup via alex_yt',
          referralCode: 'alex_yt'
        },
        {
          id: 't4',
          date: new Date('2026-01-05'),
          type: 'redemption',
          amount: -10,
          details: 'Redeemed for Premium upgrade'
        },
        {
          id: 't5',
          date: new Date('2026-01-03'),
          type: 'referral',
          amount: 2,
          details: 'New signup via alex_x',
          referralCode: 'alex_x'
        }
      ];

      this.codes.set(mockCodes);
      this.transactions.set(mockTransactions);
      this.balance.set(15);
      this.isLoading.set(false);
    }, 500);
  }

  /**
   * Create a new referral code
   */
  createCode(code: string, label: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Validate code format (alphanumeric, max 16 chars)
      const codeRegex = /^[a-zA-Z0-9_]{1,16}$/;
      if (!codeRegex.test(code)) {
        this.error.set('Code must be alphanumeric and max 16 characters');
        reject(new Error('Invalid code format'));
        return;
      }

      // Check if code already exists
      const existingCode = this.codes().find(
        c => c.code.toLowerCase() === code.toLowerCase()
      );
      if (existingCode) {
        this.error.set('This code is already taken');
        reject(new Error('Code already exists'));
        return;
      }

      // Check plan limit
      if (!this.canCreateCode()) {
        this.error.set('You have reached your plan limit');
        reject(new Error('Plan limit reached'));
        return;
      }

      this.isLoading.set(true);

      // Simulate API call
      setTimeout(() => {
        const newCode: ReferralCode = {
          id: `code_${Date.now()}`,
          code: code.toLowerCase(),
          label,
          createdAt: new Date(),
          stats: { conversions: 0, clicks: 0 }
        };

        this.codes.update(codes => [...codes, newCode]);
        this.isLoading.set(false);
        this.error.set(null);
        resolve(true);
      }, 300);
    });
  }

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  }

  /**
   * Get referral link for a code
   */
  getReferralLink(code: string): string {
    // This would be your actual referral link format
    return `https://domdimabot.com/ref/${code}`;
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.error.set(null);
  }
}
