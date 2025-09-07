import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRuntime } from '@/contexts/RuntimeContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  Shield,
  Plus,
  RefreshCw
} from 'lucide-react';

interface PartnerUID {
  id: string;
  exchange_id: string;
  partner_uid?: string;
  state: 'NotApplied' | 'Applied' | 'Reviewing' | 'Approved' | 'Rejected';
  application_data?: any;
  created_at: string;
  updated_at: string;
  approval_notes?: string;
  approved_at?: string;
}

interface Exchange {
  id: string;
  name: string;
  base_rate: number;
  approved_rate?: number;
  ref_param: string;
}

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchange: Exchange | null;
  onSubmit: (uid: string, agreementAccepted: boolean) => void;
}

function ApprovalModal({ isOpen, onClose, exchange, onSubmit }: ApprovalModalProps) {
  const [uid, setUid] = useState('');
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!uid || !agreementAccepted) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(uid, agreementAccepted);
      setUid('');
      setAgreementAccepted(false);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReferralLink = () => {
    if (exchange) {
      const referralUrl = `https://partner.${exchange.id}.com/signup?${exchange.ref_param}=cointoss`;
      window.open(referralUrl, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {exchange?.name} 승인 신청
          </DialogTitle>
          <DialogDescription>
            승인 받아 최대 {exchange?.approved_rate}% 요율을 받으세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Notice Banner */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">승인 신청 전 필수 단계:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>아래 추천 링크로 {exchange?.name}에서 계정 생성</li>
                  <li>본인 UID 확인 후 아래에 입력</li>
                  <li>CoinToss 심사팀이 승인 검토 (평균 24-48시간)</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>

          {/* Referral Link Button */}
          <Button
            onClick={openReferralLink}
            className="w-full"
            variant="outline"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {exchange?.name} 추천 링크 열기
          </Button>

          {/* UID Input */}
          <div className="space-y-2">
            <Label htmlFor="partner-uid">본인 UID</Label>
            <Input
              id="partner-uid"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="계정 생성 후 UID를 입력하세요"
            />
          </div>

          {/* Agreement Checkbox */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreement"
              checked={agreementAccepted}
              onCheckedChange={(checked) => setAgreementAccepted(checked as boolean)}
            />
            <Label htmlFor="agreement" className="text-sm leading-5">
              위 안내사항을 읽었으며, 정확한 UID를 입력했음을 확인합니다.
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!uid || !agreementAccepted || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                승인 신청 중...
              </>
            ) : (
              '승인 신청하기'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MyUIDManager() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { isPreviewBlocked } = useRuntime();
  
  const [partnerUIDs, setPartnerUIDs] = useState<PartnerUID[]>([]);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_exchanges: 0,
    approved_exchanges: 0,
    pending_exchanges: 0,
    basic_exchanges: 0
  });

  // Modal state
  const [approvalModal, setApprovalModal] = useState({
    isOpen: false,
    exchange: null as Exchange | null
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadExchanges(),
        loadPartnerUIDs(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading UID manager data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExchanges = async () => {
    try {
      const { data, error } = await supabase
        .from('exchanges')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      setExchanges(data || []);
    } catch (error) {
      console.error('Error loading exchanges:', error);
    }
  };

  const loadPartnerUIDs = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('partner_exchange_status')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPartnerUIDs((data as any[])?.map(item => ({
        ...item,
        state: item.state as 'NotApplied' | 'Applied' | 'Reviewing' | 'Approved' | 'Rejected'
      })) || []);
    } catch (error) {
      console.error('Error loading partner UIDs:', error);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .rpc('get_partner_uid_stats', { p_user_id: user.id });

      if (error) throw error;
      setStats((data as any) || {
        total_exchanges: 0,
        approved_exchanges: 0,
        pending_exchanges: 0,
        basic_exchanges: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleApplyApproval = (exchange: Exchange) => {
    setApprovalModal({
      isOpen: true,
      exchange
    });
  };

  const handleSubmitApproval = async (uid: string, agreementAccepted: boolean) => {
    if (!approvalModal.exchange || !user) return;

    try {
      // Validate UID first
      const { data: validationResult, error: validationError } = await supabase
        .rpc('validate_and_register_uid', {
          p_user_id: user.id,
          p_exchange_id: approvalModal.exchange.id,
          p_uid: uid,
          p_uid_type: 'partner'
        });

      if (validationError) throw validationError;
      
      const result = validationResult as any;
      if (!result?.valid) {
        throw new Error(result?.message || 'Validation failed');
      }

      // Update or insert partner exchange status
      const { error } = await supabase
        .from('partner_exchange_status')
        .upsert({
          user_id: user.id,
          exchange_id: approvalModal.exchange.id,
          mode: 'approved',
          state: 'Applied',
          partner_uid: uid,
          application_data: {
            agreement_accepted: agreementAccepted,
            applied_at: new Date().toISOString()
          }
        });

      if (error) throw error;

      toast({
        title: "승인 신청 완료",
        description: `${approvalModal.exchange.name} 승인 신청이 완료되었습니다. 심사 결과를 기다려주세요.`,
      });

      loadData();
    } catch (error: any) {
      toast({
        title: "승인 신청 실패",
        description: error.message || "승인 신청 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const getPartnerStatus = (exchangeId: string): PartnerUID | null => {
    return partnerUIDs.find(p => p.exchange_id === exchangeId) || null;
  };

  const getStatusBadge = (state: string) => {
    const badges = {
      NotApplied: { label: '기본 연동', variant: 'secondary' as const, icon: User },
      Applied: { label: '승인 대기', variant: 'default' as const, icon: Clock },
      Reviewing: { label: '심사 중', variant: 'default' as const, icon: Clock },
      Approved: { label: '승인 완료', variant: 'default' as const, icon: CheckCircle },
      Rejected: { label: '승인 거부', variant: 'destructive' as const, icon: XCircle }
    };

    const badge = badges[state as keyof typeof badges] || badges.NotApplied;
    const IconComponent = badge.icon;

    return (
      <Badge variant={badge.variant} className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        {badge.label}
      </Badge>
    );
  };

  const getActionButton = (exchange: Exchange) => {
    const status = getPartnerStatus(exchange.id);
    
    switch (status?.state) {
      case 'Applied':
      case 'Reviewing':
        return (
          <Button variant="secondary" disabled className="w-full">
            <Clock className="w-4 h-4 mr-2" />
            심사 대기중
          </Button>
        );
      case 'Approved':
        return (
          <Button variant="default" className="w-full">
            <CheckCircle className="w-4 h-4 mr-2" />
            승인 완료
          </Button>
        );
      case 'Rejected':
        return (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => handleApplyApproval(exchange)}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            재신청하기
          </Button>
        );
      default:
        return (
          <Button 
            className="w-full"
            onClick={() => handleApplyApproval(exchange)}
          >
            <Shield className="w-4 h-4 mr-2" />
            승인 신청하기
          </Button>
        );
    }
  };

  // Empty state for new users
  if (!isAuthenticated || isPreviewBlocked) {
    return (
      <Card>
        <CardContent className="p-12 text-center space-y-4">
          <User className="w-12 h-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold mb-2">UID 등록이 필요합니다</h3>
            <p className="text-muted-foreground">
              거래소별로 본인 UID를 등록하여 수익 추적을 시작하세요.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              전체 거래소
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exchanges.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              승인 완료
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.approved_exchanges}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              승인 대기
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending_exchanges}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              기본 연동
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.basic_exchanges}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exchange Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exchanges.map((exchange) => {
          const status = getPartnerStatus(exchange.id);
          
          return (
            <Card key={exchange.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{exchange.name}</CardTitle>
                    <CardDescription>
                      기본: {exchange.base_rate}% → 승인: {exchange.approved_rate}%
                    </CardDescription>
                  </div>
                  {getStatusBadge(status?.state || 'NotApplied')}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* UID Display */}
                {status?.partner_uid && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">등록된 UID</div>
                    <div className="font-mono text-sm">{status.partner_uid}</div>
                  </div>
                )}

                {/* Commission Rate Display */}
                <div className="flex justify-between items-center text-sm">
                  <span>현재 요율:</span>
                  <span className="font-semibold">
                    {status?.state === 'Approved' 
                      ? `${exchange.approved_rate}%` 
                      : `${exchange.base_rate}%`
                    }
                  </span>
                </div>

                {/* Action Button */}
                {getActionButton(exchange)}

                {/* Approval Notes */}
                {status?.approval_notes && (
                  <Alert>
                    <AlertDescription className="text-sm">
                      {status.approval_notes}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {exchanges.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2">지원 거래소를 불러오는 중...</h3>
              <p className="text-muted-foreground">
                잠시 후 다시 시도해주세요.
              </p>
            </div>
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={approvalModal.isOpen}
        onClose={() => setApprovalModal({ isOpen: false, exchange: null })}
        exchange={approvalModal.exchange}
        onSubmit={handleSubmitApproval}
      />
    </div>
  );
}