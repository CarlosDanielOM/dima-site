// Referral code model
export interface ReferralCode {
  id: string;
  code: string;
  label: string;
  createdAt: Date;
  stats: {
    conversions: number;
    clicks: number;
  };
}

// Credit transaction model
export interface CreditTransaction {
  id: string;
  date: Date;
  type: 'referral' | 'bonus' | 'redemption' | 'adjustment';
  amount: number;
  details: string;
  referralCode?: string;
}

// User plan limits
export interface UserPlan {
  name: string;
  maxCodes: number;
}
