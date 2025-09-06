import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PartnerHubInput {
  locale: 'ko' | 'en';
  tab: 'basic' | 'approved';
  exchanges: Array<{
    code: string;
    name: string;
    base_rate: string;
    approved_rate: string;
    state: 'NotApplied' | 'Applied' | 'Approved' | 'Rejected';
  }>;
}

interface PartnerHubOutput {
  cards: Array<{
    exchange: string;
    rate_display: string;
    state_badge: string;
    ctas: Array<{
      label: string;
      action: string;
      payload: Record<string, any>;
    }>;
    nudge?: string;
  }>;
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

    const input: PartnerHubInput = await req.json();
    console.log('Partner Hub generation request:', input);

    const systemPrompt = `You are an AI assistant embedded in CoinToss. 
Return ONLY valid JSON matching the requested Output Schema.
Language defaults to Korean unless "locale" says otherwise.
Never invent financial promises. Include compliance notes when needed.
Use placeholders {{...}} when values are not provided by the caller.
Keep copy concise, scannable, and implementation-ready.

Generate exchange list cards for Partner Hub with Basic/Approved tabs, 
showing rates, state badges, and CTAs.`;

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

    let hubData: PartnerHubOutput;
    try {
      hubData = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', generatedContent);
      throw new Error('Invalid JSON response from AI');
    }

    console.log('Partner Hub generated successfully');

    return new Response(JSON.stringify({
      success: true,
      data: hubData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-partner-hub function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});