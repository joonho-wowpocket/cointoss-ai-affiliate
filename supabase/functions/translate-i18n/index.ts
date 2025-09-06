import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const { sourceFile, targetLanguages, messages } = await req.json()
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not found in environment variables')
    }

    const languageNames = {
      ko: 'Korean (한국어)',
      ja: 'Japanese (日本語)', 
      id: 'Indonesian (Bahasa Indonesia)',
      vi: 'Vietnamese (Tiếng Việt)',
      en: 'English'
    }

    const translations: Record<string, any> = {}

    for (const targetLang of targetLanguages) {
      const langName = languageNames[targetLang as keyof typeof languageNames] || targetLang
      
      const prompt = `You are a professional translator for a fintech/crypto SaaS platform called CoinToss.

CONTEXT: CoinToss is a crypto referral platform that helps partners earn commissions through exchange referrals and AI automation.

TASK: Translate the following JSON values from English to ${langName}.

RULES:
1. Keep JSON structure and keys identical
2. Preserve ALL placeholders like {user}, {amount}, {percentage}, {count}, {tier} - DO NOT translate them
3. Keep UI labels concise (1-3 words for buttons/navigation)
4. Use professional, trustworthy tone appropriate for financial services
5. For technical terms, use commonly accepted translations in the crypto/fintech industry
6. If uncertain about translation, return "__MISSING__" for that value
7. Output ONLY valid JSON (no commentary, no markdown)

JSON to translate:
${JSON.stringify(messages, null, 2)}`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content: 'You are a professional translator. Output only valid JSON. Never include comments or markdown.'
            },
            {
              role: 'user', 
              content: prompt
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      const translatedText = result.choices?.[0]?.message?.content?.trim()
      
      if (!translatedText) {
        throw new Error(`Empty response from OpenAI for language: ${targetLang}`)
      }

      try {
        // Try to parse JSON, handling potential markdown wrapping
        let jsonText = translatedText
        const match = translatedText.match(/```json\s*([\s\S]*?)\s*```/i) || translatedText.match(/```\s*([\s\S]*?)\s*```/)
        if (match) {
          jsonText = match[1]
        }
        
        translations[targetLang] = JSON.parse(jsonText)
      } catch (parseError) {
        console.error(`Failed to parse translation for ${targetLang}:`, translatedText)
        throw new Error(`Failed to parse translation for ${targetLang}: ${parseError.message}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          sourceFile,
          translations,
          generatedAt: new Date().toISOString()
        }
      }),
      {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
        },
      },
    )
  } catch (error) {
    console.error('Translation error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
        },
      },
    )
  }
})