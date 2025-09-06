import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const period = url.searchParams.get('period') || '30d';
    const exchanges = url.searchParams.get('exchanges')?.split(',') || [];
    const mode = url.searchParams.get('mode') || 'all';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
    }

    // Build query
    let query = supabaseClient
      .from('earnings')
      .select(`
        *,
        exchanges:exchange_id (name, logo_url)
      `)
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    if (exchanges.length > 0) {
      query = query.in('exchange_id', exchanges);
    }

    if (mode !== 'all') {
      query = query.eq('mode', mode);
    }

    const { data: earnings, error: earningsError } = await query.order('date', { ascending: false });

    if (earningsError) throw earningsError;

    // Calculate summary
    const totalEarnings = earnings?.reduce((sum, earning) => sum + parseFloat(earning.amount), 0) || 0;
    const basicEarnings = earnings
      ?.filter(e => e.mode === 'basic')
      .reduce((sum, earning) => sum + parseFloat(earning.amount), 0) || 0;
    const approvedEarnings = earnings
      ?.filter(e => e.mode === 'approved')
      .reduce((sum, earning) => sum + parseFloat(earning.amount), 0) || 0;

    // Group by exchange and mode
    const groupedEarnings = earnings?.reduce((acc, earning) => {
      const key = `${earning.exchange_id}-${earning.mode}`;
      if (!acc[key]) {
        acc[key] = {
          exchange: earning.exchanges?.name || earning.exchange_id,
          mode: earning.mode,
          amount: 0,
          currency: earning.currency
        };
      }
      acc[key].amount += parseFloat(earning.amount);
      return acc;
    }, {} as Record<string, any>) || {};

    const summary = {
      total: totalEarnings,
      basic: basicEarnings,
      approved: approvedEarnings,
      currency: 'USDT'
    };

    const rows = Object.values(groupedEarnings).map((item: any) => ({
      exchange: item.exchange,
      mode: item.mode === 'basic' ? '기본' : '승인',
      amount: `$${item.amount.toLocaleString()}`
    }));

    return new Response(JSON.stringify({
      success: true,
      data: {
        summary,
        rows,
        rawData: earnings
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in earnings function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});