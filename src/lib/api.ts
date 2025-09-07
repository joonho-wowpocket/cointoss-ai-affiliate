import { supabase } from '@/integrations/supabase/client';
import type { 
  CreateBasicLinkInput, 
  CreateApprovedLinkInput, 
  SubmitUidInput, 
  ApplyApprovalInput,
  SettlementRequestInput,
  EarningsQueryInput 
} from './schemas';

// Runtime guard for preview data
const isProduction = process.env.NODE_ENV === 'production';

const blockPreviewData = (userRoles: string[] = [], allowPreviewFlag = false) => {
  // Always block for regular users in production
  if (isProduction && !userRoles.some(role => ['SuperAdmin', 'Dev'].includes(role))) {
    return true;
  }
  
  // Block if preview flag is disabled (even for admins in non-production)
  if (!allowPreviewFlag && !userRoles.some(role => ['SuperAdmin', 'Dev'].includes(role))) {
    return true;
  }
  
  return false;
};

const validateApiResponse = (data: any) => {
  // Check for common preview/mock data markers
  const previewMarkers = ['preview', 'mock', 'dummy', 'sample', 'test'];
  const dataString = JSON.stringify(data).toLowerCase();
  
  const hasPreviewMarkers = previewMarkers.some(marker => 
    dataString.includes(marker) || 
    (data.preview === true) ||
    (data.isDummy === true) ||
    (data.isMock === true)
  );
  
  if (hasPreviewMarkers) {
    throw new Error('Preview data blocked - contains dummy markers');
  }
  
  return data;
};

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
  getEarnings: async (params: EarningsQueryInput, userRoles: string[] = [], allowPreview = false) => {
    // Block preview data for non-admin users
    if (blockPreviewData(userRoles, allowPreview)) {
      return {
        success: true,
        data: {
          summary: { total: 0, basic: 0, approved: 0 },
          grouped: [],
          earnings: []
        }
      };
    }

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
    
    // Validate response doesn't contain preview data
    return validateApiResponse(data);
  }
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

// Dashboard API
export const dashboardApi = {
  // Get dashboard KPI data
  generateKPI: async (input: any, userRoles: string[] = [], allowPreview = false) => {
    // Block preview data for non-admin users
    if (blockPreviewData(userRoles, allowPreview)) {
      return {
        success: true,
        data: {
          cards: [
            { label: "Total Earnings", value: "$0", delta: "" },
            { label: "Active Referrals", value: "0", delta: "" },
            { label: "AI Tasks", value: "0", delta: "" },
            { label: "Partner Tier", value: "Basic", delta: "" }
          ],
          insights: [],
          next_best_actions: [
            { label: "Connect your first exchange", link: "/partner-hub" }
          ],
          diagnostics: { warnings: [] }
        }
      };
    }

    const { data, error } = await supabase.functions.invoke('generate-dashboard-kpi', {
      body: input
    });
    
    if (error) throw error;
    
    // Validate response doesn't contain preview data
    return validateApiResponse(data);
  },

  // Get exchanges list  
  getExchanges: async () => {
    const { data, error } = await supabase
      .from('exchanges')
      .select('*')
      .eq('status', 'active');
    
    if (error) throw error;
    return { success: true, data: data || [] };
  },

  // Get user profile
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data: data || {} };
  }
};

// Profile API
export const profileApi = {
  getProfile: async (userId: string, userRoles: string[] = [], allowPreview = false) => {
    if (blockPreviewData(userRoles, allowPreview)) {
      return {
        success: true,
        data: {
          ref_code: '',
          partner_tier: 'Basic',
          display_name: '',
          linkages: [],
          earnings_summary: { total: 0, this_month: 0 }
        }
      };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return validateApiResponse({ success: true, data: data || {} });
  },

  getLinkages: async (userId: string, userRoles: string[] = [], allowPreview = false) => {
    if (blockPreviewData(userRoles, allowPreview)) {
      return { success: true, data: [] };
    }

    const { data, error } = await supabase
      .from('partner_exchange_status')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return validateApiResponse({ success: true, data: data || [] });
  }
};

// Marketplace API
export const marketplaceApi = {
  getItems: async (userRoles: string[] = [], allowPreview = false) => {
    if (blockPreviewData(userRoles, allowPreview)) {
      return { success: true, data: [] };
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'published');
    
    if (error) throw error;
    return validateApiResponse({ success: true, data: data || [] });
  }
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