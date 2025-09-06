import { supabase } from '@/integrations/supabase/client';
import type { 
  CreateBasicLinkInput, 
  CreateApprovedLinkInput, 
  SubmitUidInput, 
  ApplyApprovalInput,
  SettlementRequestInput,
  EarningsQueryInput 
} from './schemas';

// Partner Exchange API
export const partnerApi = {
  // Get exchanges with partner status
  getExchanges: async (tab: 'basic' | 'approved' = 'basic') => {
    const { data, error } = await supabase.functions.invoke('partner-exchanges', {
      method: 'GET',
      body: null,
    });
    
    if (error) throw error;
    return data;
  },

  // Create basic link
  createBasicLink: async (input: CreateBasicLinkInput) => {
    const { data, error } = await supabase.functions.invoke('partner-exchanges', {
      method: 'POST',
      body: input,
    });
    
    if (error) throw error;
    return data;
  },

  // Save approved link
  saveApprovedLink: async (input: CreateApprovedLinkInput) => {
    const { data, error } = await supabase.functions.invoke('partner-exchanges', {
      method: 'POST',
      body: input,
    });
    
    if (error) throw error;
    return data;
  },

  // Submit UID
  submitUid: async (input: SubmitUidInput) => {
    const { data, error } = await supabase.functions.invoke('partner-exchanges', {
      method: 'POST',
      body: input,
    });
    
    if (error) throw error;
    return data;
  },

  // Apply for approval
  applyApproval: async (input: ApplyApprovalInput) => {
    const { data, error } = await supabase.functions.invoke('partner-exchanges', {
      method: 'POST',
      body: input,
    });
    
    if (error) throw error;
    return data;
  },
};

// Earnings API
export const earningsApi = {
  // Get earnings data
  getEarnings: async (params: EarningsQueryInput) => {
    const searchParams = new URLSearchParams();
    searchParams.append('period', params.period);
    searchParams.append('mode', params.mode);
    if (params.exchanges) {
      searchParams.append('exchanges', params.exchanges.join(','));
    }

    const { data, error } = await supabase.functions.invoke('earnings', {
      method: 'GET',
      body: null,
    });
    
    if (error) throw error;
    return data;
  },
};

// Settlements API
export const settlementsApi = {
  // Get settlement history
  getSettlements: async () => {
    const { data, error } = await supabase.functions.invoke('settlements', {
      method: 'GET',
      body: null,
    });
    
    if (error) throw error;
    return data;
  },

  // Request settlement
  requestSettlement: async (input: SettlementRequestInput) => {
    const { data, error } = await supabase.functions.invoke('settlements', {
      method: 'POST',
      body: input,
    });
    
    if (error) throw error;
    return data;
  },
};

export const dashboardApi = {
  generateKPI: async (input: any) => {
    const { data, error } = await supabase.functions.invoke('generate-dashboard-kpi', {
      body: input,
    });
    
    if (error) throw error;
    return data;
  },
};

// Partner Hub API (existing)
export const partnerHubApi = {
  generateHub: async (input: any) => {
    const { data, error } = await supabase.functions.invoke('generate-partner-hub', {
      body: input,
    });
    
    if (error) throw error;
    return data;
  },
};

// Lead Magnet API (existing)
export const leadMagnetApi = {
  generateMagnet: async (input: any) => {
    const { data, error } = await supabase.functions.invoke('generate-lead-magnet', {
      body: input,
    });
    
    if (error) throw error;
    return data;
  },
};

// AI Assistants API
export const aiApi = {
  // Create AI task
  createTask: async (input: { agent: string; name: string; input?: any; correlationId?: string }) => {
    const { data, error } = await supabase.functions.invoke('ai-tasks', {
      method: 'POST',
      body: input,
    });
    
    if (error) throw error;
    return data;
  },

  // Get tasks
  getTasks: async (params?: { agent?: string; status?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.agent) searchParams.append('agent', params.agent);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const { data, error } = await supabase.functions.invoke('ai-tasks', {
      method: 'GET',
    });
    
    if (error) throw error;
    return data;
  },

  // Get specific task
  getTask: async (taskId: string) => {
    const { data, error } = await supabase.functions.invoke(`ai-tasks/${taskId}`, {
      method: 'GET',
    });
    
    if (error) throw error;
    return data;
  },

  // Cancel task
  cancelTask: async (taskId: string) => {
    const { data, error } = await supabase.functions.invoke(`ai-tasks/${taskId}`, {
      method: 'DELETE',
    });
    
    if (error) throw error;
    return data;
  },

  // Create pipeline
  createPipeline: async (input: { name: string; context?: any; steps: any[] }) => {
    const { data, error } = await supabase.functions.invoke('ai-pipelines', {
      method: 'POST',
      body: input,
    });
    
    if (error) throw error;
    return data;
  },

  // Get pipelines
  getPipelines: async (params?: { status?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const { data, error } = await supabase.functions.invoke('ai-pipelines', {
      method: 'GET',
    });
    
    if (error) throw error;
    return data;
  },

  // Get specific pipeline
  getPipeline: async (pipelineId: string) => {
    const { data, error } = await supabase.functions.invoke(`ai-pipelines/${pipelineId}`, {
      method: 'GET',
    });
    
    if (error) throw error;
    return data;
  },

  // Cancel pipeline
  cancelPipeline: async (pipelineId: string) => {
    const { data, error } = await supabase.functions.invoke(`ai-pipelines/${pipelineId}/cancel`, {
      method: 'POST',
    });
    
    if (error) throw error;
    return data;
  },
};