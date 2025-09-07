import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Loader2, 
  ExternalLink, 
  Copy, 
  Users, 
  TrendingUp, 
  Shield, 
  Star, 
  Lock, 
  UserPlus, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { LoginModal } from "@/components/auth/LoginModal";
import { GuestBanner } from "@/components/GuestBanner";
import { ApprovalProcessModal } from "@/components/ApprovalProcessModal";

interface Exchange {
  id: string;
  name: string;
  logo_url?: string;
  base_rate: number;
  approved_rate?: number;
  status: 'active' | 'paused';
}

interface PartnerProfile {
  ref_code?: string;
  partner_tier?: string;
  display_name?: string;
}

interface DashboardStats {
  supportedExchanges: number;
  monthlyEarnings: number;
  partnerTier: string;
  referralCode: string;
}

interface ExchangeStatus {
  exchangeId: string;
  status: 'Basic' | 'Pending' | 'Approved' | 'Rejected';
  lastSync?: string;
}

export default function Dashboard() {
  const { user, isGuest, isAuthenticated } = useAuth();
  const { isAdmin, hasAnyRole } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginTrigger, setLoginTrigger] = useState('general');
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedExchangeForApproval, setSelectedExchangeForApproval] = useState('');
  
  // Dashboard state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    supportedExchanges: 0,
    monthlyEarnings: 0,
    partnerTier: 'Basic',
    referralCode: ''
  });
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [exchangeStatuses, setExchangeStatuses] = useState<ExchangeStatus[]>([]);
  const [profile, setProfile] = useState<PartnerProfile>({});
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Runtime guards
  const canSeePreviewData = isAdmin || hasAnyRole(['SuperAdmin', 'Dev']) || process.env.NODE_ENV !== 'production';

  // Load dashboard data
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    setStatsLoading(true);
    try {
      await Promise.all([
        loadExchanges(),
        loadProfile(),
        loadEarnings(),
        loadExchangeStatuses()
      ]);
    } catch (error) {
      console.error('Dashboard data loading error:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadExchanges = async () => {
    try {
      const { data: exchangeList, error } = await supabase
        .from('exchanges')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      
      const typedExchanges = exchangeList?.map(ex => ({
        ...ex,
        status: ex.status as 'active' | 'paused'
      })) || [];
      
      setExchanges(typedExchanges);
      setDashboardStats(prev => ({
        ...prev,
        supportedExchanges: typedExchanges.length
      }));
    } catch (error) {
      console.error('Load exchanges error:', error);
      if (!canSeePreviewData) {
        setExchanges([]);
        setDashboardStats(prev => ({ ...prev, supportedExchanges: 0 }));
      }
    }
  };

  const loadProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (profile) {
        setProfile(profile);
        setDashboardStats(prev => ({
          ...prev,
          partnerTier: (profile as any).partner_tier || 'Basic',
          referralCode: (profile as any).ref_code || user?.id?.slice(0, 8) || ''
        }));
      }
    } catch (error) {
      console.error('Load profile error:', error);
      if (!canSeePreviewData) {
        setProfile({});
        setDashboardStats(prev => ({
          ...prev,
          partnerTier: 'Basic',
          referralCode: user?.id?.slice(0, 8) || ''
        }));
      }
    }
  };

  const loadEarnings = async () => {
    try {
      const thisMonth = new Date();
      const { data: earnings, error } = await supabase
        .from('earnings')
        .select('amount')
        .eq('user_id', user?.id)
        .gte('date', `${thisMonth.getFullYear()}-${String(thisMonth.getMonth() + 1).padStart(2, '0')}-01`);

      if (error) throw error;
      
      const monthlyTotal = earnings?.reduce((sum, earning) => sum + parseFloat(earning.amount.toString()), 0) || 0;
      setDashboardStats(prev => ({
        ...prev,
        monthlyEarnings: monthlyTotal
      }));
    } catch (error) {
      console.error('Load earnings error:', error);
      if (!canSeePreviewData) {
        setDashboardStats(prev => ({ ...prev, monthlyEarnings: 0 }));
      }
    }
  };

  const loadExchangeStatuses = async () => {
    try {
      const { data: statuses, error } = await supabase
        .from('partner_exchange_status')
        .select('exchange_id, state, updated_at')
        .eq('user_id', user?.id);

      if (error) throw error;
      
      const statusMap: ExchangeStatus[] = statuses?.map(status => ({
        exchangeId: status.exchange_id,
        status: status.state as 'Basic' | 'Pending' | 'Approved' | 'Rejected',
        lastSync: status.updated_at
      })) || [];
      
      setExchangeStatuses(statusMap);
    } catch (error) {
      console.error('Load exchange statuses error:', error);
      if (!canSeePreviewData) {
        setExchangeStatuses([]);
      }
    }
  };

  const handleActionClick = (action: string, exchangeId?: string) => {
    if (isGuest) {
      setLoginTrigger(action);
      setShowLoginModal(true);
      
      // Analytics tracking for guest actions
      if (typeof window !== 'undefined' && 'gtag' in window && typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'guest_click_cta', {
          action_type: action,
          exchange_id: exchangeId,
          page: 'dashboard'
        });
      }
      return;
    }
    
    // Handle authenticated user actions
    switch (action) {
      case 'copy_link':
        handleCopyLink(exchangeId);
        break;
      case 'apply_approved':
        handleApplyApproved(exchangeId);
        break;
      default:
        break;
    }
  };

  const handleCopyLink = async (exchangeId?: string) => {
    if (isGuest) return handleActionClick('copy_link', exchangeId);
    
    setIsLoading(true);
    try {
      const refCode = dashboardStats.referralCode || user?.id?.slice(0, 8) || '';
      const link = `https://cointoss.app/ref?code=${refCode}${exchangeId ? `&exchange=${exchangeId}` : ''}`;
      await navigator.clipboard.writeText(link);
      toast.success('링크가 복사되었습니다');
    } catch (error) {
      toast.error('링크 복사에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyApproved = (exchangeId?: string) => {
    if (isGuest) return handleActionClick('apply_approved', exchangeId);
    
    // Open approval process modal
    setApprovalModalOpen(true);
    setSelectedExchangeForApproval(exchangeId || '');
  };

  const getExchangeStatus = (exchangeId: string): ExchangeStatus => {
    const status = exchangeStatuses.find(s => s.exchangeId === exchangeId);
    return status || { exchangeId, status: 'Basic' };
  };

  const getStatusBadge = (status: 'Basic' | 'Pending' | 'Approved' | 'Rejected') => {
    const icons = {
      Basic: <Star className="w-3 h-3" />,
      Pending: <Clock className="w-3 h-3" />,
      Approved: <CheckCircle className="w-3 h-3" />,
      Rejected: <XCircle className="w-3 h-3" />
    };

    const variants = {
      Basic: 'bg-blue-100 text-blue-800 border-blue-200',
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Approved: 'bg-green-100 text-green-800 border-green-200',
      Rejected: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <Badge className={`${variants[status]} flex items-center gap-1`}>
        {icons[status]}
        {status === 'Basic' ? '기본 연동' : 
         status === 'Pending' ? '승인 대기' :
         status === 'Approved' ? '승인 완료' : '승인 거부'}
      </Badge>
    );
  };

  const getActionButton = (exchange: Exchange, status: ExchangeStatus) => {
    switch (status.status) {
      case 'Basic':
        return (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleApplyApproved(exchange.id)}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            승인 신청하기
          </Button>
        );
      case 'Pending':
        return (
          <Button variant="secondary" className="w-full" disabled>
            <Clock className="w-4 h-4 mr-2" />
            승인 대기중
          </Button>
        );
      case 'Approved':
        return (
          <Button variant="default" className="w-full">
            <Users className="w-4 h-4 mr-2" />
            UID 관리
          </Button>
        );
      case 'Rejected':
        return (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleApplyApproved(exchange.id)}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            재신청하기
          </Button>
        );
    }
  };

  const getRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-blue-600';
    if (rate >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  // Empty state component for new users
  const EmptyDashboardState = () => (
    <div className="text-center py-12 space-y-6">
      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
        <TrendingUp className="w-8 h-8 text-primary" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">거래소 연동을 시작하세요</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          첫 번째 거래소에 승인 신청하여 수익 추적을 시작하고 전체 기능을 이용해보세요.
        </p>
      </div>
      <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">승인 후 이용 가능한 기능</span>
        </div>
        <ul className="text-xs text-muted-foreground space-y-1 text-left">
          <li>• 실시간 수익 추적 및 분석</li>
          <li>• UID 등록 및 고객 관리</li>
          <li>• 자동 정산 및 리포트</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">거래소 관리</h1>
          <p className="text-muted-foreground">
            {isGuest 
              ? "지원되는 거래소와 요율을 확인하세요. 가입하여 내 전용 링크를 받아보세요."
              : "연동된 거래소를 관리하고 수익을 확인하세요"
            }
          </p>
        </div>
      </div>

      <GuestBanner onLoginClick={() => setShowLoginModal(true)} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">지원 거래소</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {isGuest ? '12+' : dashboardStats.supportedExchanges}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              전 세계 주요 거래소
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 수익</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {isGuest ? '$ —' : `$ ${dashboardStats.monthlyEarnings.toLocaleString()}`}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {isGuest ? '로그인 시 확인 가능' : '승인 UID 기준'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">파트너 등급</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {isGuest ? '—' : dashboardStats.partnerTier}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {isGuest ? '가입 후 확인' : '현재 등급'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">내 추천 링크</CardTitle>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleCopyLink()}
                  disabled={isGuest}
                >
                  <Copy className="w-3 h-3 mr-2" />
                  링크 복사
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  {isGuest ? '로그인 후 이용' : `코드: ${dashboardStats.referralCode}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Exchange Management */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">거래소 관리</h2>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            업계 최고 요율
          </Badge>
        </div>

        {/* Empty state for new users */}
        {!isGuest && exchanges.length === 0 && exchangeStatuses.length === 0 && !statsLoading && (
          <EmptyDashboardState />
        )}
        
        {/* Loading state */}
        {statsLoading && !isGuest && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-12 mt-1" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Exchange cards */}
        {(exchanges.length > 0 || isGuest) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(isGuest ? [
              { id: 'bybit', name: 'Bybit', base_rate: 25, approved_rate: 85, status: 'active' as const },
              { id: 'binance', name: 'Binance', base_rate: 20, approved_rate: 80, status: 'active' as const },
              { id: 'okx', name: 'OKX', base_rate: 30, approved_rate: 88, status: 'active' as const }
            ] : exchanges).map((exchange) => {
              const status = isGuest ? { exchangeId: exchange.id, status: 'Basic' as const } : getExchangeStatus(exchange.id);
              
              return (
                <Card key={exchange.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <img 
                            src={exchange.logo_url || '/placeholder.svg'} 
                            alt={exchange.name}
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold">{exchange.name}</h3>
                          <p className="text-sm text-muted-foreground">암호화폐 거래소</p>
                        </div>
                      </div>
                      {getStatusBadge(status.status)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* 요율 정보 */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">기본 요율</span>
                        <span className={`font-semibold ${getRateColor(exchange.base_rate)}`}>
                          {exchange.base_rate}%
                        </span>
                      </div>
                      {exchange.approved_rate && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">승인 요율</span>
                            <span className={`font-semibold ${getRateColor(exchange.approved_rate)}`}>
                              {exchange.approved_rate}%
                            </span>
                          </div>
                          <Progress 
                            value={(exchange.approved_rate / 100) * 100} 
                            className="h-2"
                          />
                        </>
                      )}
                    </div>

                    {/* 액션 버튼 */}
                    <div className="space-y-2 pt-2">
                      <Button
                        className="w-full"
                        onClick={() => handleActionClick('copy_link', exchange.id)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Copy className="w-4 h-4 mr-2" />
                        )}
                        {isGuest ? '로그인 후 링크 복사' : '내 링크 복사'}
                      </Button>
                      
                      {!isGuest && getActionButton(exchange, status)}
                    </div>

                    {/* Last sync info for approved exchanges */}
                    {status.status === 'Approved' && status.lastSync && (
                      <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                        마지막 동기화: {new Date(status.lastSync).toLocaleString()}
                      </div>
                    )}

                    {/* 게스트 전용 정보 */}
                    {isGuest && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-primary/10 to-transparent rounded-lg border border-primary/20">
                        <div className="flex items-start gap-2">
                          <Lock className="w-4 h-4 text-primary mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-primary">가입하면 즉시 사용 가능</p>
                            <p className="text-muted-foreground text-xs">
                              • 전용 추천 링크 생성 • 실시간 수익 추적 • 자동 정산
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty state banner for authenticated users with no approved UIDs */}
        {!isGuest && !statsLoading && exchanges.length > 0 && dashboardStats.monthlyEarnings === 0 && (
          <Card className="border-accent/30 bg-gradient-to-r from-accent/10 to-transparent mt-6">
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <AlertCircle className="w-12 h-12 text-accent mx-auto" />
                <div>
                  <h3 className="font-semibold mb-2">수익 추적을 시작하세요</h3>
                  <p className="text-sm text-muted-foreground">
                    거래소 승인을 신청하고 UID를 연동하여 수익을 확인해보세요.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setApprovalModalOpen(true)}>
                  첫 번째 승인 신청하기
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 게스트용 추가 안내 */}
      {isGuest && (
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-transparent">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">더 많은 기능이 기다리고 있어요!</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <p className="font-medium">실시간 수익 분석</p>
                  <p className="text-muted-foreground text-xs">
                    클릭, 가입, 수익까지 한눈에
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <p className="font-medium">자동 정산 시스템</p>
                  <p className="text-muted-foreground text-xs">
                    매월 자동으로 USDT 지급
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <p className="font-medium">AI 파트너 도구</p>
                  <p className="text-muted-foreground text-xs">
                    콘텐츠 생성부터 고객 관리까지
                  </p>
                </div>
              </div>
              <Button 
                size="lg"
                onClick={() => setShowLoginModal(true)}
                className="mt-4"
              >
                지금 무료로 시작하기 →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        trigger={loginTrigger}
        onSuccess={() => {
          // 로그인 성공 후 원래 액션 재실행
          if (loginTrigger === 'copy_link') {
            // 컨텍스트 유지하여 원래 클릭한 거래소 링크 복사
          }
        }}
      />

      <ApprovalProcessModal
        open={approvalModalOpen}
        onOpenChange={setApprovalModalOpen}
        exchangeId={selectedExchangeForApproval}
        exchangeName={exchanges.find(ex => ex.id === selectedExchangeForApproval)?.name || selectedExchangeForApproval}
      />
    </div>
  );
}