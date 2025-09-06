import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, FileText, HelpCircle, Lock, Download, Eye, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LeadMagnetForm {
  magnetType: 'pdf' | 'quiz' | 'gated';
  topic: string;
  targetAudience: string;
  leadGoal: string;
  depth: string;
  partnerName: string;
  colorScheme: string;
  leadCaptureType: 'email' | 'telegram';
  language: 'ko' | 'en' | 'ja' | 'id' | 'vi';
}

interface GeneratedMagnet {
  leadMagnetId: string;
  title: string;
  content: any;
  publicUrl: string;
  downloadUrl?: string;
}

export function LeadMagnetGenerator() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMagnet, setGeneratedMagnet] = useState<GeneratedMagnet | null>(null);
  const [form, setForm] = useState<LeadMagnetForm>({
    magnetType: 'pdf',
    topic: '',
    targetAudience: '',
    leadGoal: '',
    depth: '',
    partnerName: '',
    colorScheme: '#3b82f6',
    leadCaptureType: 'email',
    language: 'ko'
  });

  const handleInputChange = (field: keyof LeadMagnetForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    if (!form.topic || !form.targetAudience || !form.partnerName) {
      toast.error('모든 필수 필드를 입력해주세요');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-lead-magnet', {
        body: {
          partnerId: user.id,
          magnetType: form.magnetType,
          topic: form.topic,
          targetAudience: form.targetAudience,
          branding: {
            partnerName: form.partnerName,
            colorScheme: form.colorScheme
          },
          language: form.language,
          leadCapture: {
            type: form.leadCaptureType,
            required: true
          },
          leadGoal: form.leadGoal,
          depth: form.depth
        }
      });

      if (error) throw error;

      setGeneratedMagnet(data);
      toast.success('리드 마그넷이 성공적으로 생성되었습니다!');
    } catch (error) {
      console.error('Error generating lead magnet:', error);
      toast.error('리드 마그넷 생성에 실패했습니다');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('클립보드에 복사되었습니다');
  };

  const getMagnetTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5" />;
      case 'quiz': return <HelpCircle className="w-5 h-5" />;
      case 'gated': return <Lock className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getMagnetTypeLabel = (type: string) => {
    switch (type) {
      case 'pdf': return 'PDF 리포트';
      case 'quiz': return '인터랙티브 퀴즈';
      case 'gated': return '게이트 콘텐츠';
      default: return 'PDF 리포트';
    }
  };

  if (generatedMagnet) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="outline" 
            onClick={() => setGeneratedMagnet(null)}
          >
            ← 새로 만들기
          </Button>
          <h1 className="text-2xl font-bold">리드 마그넷 생성 완료</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              {getMagnetTypeIcon(form.magnetType)}
              <div>
                <CardTitle>{generatedMagnet.title}</CardTitle>
                <CardDescription>
                  {getMagnetTypeLabel(form.magnetType)} • 대상: {form.targetAudience}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 생성된 콘텐츠 미리보기 */}
            <div>
              <Label className="text-sm font-medium">콘텐츠 미리보기</Label>
              <div className="mt-2 p-4 border rounded-lg bg-gray-50 max-h-60 overflow-y-auto">
                {form.magnetType === 'quiz' && generatedMagnet.content.questions ? (
                  <div className="space-y-4">
                    <h3 className="font-medium">{generatedMagnet.content.title}</h3>
                    {generatedMagnet.content.questions.slice(0, 2).map((q: any, idx: number) => (
                      <div key={idx} className="border-l-2 border-blue-200 pl-3">
                        <p className="font-medium text-sm">{q.question}</p>
                        <ul className="text-xs text-gray-600 mt-1 space-y-1">
                          {q.options?.map((option: string, optIdx: number) => (
                            <li key={optIdx}>• {option}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <p className="text-xs text-gray-500">... {generatedMagnet.content.questions?.length || 0}개 질문</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h3 className="font-medium">{generatedMagnet.content.title}</h3>
                    <p className="text-sm text-gray-700 line-clamp-6">
                      {typeof generatedMagnet.content.content === 'string' 
                        ? generatedMagnet.content.content.substring(0, 300) + '...'
                        : JSON.stringify(generatedMagnet.content).substring(0, 300) + '...'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 공유 링크 */}
            <div>
              <Label className="text-sm font-medium">공유 링크</Label>
              <div className="flex gap-2 mt-2">
                <Input 
                  value={generatedMagnet.publicUrl}
                  readOnly
                  className="flex-1"
                />
                <Button 
                  variant="outline"
                  onClick={() => copyToClipboard(generatedMagnet.publicUrl)}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                고객이 이 링크를 통해 {form.leadCaptureType === 'email' ? '이메일' : '텔레그램'} 정보를 입력하고 콘텐츠에 접근할 수 있습니다.
              </p>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => window.open(generatedMagnet.publicUrl, '_blank')}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                미리보기
              </Button>
              
              {generatedMagnet.downloadUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(generatedMagnet.downloadUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF 다운로드
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => copyToClipboard(generatedMagnet.publicUrl)}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                링크 복사
              </Button>
            </div>

            <Alert>
              <AlertDescription>
                💡 생성된 리드 마그넷을 소셜 미디어나 커뮤니티에 공유하여 잠재 고객의 연락처를 수집하세요.
                수집된 리드는 파트너 허브에서 확인할 수 있습니다.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>리드 마그넷 설정</CardTitle>
          <CardDescription>
            고품질 콘텐츠로 고객의 이메일이나 텔레그램 정보를 수집하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 마그넷 타입 선택 */}
          <div className="space-y-3">
            <Label>콘텐츠 타입</Label>
            <RadioGroup 
              value={form.magnetType} 
              onValueChange={(value: 'pdf' | 'quiz' | 'gated') => handleInputChange('magnetType', value)}
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="pdf" id="pdf" />
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <Label htmlFor="pdf" className="font-medium">PDF 리포트</Label>
                  <p className="text-sm text-gray-500">전문적인 분석 리포트 (예: "비트코인 시장 전망")</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="quiz" id="quiz" />
                <HelpCircle className="w-5 h-5 text-green-600" />
                <div>
                  <Label htmlFor="quiz" className="font-medium">인터랙티브 퀴즈</Label>
                  <p className="text-sm text-gray-500">고객 성향 분석 퀴즈 (예: "당신의 트레이딩 스타일은?")</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="gated" id="gated" />
                <Lock className="w-5 h-5 text-purple-600" />
                <div>
                  <Label htmlFor="gated" className="font-medium">게이트 콘텐츠</Label>
                  <p className="text-sm text-gray-500">독점 분석 콘텐츠 (이메일 제공 후 접근 가능)</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">주제 *</Label>
              <Input
                id="topic"
                placeholder="예: 비트코인 2025년 전망"
                value={form.topic}
                onChange={(e) => handleInputChange('topic', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience">대상 고객 *</Label>
              <Input
                id="audience"
                placeholder="예: 암호화폐 초보자"
                value={form.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadGoal">리드 수집 목표</Label>
            <Input
              id="leadGoal"
              placeholder="예: 거래소 가입 유도, 커뮤니티 참여"
              value={form.leadGoal}
              onChange={(e) => handleInputChange('leadGoal', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="depth">콘텐츠 깊이</Label>
            <Select value={form.depth} onValueChange={(value) => handleInputChange('depth', value)}>
              <SelectTrigger>
                <SelectValue placeholder="콘텐츠 수준 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">초급 - 기본 개념 중심</SelectItem>
                <SelectItem value="intermediate">중급 - 실용적 정보 포함</SelectItem>
                <SelectItem value="advanced">고급 - 전문적 분석</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 브랜딩 설정 */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">브랜딩 설정</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partnerName">파트너명 *</Label>
                <Input
                  id="partnerName"
                  placeholder="예: 크립토 인사이트"
                  value={form.partnerName}
                  onChange={(e) => handleInputChange('partnerName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="colorScheme">브랜드 컬러</Label>
                <div className="flex gap-2">
                  <Input
                    id="colorScheme"
                    type="color"
                    value={form.colorScheme}
                    onChange={(e) => handleInputChange('colorScheme', e.target.value)}
                    className="w-16"
                  />
                  <Input
                    value={form.colorScheme}
                    onChange={(e) => handleInputChange('colorScheme', e.target.value)}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 리드 수집 설정 */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">리드 수집 설정</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>수집 정보 타입</Label>
                <Select value={form.leadCaptureType} onValueChange={(value: 'email' | 'telegram') => handleInputChange('leadCaptureType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">이메일 주소</SelectItem>
                    <SelectItem value="telegram">텔레그램 ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>언어</Label>
                <Select value={form.language} onValueChange={(value) => handleInputChange('language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ko">한국어</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                    <SelectItem value="id">Indonesia</SelectItem>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !form.topic || !form.targetAudience || !form.partnerName}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                AI로 생성 중...
              </>
            ) : (
              '리드 마그넷 생성하기'
            )}
          </Button>

          <Alert>
            <AlertDescription>
              💡 생성된 콘텐츠는 교육 목적으로만 제공되며, 투자 조언을 포함하지 않습니다. 
              암호화폐 투자의 위험성에 대한 고지사항이 자동으로 포함됩니다.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}