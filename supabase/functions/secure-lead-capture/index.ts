import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple encryption using Web Crypto API
async function encryptData(data: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key.padEnd(32, '0').slice(0, 32)); // Ensure 32 bytes
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const dataBytes = encoder.encode(data);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    dataBytes
  );
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

// Create hash for duplicate detection without exposing PII
async function hashContactInfo(contactInfo: any): Promise<string> {
  const hashData = [
    contactInfo.email || '',
    contactInfo.phone || '',
    contactInfo.telegram || ''
  ].join('|');
  
  const encoder = new TextEncoder();
  const data = encoder.encode(hashData);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        }
      }
    );

    const { contactInfo, leadMagnetId, source = 'lead_magnet_form' } = await req.json();

    if (!contactInfo || !leadMagnetId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: contactInfo, leadMagnetId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from auth header (optional for anonymous leads)
    const { data: { user } } = await supabase.auth.getUser();
    const partnerId = user?.id || 'anonymous';

    // Encrypt contact information
    const encryptionKey = Deno.env.get('CONTACT_ENCRYPTION_KEY') || 'fallback_key_change_in_production';
    const encryptedContactInfo = await encryptData(JSON.stringify(contactInfo), encryptionKey);
    const contactHash = await hashContactInfo(contactInfo);

    // Store encrypted lead capture
    const { data, error } = await supabase
      .from('lead_captures')
      .insert({
        lead_magnet_id: leadMagnetId,
        partner_id: partnerId,
        encrypted_contact_info: encryptedContactInfo,
        contact_info_hash: contactHash,
        source,
        ip_address: req.headers.get('x-forwarded-for') || 
                   req.headers.get('x-real-ip') || 
                   'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save lead capture' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update download count
    const { error: updateError } = await supabase.rpc('increment_download_count', {
      magnet_id: leadMagnetId
    });

    if (updateError) {
      console.warn('Failed to update download count:', updateError);
    }

    // Return success without exposing sensitive data
    return new Response(
      JSON.stringify({ 
        success: true, 
        id: data.id,
        message: 'Lead captured securely'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Secure lead capture error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});