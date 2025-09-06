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

    const method = req.method;
    const url = new URL(req.url);
    const pathname = url.pathname;

    // GET /ai-tasks - List user's AI tasks
    if (method === 'GET' && pathname.includes('/ai-tasks')) {
      const agent = url.searchParams.get('agent');
      const status = url.searchParams.get('status');
      const limit = parseInt(url.searchParams.get('limit') || '50');

      let query = supabaseClient
        .from('ai_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (agent) {
        query = query.eq('agent', agent);
      }
      if (status) {
        query = query.eq('status', status);
      }

      const { data: tasks, error } = await query;

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({
        success: true,
        data: tasks
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /ai-tasks - Create new AI task
    if (method === 'POST' && pathname.includes('/ai-tasks')) {
      const body = await req.json();
      const { agent, name, input = {}, correlationId } = body;

      if (!agent || !name) {
        return new Response(JSON.stringify({
          error: 'Agent and task name are required'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Validate agent
      const validAgents = ['CREA', 'DANNY', 'RAY', 'LEO', 'ALPHA', 'GUARDIAN'];
      if (!validAgents.includes(agent)) {
        return new Response(JSON.stringify({
          error: 'Invalid agent'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create task
      const { data: task, error } = await supabaseClient
        .from('ai_tasks')
        .insert({
          user_id: user.id,
          agent,
          name,
          input,
          correlation_id: correlationId,
          status: 'QUEUED'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Trigger agent processing (async)
      const agentUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-agents?taskId=${task.id}`;
      fetch(agentUrl, {
        method: 'POST',
        headers: {
          'Authorization': req.headers.get('Authorization')!,
          'Content-Type': 'application/json'
        }
      }).catch(err => {
        console.error('Failed to trigger agent:', err);
      });

      return new Response(JSON.stringify({
        success: true,
        data: {
          id: task.id,
          status: task.status,
          agent: task.agent,
          name: task.name
        }
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /ai-tasks/:id - Get specific task
    if (method === 'GET' && pathname.match(/\/ai-tasks\/[^/]+$/)) {
      const taskId = pathname.split('/').pop();

      const { data: task, error } = await supabaseClient
        .from('ai_tasks')
        .select('*')
        .eq('id', taskId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        return new Response(JSON.stringify({
          error: 'Task not found'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        data: task
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /ai-tasks/:id - Cancel task
    if (method === 'DELETE' && pathname.match(/\/ai-tasks\/[^/]+$/)) {
      const taskId = pathname.split('/').pop();

      const { data: task, error: fetchError } = await supabaseClient
        .from('ai_tasks')
        .select('status')
        .eq('id', taskId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !task) {
        return new Response(JSON.stringify({
          error: 'Task not found'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (task.status !== 'QUEUED' && task.status !== 'RUNNING') {
        return new Response(JSON.stringify({
          error: 'Task cannot be cancelled'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabaseClient
        .from('ai_tasks')
        .update({
          status: 'CANCELED',
          finished_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Task cancelled'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      error: 'Not found'
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in ai-tasks function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});