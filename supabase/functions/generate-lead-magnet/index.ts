import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadMagnetInput {
  locale: 'ko' | 'en';
  target_audience: string;
  lead_goal: 'email' | 'telegram' | 'phone' | 'form';
  topic: string;
  format: 'pdf_report' | 'checklist' | 'quiz' | 'workbook' | 'infographic';
  depth: 'lite' | 'standard' | 'pro';
  brand: {
    partner_name: string;
    primary_color: string;
    logo_url: string;
  };
  compliance: {
    disclaimers_required: boolean;
    jurisdiction: 'KR' | 'US' | 'EU' | 'GLOBAL';
  };
  ab_test: boolean;
  length_pages: number;
}

interface LeadMagnetOutput {
  meta: {
    title: string;
    locale: string;
    topic: string;
    format: string;
    lead_goal: string;
    ab_test: boolean;
    created_at: string;
  };
  copy: {
    headline_variants: string[];
    subheadline: string;
    cta_variants: string[];
    gating_copy: string;
    benefit_bullets: string[];
  };
  document: {
    markdown: string;
  };
  design: {
    brand_color: string;
    accent_color: string;
    font_stack: string[];
    layout_notes: string;
  };
  assets: {
    outline: string[];
    quiz_or_checklist: {
      items: string[];
      scoring_or_key: string;
    };
    disclaimers: string[];
  };
  validation: {
    gates_present: boolean;
    cta_present: boolean;
    placeholders_present: boolean;
    compliance_notes: string;
  };
  diagnostics: {
    warnings: string[];
    suggested_inputs: string[];
  };
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

    const input: LeadMagnetInput = await req.json();
    console.log('Lead magnet generation request:', input);

    // System prompt for LeadMagnet-Writer
    const systemPrompt = `You are "LeadMagnet-Writer", an AI marketing assistant for CoinToss partners.
Your single purpose is to generate HIGH-CONVERTING lead magnets that capture contact info
(e.g., email, Telegram, phone) BEFORE delivering premium content.

Always:
- Optimize for conversion (clear value, scarcity, credibility).
- Write concise, scannable, design-ready copy (headlines, bullets, short paragraphs).
- Include explicit lead-capture CTAs and gating copy.
- Brand the output with partner name/logo placeholders.
- Produce layout-ready Markdown that can be rendered to PDF or web components.
- Respect locale: write in the language requested (default: Korean).
- Never fabricate legal/financial claims; add safety notes where needed.
- Keep markdown semantic (H1~H4, lists, tables if needed) and avoid overly long sentences.`;

    const developerPrompt = `- You must strictly return a single JSON object that matches the Output Schema below.
- The "document.markdown" field must be valid UTF-8 Markdown without extraneous JSON.
- Keep all numeric values or KPIs as ranges or examples unless provided by the user.
- Placeholders: use {{PARTNER_NAME}}, {{PARTNER_LOGO_URL}}, {{CAPTURE_FORM_URL}}, {{BRAND_COLOR}}.
- Include a "gating" section that explicitly instructs to collect leads BEFORE download/view.
- Provide 3 headline variants and 2 CTA variants for A/B tests.
- Include a compact design spec for PDF (colors, spacing, font suggestions) in "design".
- For quizzes/checklists, include answer key or scoring rubric in "assets".
- Comply with "validation" rules and set "diagnostics" with warnings if inputs are weak.`;

    const userPrompt = JSON.stringify(input);

    // Call OpenAI API
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
        max_tokens: 4000,
        top_p: 0.9,
        presence_penalty: 0.1,
        frequency_penalty: 0.2
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Parse the JSON response
    let leadMagnetData: LeadMagnetOutput;
    try {
      leadMagnetData = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', generatedContent);
      throw new Error('Invalid JSON response from AI');
    }

    // Save to database
    const { data: savedMagnet, error: saveError } = await supabaseClient
      .from('lead_magnets')
      .insert({
        user_id: user.id,
        title: leadMagnetData.meta.title,
        topic: input.topic,
        format: input.format,
        target_audience: input.target_audience,
        lead_goal: input.lead_goal,
        depth: input.depth,
        locale: input.locale,
        content_json: leadMagnetData,
        brand_settings: input.brand,
        compliance_settings: input.compliance,
        status: 'draft'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Database save error:', saveError);
      throw new Error('Failed to save lead magnet');
    }

    console.log('Lead magnet generated successfully:', savedMagnet.id);

    return new Response(JSON.stringify({
      success: true,
      data: leadMagnetData,
      magnet_id: savedMagnet.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-lead-magnet function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});