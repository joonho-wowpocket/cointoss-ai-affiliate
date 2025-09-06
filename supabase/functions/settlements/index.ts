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
    const method = req.method;

    // GET /settlements - Get settlement history
    if (method === 'GET') {
      const { data: settlements, error: settlementsError } = await supabaseClient
        .from('settlements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (settlementsError) throw settlementsError;

      return new Response(JSON.stringify({
        success: true,
        data: settlements
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /settlements - Request settlement
    if (method === 'POST') {
      const { amount, network, walletAddress } = await req.json();
      
      if (!amount || !network || !walletAddress) {
        throw new Error('Amount, network, and wallet address are required');
      }

      // Validate minimum amount
      const minPayout = 500; // $500 minimum
      if (amount < minPayout) {
        return new Response(JSON.stringify({
          success: false,
          error: `Minimum payout amount is $${minPayout}`,
          eligible: false
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Calculate available balance (mock for now)
      const { data: earnings } = await supabaseClient
        .from('earnings')
        .select('amount')
        .eq('user_id', user.id);

      const totalEarnings = earnings?.reduce((sum, earning) => sum + parseFloat(earning.amount), 0) || 0;
      
      // Get total settled amount
      const { data: settlements } = await supabaseClient
        .from('settlements')
        .select('amount')
        .eq('user_id', user.id)
        .in('status', ['Pending', 'Sent']);

      const totalSettled = settlements?.reduce((sum, settlement) => sum + parseFloat(settlement.amount), 0) || 0;
      
      const availableAmount = totalEarnings - totalSettled;

      if (amount > availableAmount) {
        return new Response(JSON.stringify({
          success: false,
          error: `Insufficient balance. Available: $${availableAmount.toFixed(2)}`,
          eligible: false
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create settlement request
      const { data: settlement, error: settlementError } = await supabaseClient
        .from('settlements')
        .insert({
          user_id: user.id,
          amount: amount,
          network: network,
          address: walletAddress,
          status: 'Pending'
        })
        .select()
        .single();

      if (settlementError) throw settlementError;

      return new Response(JSON.stringify({
        success: true,
        eligible: true,
        data: {
          id: settlement.id,
          amount: `$${amount}`,
          network: network,
          address: walletAddress,
          status: 'Pending',
          etaHours: 48
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in settlements function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});