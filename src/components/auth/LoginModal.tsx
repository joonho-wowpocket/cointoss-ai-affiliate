import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, Lock, User, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  trigger?: string; // 모달을 열게 한 액션 타입
  title?: string;
  description?: string;
}

export function LoginModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  trigger = 'general',
  title = '3분 만에 무료 가입하고 최고 요율을 받으세요',
  description = '거래소별 최대 85% 요율과 자동화된 정산 시스템을 경험해보세요'
}: LoginModalProps) {
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signup');
  
  const [signUpForm, setSignUpForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [signInForm, setSignInForm] = useState({
    email: '',
    password: ''
  });

  const getTriggerBenefits = () => {
    switch (trigger) {
      case 'copy_link':
        return ['내 전용 추천 링크 생성', '실시간 클릭/전환 추적', '자동 정산 시스템'];
      case 'apply_approved':
        return ['승인 요율 최대 85%', '우선 심사 처리', 'VIP 파트너 혜택'];
      case 'uid_submit':
        return ['고객 UID 자동 등록', '실시간 수익 확인', '투명한 정산 내역'];
      case 'settlement_request':
        return ['즉시 정산 신청', '다양한 출금 옵션', '수수료 최소화'];
      default:
        return ['업계 최고 요율 85%', 'AI 자동화 도구', '24시간 고객지원'];
    }
  };

  const benefits = getTriggerBenefits();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpForm.password !== signUpForm.confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다');
      return;
    }
    
    if (signUpForm.password.length < 6) {
      toast.error('비밀번호는 6자리 이상이어야 합니다');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signUp(signUpForm.email, signUpForm.password);
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('이미 가입된 이메일입니다. 로그인을 시도해주세요.');
          setActiveTab('signin');
        } else {
          toast.error(error.message);
        }
        return;
      }
      
      toast.success('가입이 완료되었습니다!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error('가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      const { error } = await signIn(signInForm.email, signInForm.password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('이메일 또는 비밀번호가 올바르지 않습니다.');
        } else {
          toast.error(error.message);
        }
        return;
      }
      
      toast.success('로그인되었습니다!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Benefits Preview */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="pt-4">
              <div className="grid gap-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                무료 가입
              </TabsTrigger>
              <TabsTrigger value="signin" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                로그인
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signup" className="space-y-4 mt-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="example@email.com"
                      value={signUpForm.email}
                      onChange={(e) => setSignUpForm(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="6자리 이상"
                      value={signUpForm.password}
                      onChange={(e) => setSignUpForm(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">비밀번호 확인</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="비밀번호 다시 입력"
                      value={signUpForm.confirmPassword}
                      onChange={(e) => setSignUpForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      가입 중...
                    </>
                  ) : (
                    '무료로 시작하기'
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  가입하시면 <a href="/terms" className="underline">이용약관</a> 및{' '}
                  <a href="/privacy" className="underline">개인정보처리방침</a>에 동의하는 것으로 간주됩니다.
                </p>
              </form>
            </TabsContent>

            <TabsContent value="signin" className="space-y-4 mt-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="example@email.com"
                      value={signInForm.email}
                      onChange={(e) => setSignInForm(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="비밀번호 입력"
                      value={signInForm.password}
                      onChange={(e) => setSignInForm(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      로그인 중...
                    </>
                  ) : (
                    '로그인'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {activeTab === 'signup' ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}{' '}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'signup' ? 'signin' : 'signup')}
                className="text-primary hover:underline font-medium"
              >
                {activeTab === 'signup' ? '로그인하기' : '무료 가입하기'}
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}