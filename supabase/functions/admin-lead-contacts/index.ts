import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Decryption function matching the encryption
async function decryptData(encryptedData: string, key: string): Promise<string> {
  const keyData = new TextEncoder().encode(key.padEnd(32, '0').slice(0, 32));
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encrypted
  );
  
  return new TextDecoder().decode(decrypted);
}

// Create masked version of contact info for safer display
function maskContactInfo(contactInfo: any) {
  const masked: any = {};
  
  if (contactInfo.email) {
    const [username, domain] = contactInfo.email.split('@');
    masked.email = username.slice(0, 2) + '***@' + domain;
  }
  
  if (contactInfo.phone) {
    masked.phone = contactInfo.phone.slice(0, 3) + '****' + contactInfo.phone.slice(-2);
  }
  
  if (contactInfo.telegram) {
    masked.telegram = contactInfo.telegram.slice(0, 3) + '***';
  }
  
  // Non-sensitive fields can be shown as-is
  if (contactInfo.name) masked.name = contactInfo.name;
  if (contactInfo.company) masked.company = contactInfo.company;
  if (contactInfo.notes) masked.notes = contactInfo.notes;
  
  return masked;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Check admin authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role
    const { data: isAdmin } = await supabase.rpc('is_admin', { _user_id: user.id });
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const leadCaptureId = url.searchParams.get('id');
    const maskData = url.searchParams.get('mask') === 'true';

    if (req.method === 'GET') {
      // Get encrypted lead captures
      let query = supabase
        .from('lead_captures')
        .select(`
          id,
          lead_magnet_id,
          partner_id,
          encrypted_contact_info,
          contact_info_hash,
          captured_at,
          source,
          ip_address,
          user_agent
        `);

      if (leadCaptureId) {
        query = query.eq('id', leadCaptureId).single();
      } else {
        query = query.order('captured_at', { ascending: false }).limit(100);
      }

      const { data, error } = await query;

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch lead captures' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Decrypt contact information
      const encryptionKey = Deno.env.get('CONTACT_ENCRYPTION_KEY') || 'fallback_key_change_in_production';
      
      const processCapture = async (capture: any) => {
        if (!capture.encrypted_contact_info) {
          return { ...capture, contact_info: null };
        }

        try {
          const decryptedData = await decryptData(capture.encrypted_contact_info, encryptionKey);
          const contactInfo = JSON.parse(decryptedData);
          
          return {
            ...capture,
            contact_info: maskData ? maskContactInfo(contactInfo) : contactInfo,
            encrypted_contact_info: undefined // Don't expose encrypted data
          };
        } catch (decryptError) {
          console.error('Decryption error:', decryptError);
          return {
            ...capture,
            contact_info: { error: 'Failed to decrypt' },
            encrypted_contact_info: undefined
          };
        }
      };

      if (Array.isArray(data)) {
        const processed = await Promise.all(data.map(processCapture));
        return new Response(
          JSON.stringify(processed),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        const processed = await processCapture(data);
        return new Response(
          JSON.stringify(processed),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Admin lead contacts error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});