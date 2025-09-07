import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight, 
  Clock,
  Shield
} from "lucide-react";

interface ApprovalProcessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exchangeId?: string;
  exchangeName?: string;
}

type ProcessStep = 'notice' | 'redirect' | 'uid_form' | 'success';

interface ExchangeInfo {
  id: string;
  name: string;
  referralUrl: string;
  uidPattern: RegExp;
  uidHelp: string;
}

const EXCHANGES: ExchangeInfo[] = [
  {
    id: 'binance',
    name: 'Binance',
    referralUrl: 'https://accounts.binance.com/register?ref=COINTOSS_BN',
    uidPattern: /^[0-9]{8,12}$/,
    uidHelp: '8-12자리 숫자 (계정 > 보안 > UID에서 확인)'
  },
  {
    id: 'bybit',
    name: 'Bybit',
    referralUrl: 'https://partner.bybit.com/b/cointoss',
    uidPattern: /^[A-Za-z0-9]{8,10}$/,
    uidHelp: '8-10자리 영문/숫자 (계정 > 보안 > UID에서 확인)'
  },
  {
    id: 'okx',
    name: 'OKX',
    referralUrl: 'https://www.okx.com/join/COINTOSS',
    uidPattern: /^[A-Za-z0-9_-]{6,16}$/,
    uidHelp: '6-16자리 영문/숫자/특수문자'
  },
  {
    id: 'gate',
    name: 'Gate.io',
    referralUrl: 'https://www.gate.io/signup/cointoss',
    uidPattern: /^[0-9]{6,10}$/,
    uidHelp: '6-10자리 숫자'
  }
];

const STORAGE_KEY = 'ctoss_apply_step';

