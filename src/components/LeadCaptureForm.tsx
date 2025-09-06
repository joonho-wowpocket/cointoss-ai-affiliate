import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, MessageCircle, Phone, FileDown } from 'lucide-react';

interface LeadCaptureFormProps {
  magnetId: string;
  leadGoal: 'email' | 'telegram' | 'phone' | 'form';
  gatingCopy: string;
  ctaVariants: string[];
  onLeadCaptured: () => void;
}

export const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({
  magnetId,
  leadGoal,
  gatingCopy,
  ctaVariants,
  onLeadCaptured,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    telegram: '',
    phone: '',
    name: '',
    company: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields based on lead goal
    if (leadGoal === 'email' && !formData.email) {
      toast({
        title: "이메일 필수",
        description: "이메일 주소를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    if (leadGoal === 'telegram' && !formData.telegram) {
      toast({
        title: "텔레그램 필수",
        description: "텔레그램 사용자명을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    if (leadGoal === 'phone' && !formData.phone) {
      toast({
        title: "전화번호 필수",
        description: "전화번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Get current user session to identify partner
      const { data: { user } } = await supabase.auth.getUser();
      
      const contactInfo: any = {};
      if (formData.email) contactInfo.email = formData.email;
      if (formData.telegram) contactInfo.telegram = formData.telegram;
      if (formData.phone) contactInfo.phone = formData.phone;
      if (formData.name) contactInfo.name = formData.name;
      if (formData.company) contactInfo.company = formData.company;
      if (formData.notes) contactInfo.notes = formData.notes;

      // Save lead capture to database
      const { error } = await supabase
        .from('lead_captures')
        .insert({
          lead_magnet_id: magnetId,
          partner_id: user?.id || 'anonymous',
          contact_info: contactInfo,
          source: 'lead_magnet_form',
          ip_address: null, // Could be populated on server side
          user_agent: navigator.userAgent,
        });

      if (error) throw error;

      // Update download count
      const { data: currentMagnet } = await supabase
        .from('lead_magnets')
        .select('download_count')
        .eq('id', magnetId)
        .single();
      
      if (currentMagnet) {
        const { error: updateError } = await supabase
          .from('lead_magnets')
          .update({ download_count: currentMagnet.download_count + 1 })
          .eq('id', magnetId);

        if (updateError) console.warn('Failed to update download count:', updateError);
      }

      toast({
        title: "리드 정보 수집 완료",
        description: "정보가 성공적으로 저장되었습니다. 다운로드를 시작합니다.",
      });

      onLeadCaptured();
      
    } catch (error: any) {
      console.error('Lead capture error:', error);
      toast({
        title: "정보 저장 실패",
        description: error.message || "리드 정보 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (leadGoal) {
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'telegram':
        return <MessageCircle className="h-5 w-5" />;
      case 'phone':
        return <Phone className="h-5 w-5" />;
      default:
        return <FileDown className="h-5 w-5" />;
    }
  };

  const getTitle = () => {
    switch (leadGoal) {
      case 'email':
        return '이메일로 받기';
      case 'telegram':
        return '텔레그램으로 받기';
      case 'phone':
        return '연락처로 받기';
      default:
        return '정보 입력 후 받기';
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          {getIcon()}
        </div>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>
          {gatingCopy}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {(leadGoal === 'email' || leadGoal === 'form') && (
            <div>
              <Label htmlFor="email">이메일 주소 {leadGoal === 'email' ? '*' : ''}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
                required={leadGoal === 'email'}
              />
            </div>
          )}

          {(leadGoal === 'telegram' || leadGoal === 'form') && (
            <div>
              <Label htmlFor="telegram">텔레그램 사용자명 {leadGoal === 'telegram' ? '*' : ''}</Label>
              <Input
                id="telegram"
                value={formData.telegram}
                onChange={(e) => setFormData(prev => ({ ...prev, telegram: e.target.value }))}
                placeholder="@username"
                required={leadGoal === 'telegram'}
              />
            </div>
          )}

          {(leadGoal === 'phone' || leadGoal === 'form') && (
            <div>
              <Label htmlFor="phone">전화번호 {leadGoal === 'phone' ? '*' : ''}</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="010-0000-0000"
                required={leadGoal === 'phone'}
              />
            </div>
          )}

          {leadGoal === 'form' && (
            <>
              <div>
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="홍길동"
                />
              </div>
              <div>
                <Label htmlFor="company">회사/소속</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="회사명 또는 소속"
                />
              </div>
              <div>
                <Label htmlFor="notes">관심사/메모</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="관심 분야나 추가 메모"
                  rows={3}
                />
              </div>
            </>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? '처리 중...' : (ctaVariants[0] || '다운로드 받기')}
          </Button>
        </form>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          * 개인정보는 안전하게 보호되며, 마케팅 목적으로만 사용됩니다.
        </div>
      </CardContent>
    </Card>
  );
};