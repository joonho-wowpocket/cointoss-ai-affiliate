import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AI Agent System Prompts
const AGENT_PROMPTS = {
  CREA: `You are Crea, a content manager for crypto partners at CoinToss. 
- Output short, localized, compliance-safe content
- No financial guarantees or "sure profit" claims
- Focus on educational and informational content
- Keep responses under 200 characters for social posts
- Always include relevant hashtags (max 3)
- Maintain professional, premium tone`,

  DANNY: `You are Danny, a data analyst for crypto partners.
- Segment customers into VIP/Dormant/New categories
- Output JSON arrays and structured data only
- Focus on actionable insights
- Identify high-value patterns in customer behavior
- Suggest data-driven recommendations`,

  RAY: `You are Ray, an executive assistant and AI team orchestrator.
- Return checklists and next actions
- Coordinate between team members
- Summarize daily activities and progress
- Create structured task lists
- Focus on productivity and workflow optimization`,

  LEO: `You are Leo, a market strategist for crypto trading.
- Provide market pulse in bullet points (max 6)
- Focus on actionable strategic insights
- Analyze risk vs opportunity
- Suggest priority exchanges or campaigns
- Keep insights concise and timely`,

  ALPHA: `You are Alpha, an opportunity scout for growth.
- Rank opportunities by ROI and urgency
- Monitor new coins, airdrops, and promotional events
- Filter noise and prioritize high-value opportunities
- Provide clear opportunity summaries
- Focus on growth potential and market timing`,

  GUARDIAN: `You are Guardian, a compliance officer for financial content.
- Flag risky phrases and provide compliant alternatives
- Return compliance score (0-100), issues list, and fixed text
- Ensure regulatory compliance for Korean and international markets
- Replace claims like "guaranteed profit" with compliant language
- Focus on risk disclosure and educational framing`
};

async function runAgent(agent: string, taskName: string, input: any): Promise<any> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = AGENT_PROMPTS[agent as keyof typeof AGENT_PROMPTS];
  if (!systemPrompt) {
    throw new Error(`Unknown agent: ${agent}`);
  }

  let userPrompt = '';

  // Agent-specific task handling
  switch (agent) {
    case 'CREA':
      if (taskName === 'generate_social_post') {
        userPrompt = `Market Signal: ${input.signal || 'General crypto content'}
Template: ${input.template || 'short_tweet'}
Brand: ${input.branding || 'CoinToss Partner'}
Platform: ${input.platform || 'Twitter'}

Generate a social media post with:
- Compelling hook
- Key market insight
- Call to action
- Appropriate hashtags
- Professional tone`;
      } else if (taskName === 'schedule_post') {
        userPrompt = `Create a scheduled post for: ${JSON.stringify(input)}`;
      } else if (taskName === 'transform_signal_to_content') {
        userPrompt = `Transform this market signal into content: ${JSON.stringify(input)}`;
      }
      break;

    case 'DANNY':
      if (taskName === 'find_dormant') {
        userPrompt = `Analyze customer activity for dormant users over ${input.days || 21} days.
Return JSON format with dormant user categories and reactivation suggestions.`;
      } else if (taskName === 'segment_customers') {
        userPrompt = `Segment customers based on: ${JSON.stringify(input)}
Return structured segments with characteristics and recommendations.`;
      } else if (taskName === 'suggest_reactivation') {
        userPrompt = `Create reactivation strategy for: ${JSON.stringify(input)}`;
      }
      break;

    case 'RAY':
      if (taskName === 'create_pipeline') {
        userPrompt = `Create workflow pipeline: ${JSON.stringify(input)}
Return structured task sequence with dependencies.`;
      } else if (taskName === 'summarize_daily') {
        userPrompt = `Summarize daily AI team activities: ${JSON.stringify(input)}`;
      } else if (taskName === 'dispatch_tasks') {
        userPrompt = `Coordinate task dispatch: ${JSON.stringify(input)}`;
      }
      break;

    case 'LEO':
      if (taskName === 'market_pulse') {
        userPrompt = `Generate market pulse report with current crypto trends.
Include 4-6 bullet points covering major movements, risks, and opportunities.`;
      } else if (taskName === 'risk_brief') {
        userPrompt = `Create risk assessment brief: ${JSON.stringify(input)}`;
      } else if (taskName === 'exchange_priority') {
        userPrompt = `Analyze exchange priorities: ${JSON.stringify(input)}`;
      }
      break;

    case 'ALPHA':
      if (taskName === 'scan_opportunities') {
        userPrompt = `Scan for new crypto opportunities including airdrops, new listings, and promotional events.
Rank by ROI potential and provide actionable insights.`;
      } else if (taskName === 'rank_airdrops') {
        userPrompt = `Rank airdrop opportunities: ${JSON.stringify(input)}`;
      } else if (taskName === 'event_alert') {
        userPrompt = `Generate event alert: ${JSON.stringify(input)}`;
      }
      break;

    case 'GUARDIAN':
      if (taskName === 'review_content') {
        userPrompt = `Review this content for compliance:
"${input.content}"

Return JSON with:
- score (0-100)
- issues array with {rule, fix} objects
- fixedText (compliant version)`;
      } else if (taskName === 'score_compliance') {
        userPrompt = `Score compliance for: ${JSON.stringify(input)}`;
      } else if (taskName === 'fix_risky_phrases') {
        userPrompt = `Fix risky phrases in: ${JSON.stringify(input)}`;
      }
      break;

    default:
      throw new Error(`Unsupported task: ${taskName} for agent: ${agent}`);
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_completion_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const generatedText = data.choices[0].message.content;

  // Parse JSON responses for certain agents
  if (agent === 'DANNY' || agent === 'GUARDIAN') {
    try {
      return JSON.parse(generatedText);
    } catch {
      return { content: generatedText };
    }
  }

  return { content: generatedText };
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

    const url = new URL(req.url);
    const taskId = url.searchParams.get('taskId');

    if (!taskId) {
      return new Response(JSON.stringify({ error: 'Task ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get task from database
    const { data: task, error: taskError } = await supabaseClient
      .from('ai_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single();

    if (taskError || !task) {
      return new Response(JSON.stringify({ error: 'Task not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (task.status !== 'QUEUED') {
      return new Response(JSON.stringify({ error: 'Task already processed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update task status to RUNNING
    await supabaseClient
      .from('ai_tasks')
      .update({ 
        status: 'RUNNING', 
        started_at: new Date().toISOString() 
      })
      .eq('id', taskId);

    try {
      // Run the AI agent
      const result = await runAgent(task.agent, task.name, task.input);

      // Update task with success
      await supabaseClient
        .from('ai_tasks')
        .update({
          status: 'SUCCEEDED',
          output: result,
          finished_at: new Date().toISOString()
        })
        .eq('id', taskId);

      return new Response(JSON.stringify({
        success: true,
        taskId: taskId,
        output: result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (agentError: any) {
      // Update task with failure
      await supabaseClient
        .from('ai_tasks')
        .update({
          status: 'FAILED',
          error_code: 'AGENT_ERROR',
          error_message: agentError.message,
          finished_at: new Date().toISOString()
        })
        .eq('id', taskId);

      return new Response(JSON.stringify({
        success: false,
        error: agentError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error: any) {
    console.error('Error in ai-agents function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});