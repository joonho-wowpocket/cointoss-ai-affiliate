import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Download, Eye, FileText, CheckSquare, HelpCircle, BookOpen, BarChart3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface LeadMagnetForm {
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

const formatIcons = {
  pdf_report: FileText,
  checklist: CheckSquare,
  quiz: HelpCircle,
  workbook: BookOpen,
  infographic: BarChart3,
};

export const LeadMagnetGenerator = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatedMagnet, setGeneratedMagnet] = useState<LeadMagnetOutput | null>(null);
  const [magnetId, setMagnetId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LeadMagnetForm>({
    locale: 'ko',
    target_audience: '',
    lead_goal: 'email',
    topic: '',
    format: 'pdf_report',
    depth: 'standard',
    brand: {
      partner_name: '',
      primary_color: '#FFD400',
      logo_url: '',
    },
    compliance: {
      disclaimers_required: true,
      jurisdiction: 'KR',
    },
    ab_test: true,
    length_pages: 3,
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof LeadMagnetForm] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const generateLeadMagnet = async () => {
    if (!formData.topic || !formData.target_audience || !formData.brand.partner_name) {
      toast({
        title: "입력 확인",
        description: "주제, 타겟 고객, 파트너명을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-lead-magnet', {
        body: formData,
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedMagnet(data.data);
        setMagnetId(data.magnet_id);
        toast({
          title: "리드마그넷 생성 완료",
          description: "성공적으로 생성되었습니다!",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('리드마그넷 생성 오류:', error);
      toast({
        title: "생성 실패",
        description: error.message || "리드마그넷 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadAsPDF = async () => {
    if (!generatedMagnet) return;

    try {
      const element = document.getElementById('magnet-content');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${generatedMagnet.meta.title}.pdf`);

      toast({
        title: "PDF 다운로드 완료",
        description: "리드마그넷이 PDF로 저장되었습니다.",
      });
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      toast({
        title: "PDF 생성 실패",
        description: "PDF 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            리드마그넷 생성기
          </CardTitle>
          <CardDescription>
            AI 기반 리드마그넷을 생성하여 고객 정보를 수집하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="topic">주제*</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => handleInputChange('topic', e.target.value)}
                placeholder="예: 초보자를 위한 위험관리 7가지"
              />
            </div>
            <div>
              <Label htmlFor="target_audience">타겟 고객*</Label>
              <Input
                id="target_audience"
                value={formData.target_audience}
                onChange={(e) => handleInputChange('target_audience', e.target.value)}
                placeholder="예: 코인 선물거래 초보자"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="format">형식</Label>
              <Select value={formData.format} onValueChange={(value: any) => handleInputChange('format', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf_report">PDF 리포트</SelectItem>
                  <SelectItem value="checklist">체크리스트</SelectItem>
                  <SelectItem value="quiz">퀴즈</SelectItem>
                  <SelectItem value="workbook">워크북</SelectItem>
                  <SelectItem value="infographic">인포그래픽</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lead_goal">수집 목표</Label>
              <Select value={formData.lead_goal} onValueChange={(value: any) => handleInputChange('lead_goal', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">이메일</SelectItem>
                  <SelectItem value="telegram">텔레그램</SelectItem>
                  <SelectItem value="phone">전화번호</SelectItem>
                  <SelectItem value="form">종합 폼</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="depth">난이도</Label>
              <Select value={formData.depth} onValueChange={(value: any) => handleInputChange('depth', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lite">기초</SelectItem>
                  <SelectItem value="standard">표준</SelectItem>
                  <SelectItem value="pro">전문가</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">브랜드 설정</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partner_name">파트너명*</Label>
                <Input
                  id="partner_name"
                  value={formData.brand.partner_name}
                  onChange={(e) => handleInputChange('brand.partner_name', e.target.value)}
                  placeholder="예: Alpha Trader"
                />
              </div>
              <div>
                <Label htmlFor="primary_color">브랜드 색상</Label>
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.brand.primary_color}
                  onChange={(e) => handleInputChange('brand.primary_color', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="logo_url">로고 URL (선택)</Label>
              <Input
                id="logo_url"
                value={formData.brand.logo_url}
                onChange={(e) => handleInputChange('brand.logo_url', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ab_test"
              checked={formData.ab_test}
              onCheckedChange={(checked: boolean) => handleInputChange('ab_test', checked)}
            />
            <Label htmlFor="ab_test">A/B 테스트 변형 생성</Label>
          </div>

          <Button 
            onClick={generateLeadMagnet} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                생성 중...
              </>
            ) : (
              '리드마그넷 생성하기'
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedMagnet && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{generatedMagnet.meta.title}</CardTitle>
                <CardDescription>
                  {generatedMagnet.copy.subheadline}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  미리보기
                </Button>
                <Button onClick={downloadAsPDF} size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  PDF 다운로드
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Headlines A/B Test Variants */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">헤드라인 변형 (A/B 테스트용)</h4>
              <div className="grid gap-2">
                {generatedMagnet.copy.headline_variants.map((headline, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">변형 {index + 1}: </span>
                    <span className="font-medium">{headline}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Variants */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">CTA 변형</h4>
              <div className="flex gap-2">
                {generatedMagnet.copy.cta_variants.map((cta, index) => (
                  <Button key={index} variant="outline" size="sm">
                    {cta}
                  </Button>
                ))}
              </div>
            </div>

            {/* Document Content */}
            <div id="magnet-content" className="bg-white p-6 rounded-lg border">
              <div className="prose max-w-none">
                <ReactMarkdown>
                  {generatedMagnet.document.markdown}
                </ReactMarkdown>
              </div>
            </div>

            {/* Diagnostics */}
            {generatedMagnet.diagnostics.warnings.length > 0 && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-amber-800 mb-2">주의사항</h4>
                <ul className="list-disc list-inside space-y-1 text-amber-700">
                  {generatedMagnet.diagnostics.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};