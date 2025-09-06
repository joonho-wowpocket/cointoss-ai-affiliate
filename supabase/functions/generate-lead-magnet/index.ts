import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadMagnetRequest {
  partnerId: string;
  magnetType: "pdf" | "quiz" | "gated";
  topic: string;
  targetAudience: string;
  branding: {
    logoUrl?: string;
    colorScheme?: string;
    partnerName: string;
  };
  language: "ko" | "en" | "ja" | "id" | "vi";
  leadCapture: {
    type: "email" | "telegram";
    required: boolean;
  };
  leadGoal: string;
  depth: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      partnerId, 
      magnetType, 
      topic, 
      targetAudience, 
      branding, 
      language,
      leadCapture,
      leadGoal,
      depth 
    }: LeadMagnetRequest = await req.json();

    console.log('Generating lead magnet for:', { partnerId, magnetType, topic, targetAudience });

    // Create AI prompts based on magnet type and language
    const prompts = {
      ko: {
        pdf: `${topic}에 대한 전문적인 PDF 리포트를 생성해주세요. 대상 고객: ${targetAudience}. 스타일: 명확하고 신뢰할 수 있으며 실행 가능한 내용. 포함할 내용: 3-5개의 핵심 인사이트, 통계 데이터, 실용적인 조언. 암호화폐 투자 조언은 피하고 교육적 내용에 집중해주세요.`,
        quiz: `${targetAudience}를 위한 "${topic}" 관련 interactive 퀴즈를 만들어주세요. 5-7개의 질문으로 구성하고, 각 질문마다 3-4개의 선택지를 제공하세요. 결과는 사용자의 성향이나 지식 수준을 분석해주는 형태로 작성해주세요.`,
        gated: `${topic}에 대한 독점적인 분석 리포트를 작성해주세요. 대상: ${targetAudience}. 이메일 제공 후 접근 가능한 고품질 콘텐츠로 제작해주세요. 5-7개 섹션으로 구성하고 각 섹션마다 핵심 인사이트를 제공해주세요.`
      },
      en: {
        pdf: `Generate a professional PDF report about ${topic} for ${targetAudience}. Style: Clear, credible, and actionable content. Include: 3-5 key insights, statistics, and practical advice. Avoid investment advice and focus on educational content.`,
        quiz: `Create an interactive quiz about "${topic}" for ${targetAudience}. Structure with 5-7 questions, each with 3-4 answer choices. Results should analyze user's knowledge level or trading style.`,
        gated: `Write an exclusive analysis report about ${topic} for ${targetAudience}. This should be high-value content accessible after email capture. Structure in 5-7 sections with key insights in each.`
      },
      ja: {
        pdf: `${targetAudience}向けの${topic}に関する専門的なPDFレポートを生成してください。スタイル：明確で信頼性があり実行可能な内容。含める内容：3-5の主要な洞察、統計データ、実用的なアドバイス。投資アドバイスは避け、教育的な内容に焦点を当ててください。`,
        quiz: `${targetAudience}向けの「${topic}」に関するインタラクティブクイズを作成してください。5-7の質問で構成し、各質問に3-4の選択肢を提供してください。結果はユーザーの知識レベルや取引スタイルを分析する形式で作成してください。`,
        gated: `${targetAudience}向けの${topic}に関する独占分析レポートを作成してください。メール提供後にアクセス可能な高価値コンテンツとして制作してください。5-7セクションで構成し、各セクションに主要な洞察を提供してください。`
      },
      id: {
        pdf: `Buat laporan PDF profesional tentang ${topic} untuk ${targetAudience}. Gaya: Konten yang jelas, kredibel, dan dapat ditindaklanjuti. Sertakan: 3-5 wawasan utama, statistik, dan saran praktis. Hindari saran investasi dan fokus pada konten edukatif.`,
        quiz: `Buat kuis interaktif tentang "${topic}" untuk ${targetAudience}. Struktur dengan 5-7 pertanyaan, masing-masing dengan 3-4 pilihan jawaban. Hasil harus menganalisis tingkat pengetahuan atau gaya trading pengguna.`,
        gated: `Tulis laporan analisis eksklusif tentang ${topic} untuk ${targetAudience}. Ini harus berupa konten bernilai tinggi yang dapat diakses setelah email ditangkap. Struktur dalam 5-7 bagian dengan wawasan utama di setiap bagian.`
      },
      vi: {
        pdf: `Tạo báo cáo PDF chuyên nghiệp về ${topic} cho ${targetAudience}. Phong cách: Nội dung rõ ràng, đáng tin cậy và có thể thực hiện được. Bao gồm: 3-5 thông tin quan trọng, thống kê và lời khuyên thực tế. Tránh lời khuyên đầu tư và tập trung vào nội dung giáo dục.`,
        quiz: `Tạo câu đố tương tác về "${topic}" cho ${targetAudience}. Cấu trúc với 5-7 câu hỏi, mỗi câu có 3-4 lựa chọn trả lời. Kết quả nên phân tích mức độ kiến thức hoặc phong cách giao dịch của người dùng.`,
        gated: `Viết báo cáo phân tích độc quyền về ${topic} cho ${targetAudience}. Đây phải là nội dung có giá trị cao có thể truy cập sau khi thu thập email. Cấu trúc trong 5-7 phần với những hiểu biết quan trọng trong mỗi phần.`
      }
    };

    const prompt = prompts[language as keyof typeof prompts][magnetType];

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are a professional content creator for crypto education. Generate ${magnetType === 'quiz' ? 'structured JSON' : 'well-formatted'} content that is educational and compliant. Never provide investment advice. Always include clear disclaimers about crypto risks.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    const generatedContent = openAIData.choices[0].message.content;

    console.log('Generated content length:', generatedContent.length);

    // Process content based on type
    let contentJson = {};
    let title = `${topic} - ${branding.partnerName}`;

    if (magnetType === 'quiz') {
      try {
        // Try to parse as JSON for quiz
        contentJson = JSON.parse(generatedContent);
      } catch {
        // If not valid JSON, structure it
        contentJson = {
          title: title,
          description: `Interactive quiz about ${topic}`,
          questions: [
            {
              question: generatedContent.split('\n')[0] || 'Sample question',
              options: ['Option 1', 'Option 2', 'Option 3'],
              correct: 0
            }
          ]
        };
      }
    } else {
      contentJson = {
        title: title,
        content: generatedContent,
        sections: generatedContent.split('\n\n').filter(section => section.trim()),
        type: magnetType
      };
    }

    // Save to database
    const { data: leadMagnet, error: insertError } = await supabase
      .from('lead_magnets')
      .insert({
        user_id: partnerId,
        title: title,
        topic: topic,
        target_audience: targetAudience,
        lead_goal: leadGoal,
        depth: depth,
        format: magnetType,
        locale: language,
        content_json: contentJson,
        brand_settings: branding,
        compliance_settings: {
          disclaimer_enabled: true,
          risk_warning: true,
          educational_only: true
        },
        status: 'published'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error(`Failed to save lead magnet: ${insertError.message}`);
    }

    console.log('Lead magnet created successfully:', leadMagnet.id);

    return new Response(
      JSON.stringify({
        success: true,
        leadMagnetId: leadMagnet.id,
        title: title,
        content: contentJson,
        publicUrl: `${Deno.env.get('SUPABASE_URL')}/lead-magnet/${leadMagnet.id}`,
        downloadUrl: magnetType === 'pdf' ? `/api/generate-pdf/${leadMagnet.id}` : null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-lead-magnet function:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate lead magnet',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});