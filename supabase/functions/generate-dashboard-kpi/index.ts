import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DashboardKPIInput {
  locale: 'ko' | 'en';
  period: 'last_7d' | 'last_30d' | 'custom';
  filters: { 
    exchanges: string[];
    mode: 'basic' | 'approved' | 'all';
  };
  metrics: {
    earnings: Array<{date: string; amount: number; currency: string}>;
    uids: {total: number; pending: number; approved: number; rejected: number};
    clicks: {total: number; unique: number};
    conversions: {signups: number; rate: number};
  };
}

interface DashboardKPIOutput {
  cards: Array<{label: string; value: string; delta?: string}>;
  insights: string[];
  next_best_actions: Array<{label: string; link: string}>;
  diagnostics: {warnings: string[]};
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const input: DashboardKPIInput = await req.json();
    console.log('Dashboard KPI generation request:', input);

    const systemPrompt = `You are an AI assistant embedded in CoinToss. 
Return ONLY valid JSON matching the requested Output Schema.
Language defaults to Korean unless "locale" says otherwise.
Never invent financial promises. Include compliance notes when needed.
Use placeholders {{...}} when values are not provided by the caller.
Keep copy concise, scannable, and implementation-ready.

You summarize multi-exchange partner KPIs for the dashboard: 
top-line cards, trends, anomalies, and next best actions.`;

    const developerPrompt = `- Always return a single JSON object per request.
- All text must be UTF-8. No markdown unless explicitly required by schema.
- For URL fields, return absolute URLs or {{PLACEHOLDER_URL}}.
- Include "diagnostics" with warnings or improvement tips if inputs are weak.`;

    const userPrompt = JSON.stringify(input);

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
          { role: 'system', content: developerPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.6,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    let kpiData: DashboardKPIOutput;
    try {
      kpiData = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', generatedContent);
      throw new Error('Invalid JSON response from AI');
    }

    console.log('Dashboard KPI generated successfully');

    return new Response(JSON.stringify({
      success: true,
      data: kpiData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-dashboard-kpi function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});