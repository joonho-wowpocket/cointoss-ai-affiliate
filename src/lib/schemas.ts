import { z } from 'zod';

export const createBasicLinkSchema = z.object({
  exchangeId: z.string().min(2),
});

export const createApprovedLinkSchema = z.object({
  exchangeId: z.string().min(2),
  refCode: z.string().min(3).max(64),
});

export const submitUidSchema = z.object({
  exchangeId: z.string().min(2),
  uid: z.string().min(4).max(32),
  memo: z.string().max(200).optional(),
});

export const applyApprovalSchema = z.object({
  exchangeId: z.string().min(2),
  partnerNickname: z.string().min(2),
  email: z.string().email(),
  attachments: z.array(z.string().url()).optional(),
});

export const settlementRequestSchema = z.object({
  amount: z.number().positive(),
  network: z.enum(['TRC20']),
  walletAddress: z.string().min(20),
});

export const earningsQuerySchema = z.object({
  period: z.enum(['7d','30d','90d']).default('30d'),
  exchanges: z.array(z.string()).optional(),
  mode: z.enum(['basic','approved','all']).default('all'),
});

export const dashboardKpiInputSchema = z.object({
  locale: z.enum(['ko', 'en']).default('ko'),
  period: z.enum(['last_7d', 'last_30d', 'custom']).default('last_30d'),
  filters: z.object({
    exchanges: z.array(z.string()),
    mode: z.enum(['basic', 'approved', 'all']).default('all'),
  }),
  metrics: z.object({
    earnings: z.array(z.object({
      date: z.string(),
      amount: z.number(),
      currency: z.string(),
    })),
    uids: z.object({
      total: z.number(),
      pending: z.number(),
      approved: z.number(),
      rejected: z.number(),
    }),
    clicks: z.object({
      total: z.number(),
      unique: z.number(),
    }),
    conversions: z.object({
      signups: z.number(),
      rate: z.number(),
    }),
  }),
});

export const partnerHubInputSchema = z.object({
  locale: z.enum(['ko', 'en']).default('ko'),
  tab: z.enum(['basic', 'approved']),
  exchanges: z.array(z.object({
    code: z.string(),
    name: z.string(),
    base_rate: z.string(),
    approved_rate: z.string(),
    state: z.enum(['NotApplied', 'Applied', 'Approved', 'Rejected']),
  })),
});

// Type inference from schemas
export type CreateBasicLinkInput = z.infer<typeof createBasicLinkSchema>;
export type CreateApprovedLinkInput = z.infer<typeof createApprovedLinkSchema>;
export type SubmitUidInput = z.infer<typeof submitUidSchema>;
export type ApplyApprovalInput = z.infer<typeof applyApprovalSchema>;
export type SettlementRequestInput = z.infer<typeof settlementRequestSchema>;
export type EarningsQueryInput = z.infer<typeof earningsQuerySchema>;
export type DashboardKpiInput = z.infer<typeof dashboardKpiInputSchema>;
export type PartnerHubInput = z.infer<typeof partnerHubInputSchema>;