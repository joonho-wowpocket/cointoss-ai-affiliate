import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, ExternalLink, Copy, Users, TrendingUp, Shield, Star, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoginModal } from '@/components/auth/LoginModal';
import { GuestBanner } from '@/components/GuestBanner';

// 샘플 데이터 (게스트용)
const SAMPLE_EXCHANGES = [
  {
    id: 'bybit',
    name: 'Bybit',
    logo_url: '/placeholder.svg',
    base_rate: 25,
    approved_rate: 85,
    status: 'active',
    description: '선물거래 전문 플랫폼',
    features: ['무제한 레버리지', '낮은 수수료', '24/7 지원'],
    volume_rank: 1,
    user_count: '15M+',
    has_approval: false
  },
  {
    id: 'binance',
    name: 'Binance',
    logo_url: '/placeholder.svg',
    base_rate: 20,
    approved_rate: 80,
    status: 'active', 
    description: '세계 최대 암호화폐 거래소',
    features: ['500+ 거래쌍', '스테이킹', 'P2P 거래'],
    volume_rank: 2,
    user_count: '120M+',
    has_approval: true
  },
  {
    id: 'okx',
    name: 'OKX',
    logo_url: '/placeholder.svg',
    base_rate: 30,
    approved_rate: 88,
    status: 'active',
    description: '종합 암호화폐 생태계',
    features: ['DEX', 'Web3 지갑', 'NFT 마켓'],
    volume_rank: 3,
    user_count: '50M+',
    has_approval: false
  }
];

export default function Dashboard() {
  const { user, isGuest, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginTrigger, setLoginTrigger] = useState('general');

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
      // 실제 링크 생성 및 복사 로직
      const link = `https://partner.exchange.com/ref/${user?.id}/${exchangeId}`;
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
    
    // 승인 신청 로직
    toast.success('승인 신청이 접수되었습니다');
  };

  const getStatusBadge = (status: string, hasApproval: boolean) => {
    if (hasApproval) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">승인 완료</Badge>;
    }
    
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">기본 연동</Badge>;
      case 'pending':
        return <Badge variant="secondary">승인 대기</Badge>;
      case 'maintenance':
        return <Badge variant="destructive">점검 중</Badge>;
      default:
        return <Badge variant="outline">비활성</Badge>;
    }
  };

  const getRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-blue-600';
    if (rate >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

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
        
        {isGuest && (
          <Button 
            onClick={() => setShowLoginModal(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            무료 시작하기
          </Button>
        )}
      </div>

      {/* 주요 통계 (게스트용 샘플 데이터) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">지원 거래소</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              전 세계 주요 거래소
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최고 요율</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">85%</div>
            <p className="text-xs text-muted-foreground">
              승인 파트너 기준
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isGuest ? '예상 월 수익' : '이번 달 수익'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isGuest ? '$ —' : '$ 2,480'}
            </div>
            <p className="text-xs text-muted-foreground">
              {isGuest ? '로그인 시 확인 가능' : '+12% 전월 대비'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">파트너 등급</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isGuest ? '—' : 'VIP'}
            </div>
            <p className="text-xs text-muted-foreground">
              {isGuest ? '가입 후 확인' : '승인 완료'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 거래소 목록 */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">지원 거래소</h2>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            업계 최고 요율
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_EXCHANGES.map((exchange) => (
            <Card key={exchange.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <img 
                        src={exchange.logo_url} 
                        alt={exchange.name}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{exchange.name}</h3>
                      <p className="text-sm text-muted-foreground">#{exchange.volume_rank} 거래량</p>
                    </div>
                  </div>
                  {getStatusBadge(exchange.status, exchange.has_approval)}
                </div>
                <p className="text-sm text-muted-foreground">{exchange.description}</p>
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
                </div>

                {/* 특징 */}
                <div>
                  <h4 className="text-sm font-medium mb-2">주요 특징</h4>
                  <div className="flex flex-wrap gap-1">
                    {exchange.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
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
                  
                  {!exchange.has_approval && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleActionClick('apply_approved', exchange.id)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {isGuest ? `로그인 후 승인 신청 (+${exchange.approved_rate - exchange.base_rate}% ↑)` : '승인 신청하기'}
                    </Button>
                  )}
                </div>

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
          ))}
        </div>
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
    </div>
  );
}