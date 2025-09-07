import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateApplicationRequest {
  exchange: string;
  uid: string;
  refCode: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        }
      )
    }

    if (req.method === 'POST') {
      const body: CreateApplicationRequest = await req.json()
      
      // Validate required fields
      if (!body.exchange || !body.uid || !body.refCode) {
        return new Response(
          JSON.stringify({ error: 'MISSING_FIELDS', message: 'Exchange, UID, and refCode are required' }),
          { 
            status: 400, 
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          }
        )
      }

      // Validate UID format based on exchange
      const uidPatterns: Record<string, RegExp> = {
        binance: /^[0-9]{8,12}$/,
        bybit: /^[A-Za-z0-9]{8,10}$/,
        okx: /^[A-Za-z0-9_-]{6,16}$/,
        gate: /^[0-9]{6,10}$/,
        default: /^[A-Za-z0-9_-]{3,32}$/
      }

      const pattern = uidPatterns[body.exchange] || uidPatterns.default
      if (!pattern.test(body.uid)) {
        return new Response(
          JSON.stringify({ error: 'UID_INVALID', message: 'Invalid UID format for selected exchange' }),
          { 
            status: 400, 
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          }
        )
      }

      // Check for existing active applications
      const { data: existing, error: checkError } = await supabaseClient
        .from('applications')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('exchange_id', body.exchange)
        .in('status', ['review_pending', 'approved'])
        .limit(1)

      if (checkError) {
        console.error('Check error:', checkError)
        return new Response(
          JSON.stringify({ error: 'DATABASE_ERROR', message: 'Failed to check existing applications' }),
          { 
            status: 500, 
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          }
        )
      }

      if (existing && existing.length > 0) {
        return new Response(
          JSON.stringify({ 
            error: 'DUPLICATE', 
            message: `You already have a ${existing[0].status} application for this exchange`
          }),
          { 
            status: 409, 
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          }
        )
      }

      // Check if UID is already used
      const { data: uidExists, error: uidError } = await supabaseClient
        .from('applications')
        .select('id')
        .eq('exchange_id', body.exchange)
        .eq('uid', body.uid)
        .limit(1)

      if (uidError) {
        console.error('UID check error:', uidError)
        return new Response(
          JSON.stringify({ error: 'DATABASE_ERROR', message: 'Failed to check UID availability' }),
          { 
            status: 500, 
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          }
        )
      }

      if (uidExists && uidExists.length > 0) {
        return new Response(
          JSON.stringify({ error: 'UID_EXISTS', message: 'This UID is already registered' }),
          { 
            status: 409, 
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          }
        )
      }

      // Create application
      const { data: application, error: createError } = await supabaseClient
        .from('applications')
        .insert({
          user_id: user.id,
          exchange_id: body.exchange,
          uid: body.uid,
          ref_code: body.refCode,
          status: 'review_pending'
        })
        .select('id, status')
        .single()

      if (createError) {
        console.error('Create error:', createError)
        return new Response(
          JSON.stringify({ error: 'CREATE_FAILED', message: 'Failed to create application' }),
          { 
            status: 500, 
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          id: application.id, 
          status: application.status,
          message: 'Application created successfully'
        }),
        { 
          status: 201, 
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        }
      )
    }

    if (req.method === 'GET') {
      // Get user's applications
      const { data: applications, error: fetchError } = await supabaseClient
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Fetch error:', fetchError)
        return new Response(
          JSON.stringify({ error: 'FETCH_FAILED', message: 'Failed to fetch applications' }),
          { 
            status: 500, 
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          }
        )
      }

      return new Response(
        JSON.stringify({ applications }),
        { 
          status: 200, 
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      }
    )
  }
})