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
    const pathname = url.pathname;

    // GET /partner-exchanges - List exchanges with partner status
    if (method === 'GET' && pathname.includes('partner-exchanges')) {
      const tab = url.searchParams.get('tab') || 'basic';
      
      // Get all exchanges
      const { data: exchanges, error: exchangeError } = await supabaseClient
        .from('exchanges')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (exchangeError) throw exchangeError;

      // Get partner status for each exchange
      const { data: partnerStatus } = await supabaseClient
        .from('partner_exchange_status')
        .select('*')
        .eq('user_id', user.id);

      // Combine exchange data with partner status
      const exchangesWithStatus = exchanges.map(exchange => {
        const basicStatus = partnerStatus?.find(s => 
          s.exchange_id === exchange.id && s.mode === 'basic'
        );
        const approvedStatus = partnerStatus?.find(s => 
          s.exchange_id === exchange.id && s.mode === 'approved'
        );

        return {
          exchangeId: exchange.id,
          name: exchange.name,
          baseRate: `${Math.round(exchange.base_rate * 100)}%`,
          approvedRate: exchange.approved_rate ? `${Math.round(exchange.approved_rate * 100)}%` : null,
          logo: exchange.logo_url,
          basicState: basicStatus?.state || 'NotApplied',
          approvedState: approvedStatus?.state || 'NotApplied',
          refCode: approvedStatus?.ref_code,
          baseUrl: exchange.base_url,
          refParam: exchange.ref_param
        };
      });

      return new Response(JSON.stringify({
        success: true,
        data: exchangesWithStatus
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /partner-exchanges/links/basic - Create basic link
    if (method === 'POST' && pathname.includes('links/basic')) {
      const { exchangeId } = await req.json();
      
      if (!exchangeId) {
        throw new Error('Exchange ID is required');
      }

      // Get exchange info
      const { data: exchange } = await supabaseClient
        .from('exchanges')
        .select('*')
        .eq('id', exchangeId)
        .single();

      if (!exchange) {
        throw new Error('Exchange not found');
      }

      // Generate basic link (using platform code)
      const basicCode = `COINTOSS_${exchangeId.toUpperCase()}_BASIC`;
      const url = `${exchange.base_url}?${exchange.ref_param}=${basicCode}`;

      // Save link
      const { data: link, error: linkError } = await supabaseClient
        .from('links')
        .upsert({
          user_id: user.id,
          exchange_id: exchangeId,
          mode: 'basic',
          url: url
        }, {
          onConflict: 'user_id,exchange_id,mode'
        })
        .select()
        .single();

      if (linkError) throw linkError;

      return new Response(JSON.stringify({
        success: true,
        data: { url: link.url }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /partner-exchanges/links/approved - Save approved link
    if (method === 'POST' && pathname.includes('links/approved')) {
      const { exchangeId, refCode } = await req.json();
      
      if (!exchangeId || !refCode) {
        throw new Error('Exchange ID and referral code are required');
      }

      // Get exchange info
      const { data: exchange } = await supabaseClient
        .from('exchanges')
        .select('*')
        .eq('id', exchangeId)
        .single();

      if (!exchange) {
        throw new Error('Exchange not found');
      }

      // Update partner status
      const { error: statusError } = await supabaseClient
        .from('partner_exchange_status')
        .upsert({
          user_id: user.id,
          exchange_id: exchangeId,
          mode: 'approved',
          state: 'Approved',
          ref_code: refCode
        }, {
          onConflict: 'user_id,exchange_id,mode'
        });

      if (statusError) throw statusError;

      // Generate approved link
      const url = `${exchange.base_url}?${exchange.ref_param}=${refCode}`;

      // Save link
      const { data: link, error: linkError } = await supabaseClient
        .from('links')
        .upsert({
          user_id: user.id,
          exchange_id: exchangeId,
          mode: 'approved',
          url: url
        }, {
          onConflict: 'user_id,exchange_id,mode'
        })
        .select()
        .single();

      if (linkError) throw linkError;

      return new Response(JSON.stringify({
        success: true,
        data: { url: link.url }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /partner-exchanges/uids - Submit UID
    if (method === 'POST' && pathname.includes('uids')) {
      const { exchangeId, uid, memo } = await req.json();
      
      if (!exchangeId || !uid) {
        throw new Error('Exchange ID and UID are required');
      }

      // Check for duplicate UID
      const { data: existingUid } = await supabaseClient
        .from('uids')
        .select('id')
        .eq('exchange_id', exchangeId)
        .eq('uid', uid)
        .maybeSingle();

      if (existingUid) {
        throw new Error('This UID is already registered');
      }

      // Create UID submission
      const { data: newUid, error: uidError } = await supabaseClient
        .from('uids')
        .insert({
          user_id: user.id,
          exchange_id: exchangeId,
          uid: uid,
          memo: memo,
          status: 'Pending'
        })
        .select()
        .single();

      if (uidError) throw uidError;

      return new Response(JSON.stringify({
        success: true,
        data: { id: newUid.id, status: newUid.status }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /partner-exchanges/apply - Apply for approval
    if (method === 'POST' && pathname.includes('apply')) {
      const { exchangeId, partnerNickname, email, attachments } = await req.json();
      
      if (!exchangeId || !partnerNickname || !email) {
        throw new Error('Exchange ID, partner nickname, and email are required');
      }

      // Update partner status
      const { data: application, error: appError } = await supabaseClient
        .from('partner_exchange_status')
        .upsert({
          user_id: user.id,
          exchange_id: exchangeId,
          mode: 'approved',
          state: 'Applied',
          application_data: {
            partnerNickname,
            email,
            attachments: attachments || []
          }
        }, {
          onConflict: 'user_id,exchange_id,mode'
        })
        .select()
        .single();

      if (appError) throw appError;

      return new Response(JSON.stringify({
        success: true,
        data: { id: application.id, state: application.state }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in partner-exchanges function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});