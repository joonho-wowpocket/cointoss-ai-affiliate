export type Locale = 'ko' | 'en';

export type Mode = 'basic' | 'approved';
export type ApprovalState = 'NotApplied' | 'Applied' | 'Reviewing' | 'Approved' | 'Rejected';
export type UidState = 'Pending' | 'Approved' | 'Rejected' | 'NeedInfo';

export interface Exchange {
  exchangeId: string;       // 'bybit', 'binance' 등
  name: string;
  baseRate: number;         // 0.25 (25%)
  approvedRate?: number;    // 0.85 (85%)
  status: 'active' | 'paused';
}

export interface PartnerExchangeStatus {
  partnerId: string;
  exchangeId: string;
  mode: Mode;               // basic | approved
  state: ApprovalState;
  refCode?: string;         // approved일 때 거래소 추천인 코드
  updatedAt: string;
}

export interface DashboardKPI {
  cards: Array<{label: string; value: string; delta?: string}>;
  insights: string[];
  next_best_actions: Array<{label: string; link: string}>;
  diagnostics: {warnings: string[]};
}

export interface PartnerHubCard {
  exchange: string;
  rate_display: string;
  state_badge: string;
  ctas: Array<{
    label: string;
    action: string;
    payload: Record<string, any>;
  }>;
  nudge?: string;
}

export interface UidSubmission {
  id: string;
  userId: string;
  exchangeId: string;
  uid: string;
  status: UidState;
  memo?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Earning {
  id: string;
  userId: string;
  uidId?: string;
  exchangeId: string;
  mode: Mode;
  amount: number;
  currency: string;
  date: string;
}

export interface Settlement {
  id: string;
  userId: string;
  amount: number;
  network: string;
  address: string;
  status: 'Pending' | 'Sent' | 'Failed';
  txHash?: string;
  createdAt: string;
}