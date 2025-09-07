import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get user and check admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role
    const { data: isAdminResult } = await supabase.rpc('is_admin', { _user_id: user.id });
    
    if (!isAdminResult) {
      return new Response(
        JSON.stringify({ error: 'Access denied. Admin role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get KPI data
    const [
      partnersResult,
      applicationsResult,
      earningsResult,
      exchangesResult
    ] = await Promise.all([
      // New partners today
      supabase
        .from('partner_exchange_status')
        .select('created_at')
        .gte('created_at', new Date().toISOString().split('T')[0]),
      
      // Pending applications
      supabase
        .from('applications')
        .select('id')
        .eq('status', 'review_pending'),
      
      // Calculate approval rate (last 7 days)
      supabase
        .from('applications')
        .select('status')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      
      // Exchange connector health
      supabase
        .from('exchanges')
        .select('status')
    ]);

    // Calculate KPIs
    const newPartnersToday = partnersResult.data?.length || 0;
    const pendingApplications = applicationsResult.data?.length || 0;
    
    const applications7d = earningsResult.data || [];
    const approved7d = applications7d.filter(app => app.status === 'approved').length;
    const approvalRate7d = applications7d.length > 0 ? Math.round((approved7d / applications7d.length) * 100) : 0;
    
    const exchanges = exchangesResult.data || [];
    const activeExchanges = exchanges.filter(ex => ex.status === 'active').length;
    const connectorUptime = exchanges.length > 0 ? Math.round((activeExchanges / exchanges.length) * 100) : 0;

    // Get active users (simplified - users with recent activity)
    const { data: activeUsersResult } = await supabase
      .from('uids')
      .select('user_id')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    
    const activeUsers = new Set(activeUsersResult?.map(u => u.user_id) || []).size;

    // Mock token treasury (would need actual wallet integration)
    const tokenTreasury = "1.5M CTOSS";

    // Get alerts (simplified)
    const alerts = [
      {
        ts: new Date().toISOString(),
        type: 'info',
        message: 'System operational',
        severity: 'low'
      }
    ];

    // Check for low approval rate alert
    if (approvalRate7d < 70) {
      alerts.unshift({
        ts: new Date().toISOString(),
        type: 'warning',
        message: `Low approval rate: ${approvalRate7d}% (last 7 days)`,
        severity: 'medium'
      });
    }

    // Check for pending applications alert
    if (pendingApplications > 10) {
      alerts.unshift({
        ts: new Date().toISOString(),
        type: 'warning',
        message: `${pendingApplications} applications pending review`,
        severity: 'medium'
      });
    }

    const dashboardData = {
      kpi: {
        newPartnersToday: newPartnersToday.toString(),
        pendingApplications: pendingApplications.toString(),
        approvalRate7d: `${approvalRate7d}%`,
        activeUsers: activeUsers.toString(),
        connectorUptime: `${connectorUptime}%`,
        tokenTreasury
      },
      alerts
    };

    return new Response(
      JSON.stringify(dashboardData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Admin dashboard error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});