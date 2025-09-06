import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function executePipelineStep(
  supabaseClient: any,
  userId: string,
  step: any,
  pipelineContext: any,
  stepResults: any[],
  authorization: string
) {
  let stepInput = step.input || {};

  // Process inputFrom references
  if (step.inputFrom) {
    if (step.inputFrom.startsWith('$step[')) {
      // Extract from previous step result
      const match = step.inputFrom.match(/\$step\[(\d+)\]\.(.+)/);
      if (match) {
        const stepIndex = parseInt(match[1]);
        const path = match[2];
        if (stepResults[stepIndex]) {
          stepInput = { ...stepInput, ...getNestedValue(stepResults[stepIndex], path) };
        }
      }
    } else if (step.inputFrom.startsWith('$pipeline.context')) {
      // Extract from pipeline context
      const path = step.inputFrom.replace('$pipeline.context.', '');
      stepInput = { ...stepInput, ...getNestedValue(pipelineContext, path) };
    }
  }

  // Create task for this step
  const { data: task, error } = await supabaseClient
    .from('ai_tasks')
    .insert({
      user_id: userId,
      agent: step.agent,
      name: step.name,
      input: stepInput,
      status: 'QUEUED'
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Execute the task
  const agentUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-agents?taskId=${task.id}`;
  const response = await fetch(agentUrl, {
    method: 'POST',
    headers: {
      'Authorization': authorization,
      'Content-Type': 'application/json'
    }
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(`Step ${step.name} failed: ${result.error}`);
  }

  return result.output;
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

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

    // GET /ai-pipelines - List user's pipelines
    if (method === 'GET' && pathname.includes('/ai-pipelines')) {
      const status = url.searchParams.get('status');
      const limit = parseInt(url.searchParams.get('limit') || '20');

      let query = supabaseClient
        .from('ai_pipelines')
        .select(`
          *,
          ai_tasks(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (status) {
        query = query.eq('status', status);
      }

      const { data: pipelines, error } = await query;

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({
        success: true,
        data: pipelines
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /ai-pipelines - Create new pipeline
    if (method === 'POST' && pathname.includes('/ai-pipelines')) {
      const body = await req.json();
      const { name, context = {}, steps } = body;

      if (!name || !steps || !Array.isArray(steps)) {
        return new Response(JSON.stringify({
          error: 'Name and steps are required'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create pipeline
      const { data: pipeline, error } = await supabaseClient
        .from('ai_pipelines')
        .insert({
          user_id: user.id,
          name,
          context,
          status: 'PENDING'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Execute pipeline steps asynchronously
      (async () => {
        try {
          await supabaseClient
            .from('ai_pipelines')
            .update({ status: 'RUNNING' })
            .eq('id', pipeline.id);

          const stepResults: any[] = [];
          
          for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const result = await executePipelineStep(
              supabaseClient,
              user.id,
              step,
              context,
              stepResults,
              req.headers.get('Authorization')!
            );
            stepResults.push(result);
          }

          await supabaseClient
            .from('ai_pipelines')
            .update({ 
              status: 'SUCCEEDED',
              context: { ...context, results: stepResults }
            })
            .eq('id', pipeline.id);

        } catch (pipelineError: any) {
          await supabaseClient
            .from('ai_pipelines')
            .update({ 
              status: 'FAILED',
              context: { ...context, error: pipelineError.message }
            })
            .eq('id', pipeline.id);
        }
      })().catch(console.error);

      return new Response(JSON.stringify({
        success: true,
        data: {
          id: pipeline.id,
          status: 'RUNNING',
          name: pipeline.name
        }
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /ai-pipelines/:id - Get specific pipeline
    if (method === 'GET' && pathname.match(/\/ai-pipelines\/[^/]+$/)) {
      const pipelineId = pathname.split('/').pop();

      const { data: pipeline, error } = await supabaseClient
        .from('ai_pipelines')
        .select(`
          *,
          ai_tasks(*)
        `)
        .eq('id', pipelineId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        return new Response(JSON.stringify({
          error: 'Pipeline not found'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        data: pipeline
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /ai-pipelines/:id/cancel - Cancel pipeline
    if (method === 'POST' && pathname.match(/\/ai-pipelines\/[^/]+\/cancel$/)) {
      const pipelineId = pathname.split('/')[pathname.split('/').length - 2];

      const { data: pipeline, error: fetchError } = await supabaseClient
        .from('ai_pipelines')
        .select('status')
        .eq('id', pipelineId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !pipeline) {
        return new Response(JSON.stringify({
          error: 'Pipeline not found'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (pipeline.status !== 'PENDING' && pipeline.status !== 'RUNNING') {
        return new Response(JSON.stringify({
          error: 'Pipeline cannot be cancelled'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabaseClient
        .from('ai_pipelines')
        .update({
          status: 'FAILED'
        })
        .eq('id', pipelineId);

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Pipeline cancelled'
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
    console.error('Error in ai-pipelines function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});