export function ApprovalProcessModal({ 
  open, 
  onOpenChange, 
  exchangeId = '', 
  exchangeName = '' 
}: ApprovalProcessModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<ProcessStep>('notice');
  const [selectedExchange, setSelectedExchange] = useState(exchangeId);
  const [acknowledged, setAcknowledged] = useState(false);
  const [uid, setUid] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState('');

  // Load state from localStorage
  useEffect(() => {
    if (open && selectedExchange) {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${selectedExchange}`);
      if (saved) {
        try {
          const { step: savedStep, uid: savedUid } = JSON.parse(saved);
          if (savedStep === 'uid_form' || savedStep === 'redirect') {
            setStep(savedStep);
            setUid(savedUid || '');
          }
        } catch (e) {
          // Ignore invalid saved state
        }
      }
      
      // Track modal open
      trackEvent('apply_opened', { exchange: selectedExchange });
    }
  }, [open, selectedExchange]);

  // Save state to localStorage
  const saveState = (newStep: ProcessStep, newUid = uid) => {
    if (selectedExchange) {
      localStorage.setItem(`${STORAGE_KEY}_${selectedExchange}`, JSON.stringify({
        step: newStep,
        uid: newUid,
        timestamp: Date.now()
      }));
    }
  };

  // Analytics tracking
  const trackEvent = (event: string, properties: Record<string, any> = {}) => {
    // Google Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', event, {
        event_category: 'approval_process',
        exchange_id: selectedExchange,
        ...properties
      });
    }
    
    // Custom events
    window.dispatchEvent(new CustomEvent(`approval.${event}`, { 
      detail: { exchange: selectedExchange, ...properties } 
    }));
  };

  const selectedExchangeInfo = EXCHANGES.find(ex => ex.id === selectedExchange);

  const handleClose = () => {
    onOpenChange(false);
    // Reset after delay to allow modal animation
    setTimeout(() => {
      setStep('notice');
      setAcknowledged(false);
      setUid('');
      setApplicationId('');
    }, 200);
  };

  const handleNoticeNext = () => {
    if (!acknowledged) return;
    
    trackEvent('notice_acknowledged');
    
    // Open referral link in new tab
    if (selectedExchangeInfo) {
      window.open(selectedExchangeInfo.referralUrl, '_blank');
      trackEvent('referral_opened', { url: selectedExchangeInfo.referralUrl });
    }
    
    setStep('redirect');
    saveState('redirect');
  };

  const handleRedirectNext = () => {
    trackEvent('uid_form_viewed');
    setStep('uid_form');
    saveState('uid_form');
  };

  const handleReopenReferral = () => {
    if (selectedExchangeInfo) {
      window.open(selectedExchangeInfo.referralUrl, '_blank');
      trackEvent('referral_reopened', { url: selectedExchangeInfo.referralUrl });
    }
  };

  const validateUID = (value: string) => {
    if (!selectedExchangeInfo) return false;
    return selectedExchangeInfo.uidPattern.test(value);
  };

  const handleUIDSubmit = async () => {
    if (!uid || !selectedExchange || !validateUID(uid)) {
      toast({
        title: "입력 오류",
        description: "올바른 UID를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    trackEvent('uid_submitted');

    try {
      // Check for duplicate UID
      const { data: existingUIDs, error: checkError } = await supabase
        .from('uids')
        .select('id, status')
        .eq('exchange_id', selectedExchange)
        .eq('uid', uid)
        .limit(1);

      if (checkError) throw checkError;

      if (existingUIDs && existingUIDs.length > 0) {
        toast({
          title: "중복된 UID",
          description: "이미 등록된 UID입니다.",
          variant: "destructive"
        });
        trackEvent('application_failed', { reason: 'duplicate_uid' });
        return;
      }

      // Submit UID and application
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      const { data, error } = await supabase
        .from('uids')
        .insert({
          user_id: user.id,
          exchange_id: selectedExchange,
          uid: uid,
          status: 'Pending',
          memo: `승인 신청: ${selectedExchangeInfo?.name || selectedExchange}`
        })
        .select('id')
        .single();

      if (error) throw error;

      setApplicationId(data.id);
      setStep('success');
      
      // Clear localStorage on success
      localStorage.removeItem(`${STORAGE_KEY}_${selectedExchange}`);
      
      trackEvent('application_created', { 
        appId: data.id, 
        status: 'review_pending' 
      });

      toast({
        title: "승인 신청이 완료되었습니다",
        description: "심사까지 영업일 기준 1-3일 소요될 수 있습니다.",
      });

    } catch (error: any) {
      console.error('Application error:', error);
      toast({
        title: "신청 실패",
        description: error.message || "승인 신청 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      trackEvent('application_failed', { reason: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewStatus = () => {
    handleClose();
    // Navigate to approvals tab
    window.location.href = '/partner-hub?tab=approvals';
  };

  const handleNewApplication = () => {
    setStep('notice');
    setSelectedExchange('');
    setAcknowledged(false);
    setUid('');
    setApplicationId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            승인 연동 신청
            {step !== 'notice' && (
              <Badge variant="outline" className="ml-auto">
                {step === 'redirect' && '2/3 단계'}
                {step === 'uid_form' && '3/3 단계'}
                {step === 'success' && '완료'}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Exchange Selection (if not pre-selected) */}
          {!exchangeId && step === 'notice' && (
            <div>
              <Label htmlFor="exchange">거래소 선택</Label>
              <Select value={selectedExchange} onValueChange={setSelectedExchange}>
                <SelectTrigger>
                  <SelectValue placeholder="거래소를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {EXCHANGES.map(ex => (
                    <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 1: Notice */}
          {step === 'notice' && (
            <div className="space-y-6">
              <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-1 shrink-0" />
                    <div className="space-y-3">
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                        UID 등록 전 안내
                      </h3>
                      <ul className="space-y-2 text-sm text-orange-800 dark:text-orange-200">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 shrink-0" />
                          반드시 <strong>코인토스 레퍼럴 링크</strong>로 신규 가입해야 수수료 인상이 적용됩니다.
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 shrink-0" />
                          기존 계정/타 레퍼럴로 가입한 UID는 승인되지 않습니다.
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 shrink-0" />
                          거래소 가입 후 <strong>UID를 정확히 입력</strong>해주세요.
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 shrink-0" />
                          심사 기준: 신규 가입 여부, 레퍼럴 코드 일치, 부정 사용 여부.
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acknowledge"
                  checked={acknowledged}
                  onCheckedChange={(checked) => setAcknowledged(checked === true)}
                />
                <Label htmlFor="acknowledge" className="text-sm">
                  주의사항을 확인했습니다.
                </Label>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleNoticeNext}
                  disabled={!acknowledged || !selectedExchange}
                  className="flex items-center gap-2"
                >
                  다음 (레퍼럴 링크 열기)
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Redirect */}
          {step === 'redirect' && (
            <div className="space-y-6 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <ExternalLink className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">거래소 가입 진행</h3>
                <p className="text-muted-foreground">
                  새 창에서 가입을 완료한 뒤 이 화면으로 돌아와 <strong>UID를 입력</strong>해주세요.
                </p>
                
                {selectedExchangeInfo && (
                  <Card className="bg-muted/30">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground mb-2">연결된 링크:</p>
                      <p className="text-sm font-mono break-all">{selectedExchangeInfo.referralUrl}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={handleReopenReferral}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  다시 레퍼럴 링크 열기
                </Button>
                <Button onClick={handleRedirectNext}>
                  UID 입력으로 이동
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: UID Form */}
          {step === 'uid_form' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('redirect')}
                  className="p-1 h-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                이전 단계로
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="uid">
                    {selectedExchangeInfo?.name || '거래소'} UID
                  </Label>
                  <Input
                    id="uid"
                    value={uid}
                    onChange={(e) => {
                      setUid(e.target.value);
                      saveState('uid_form', e.target.value);
                    }}
                    placeholder="예) 12345678"
                    className={!uid || validateUID(uid) ? '' : 'border-destructive'}
                  />
                  {selectedExchangeInfo && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedExchangeInfo.uidHelp}
                    </p>
                  )}
                  {uid && !validateUID(uid) && (
                    <p className="text-xs text-destructive mt-1">
                      허용되지 않는 문자입니다. 영문/숫자/-/_만 가능.
                    </p>
                  )}
                </div>

                <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
                  <CardContent className="pt-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      💡 <strong>UID 찾는 방법:</strong> 거래소 계정 정보 &gt; UID에서 확인 가능
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleUIDSubmit}
                  disabled={!uid || !validateUID(uid) || submitting}
                  className="flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    '승인 신청'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="space-y-6 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                  승인 신청이 완료되었습니다
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>심사까지 영업일 기준 1~3일 소요될 수 있습니다.</p>
                  <p>심사 결과는 <strong>알림센터/이메일/텔레그램</strong>으로 안내됩니다.</p>
                  <p>잘못된 UID 입력 시 반려될 수 있습니다.</p>
                </div>
                
                {applicationId && (
                  <Card className="bg-muted/30">
                    <CardContent className="pt-4">
                      <p className="text-xs text-muted-foreground">신청 ID</p>
                      <p className="text-sm font-mono">{applicationId}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={handleViewStatus}>
                  <Clock className="w-4 h-4 mr-2" />
                  내 신청 현황 보기
                </Button>
                <Button onClick={handleNewApplication}>
                  다른 거래소 추가 신청
                </Button>
              </div>
            </div>
          )}

          {/* Footer */}
          {step !== 'success' && (
            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="ghost" onClick={handleClose}>
                취소
              </Button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {step === 'notice' && (
                  <>
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <div className="w-2 h-2 bg-muted rounded-full" />
                    <div className="w-2 h-2 bg-muted rounded-full" />
                  </>
                )}
                {step === 'redirect' && (
                  <>
                    <div className="w-2 h-2 bg-muted rounded-full" />
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <div className="w-2 h-2 bg-muted rounded-full" />
                  </>
                )}
                {step === 'uid_form' && (
                  <>
                    <div className="w-2 h-2 bg-muted rounded-full" />
                    <div className="w-2 h-2 bg-muted rounded-full" />
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}