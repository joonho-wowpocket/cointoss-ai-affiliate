import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { LoginModal } from "@/components/auth/LoginModal";
import { GuestBanner } from "@/components/GuestBanner";
import { Exchanges } from "@/components/partner-hub/Exchanges";
import { UIDRegistry } from "@/components/partner-hub/UIDRegistry";
import { Approvals } from "@/components/partner-hub/Approvals";
import { Customers } from "@/components/partner-hub/Customers";
import { 
  TrendingUp, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  UserPlus, 
  Lock,
  BarChart3,
  Shield,
  Link as LinkIcon
} from "lucide-react";
import { useTranslations } from "@/contexts/I18nContext";

// 게스트용 샘플 데이터
const GUEST_OVERVIEW_DATA = {
  exchanges: {
    total: 12,
    connected: 0,
    pending: 0
  },
  links: {
    total: 0,
    clicks: 0,
    conversions: 0
  },
  uids: {
    total: 0,
    approved: 0,
    pending: 0
  },
  customers: {
    total: 0,
    active: 0,
    vip: 0
  }
};

const PartnerHub = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isGuest, loading } = useAuth();
  const t = useTranslations('partnerHub');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginTrigger, setLoginTrigger] = useState('general');
  const activeTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (value: string) => {
    // Performance optimization: avoid unnecessary re-renders
    if (value === activeTab) return;
    
    navigate(`/partner-hub?tab=${value}`, { replace: true });
    
    // Track tab change event
    if (typeof window !== 'undefined' && 'gtag' in window && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'tab_change', {
        event_category: 'partner_hub',
        event_label: value,
        guest_mode: isGuest,
        value: 1
      });
    }
    
    // Custom event for other analytics systems
    window.dispatchEvent(new CustomEvent('partnerHub.tab_change', { 
      detail: { tab_name: value, guest_mode: isGuest } 
    }));
  };

  const handleActionClick = (action: string) => {
    if (isGuest) {
      setLoginTrigger(action);
      setShowLoginModal(true);
      
      // Analytics tracking for guest actions
      if (typeof window !== 'undefined' && 'gtag' in window && typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'guest_click_cta', {
          action_type: action,
          page: 'partner_hub',
          tab: activeTab
        });
      }
      return;
    }
    
    // Handle authenticated user actions here
  };

  // Track page view
  useEffect(() => {
    if (typeof window !== 'undefined' && 'gtag' in window && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'page_view', {
        event_category: 'partner_hub',
        event_label: activeTab,
        guest_mode: isGuest,
        value: 1
      });
    }
    
    // Custom event for other analytics systems
    window.dispatchEvent(new CustomEvent('partnerHub.page_view', { 
      detail: { tab_name: activeTab, guest_mode: isGuest } 
    }));
  }, [activeTab, isGuest]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
              <p className="text-muted-foreground mt-2">
                {isGuest 
                  ? t('guestDescription')
                  : t('description')
                }
              </p>
            </div>
            
            {isGuest && (
              <Button 
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {t('freeStart')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <GuestBanner onLoginClick={() => setShowLoginModal(true)} className="mx-6 mt-6" />

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="sticky top-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-30 shadow-sm">
          <div className="container mx-auto px-6">
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList 
                className="h-12 w-full min-w-max justify-start bg-transparent p-0 gap-6 sm:gap-8"
              >
                <TabsTrigger 
                  value="overview"
                  className="relative h-12 px-4 sm:px-0 py-0 bg-transparent border-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none font-medium text-muted-foreground data-[state=active]:text-foreground hover:text-foreground transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 after:scale-x-0 data-[state=active]:after:scale-x-100 whitespace-nowrap"
                >
                  {t('tabs.overview')}
                </TabsTrigger>
                <TabsTrigger 
                  value="exchanges"
                  className="relative h-12 px-4 sm:px-0 py-0 bg-transparent border-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none font-medium text-muted-foreground data-[state=active]:text-foreground hover:text-foreground transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 after:scale-x-0 data-[state=active]:after:scale-x-100 whitespace-nowrap"
                >
                  {t('tabs.exchanges')}
                </TabsTrigger>
                <TabsTrigger 
                  value="uid"
                  className="relative h-12 px-4 sm:px-0 py-0 bg-transparent border-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none font-medium text-muted-foreground data-[state=active]:text-foreground hover:text-foreground transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 after:scale-x-0 data-[state=active]:after:scale-x-100 whitespace-nowrap"
                >
                  {t('tabs.uid')}
                </TabsTrigger>
                <TabsTrigger 
                  value="approvals"
                  className="relative h-12 px-4 sm:px-0 py-0 bg-transparent border-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none font-medium text-muted-foreground data-[state=active]:text-foreground hover:text-foreground transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 after:scale-x-0 data-[state=active]:after:scale-x-100 whitespace-nowrap"
                >
                  {t('tabs.approvals')}
                </TabsTrigger>
                <TabsTrigger 
                  value="customers"
                  className="relative h-12 px-4 sm:px-0 py-0 bg-transparent border-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none font-medium text-muted-foreground data-[state=active]:text-foreground hover:text-foreground transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 after:scale-x-0 data-[state=active]:after:scale-x-100 whitespace-nowrap"
                >
                  {t('tabs.customers')}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="container mx-auto px-6 py-8">
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 거래소 연결 */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">연결된 거래소</CardTitle>
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isGuest ? GUEST_OVERVIEW_DATA.exchanges.connected : '3'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    총 {isGuest ? GUEST_OVERVIEW_DATA.exchanges.total : '12'}개 지원
                  </p>
                  {isGuest && (
                    <Button 
                      size="sm" 
                      className="w-full mt-2" 
                      onClick={() => handleActionClick('connect_exchange')}
                    >
                      거래소 연결하기
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* UID 등록 */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">등록된 UID</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isGuest ? '—' : '127'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isGuest ? '로그인 시 확인' : '승인 대기: 3개'}
                  </p>
                  {isGuest && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full mt-2" 
                      onClick={() => handleActionClick('register_uid')}
                    >
                      UID 등록하기
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* 승인 현황 */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">승인 현황</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {isGuest ? '—' : '85%'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isGuest ? '로그인 시 확인' : '평균 승인율'}
                  </p>
                  {isGuest && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full mt-2" 
                      onClick={() => handleActionClick('check_approval')}
                    >
                      승인 신청하기
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* 월 수익 */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">이번 달 수익</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isGuest ? '$ —' : '$ 4,280'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isGuest ? '로그인 시 확인' : '+15% 전월 대비'}
                  </p>
                  {isGuest && (
                    <div className="mt-2 p-2 bg-primary/10 rounded text-xs text-center">
                      <Lock className="w-3 h-3 inline mr-1" />
                      수익 내역은 로그인 후 확인
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 게스트용 기능 소개 */}
            {isGuest && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      실시간 성과 추적
                    </CardTitle>
                    <CardDescription>
                      링크 클릭부터 수익 발생까지 모든 과정을 실시간으로 모니터링하세요
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>클릭률 추적</span>
                        <Badge variant="secondary">실시간</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>가입 전환율</span>
                        <Badge variant="secondary">자동 계산</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>수익 분석</span>
                        <Badge variant="secondary">상세 리포트</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      자동화된 정산 시스템
                    </CardTitle>
                    <CardDescription>
                      복잡한 정산 과정 없이 매월 자동으로 USDT를 받아보세요
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>투명한 수익 계산</span>
                        <Badge variant="outline">블록체인</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>자동 USDT 지급</span>
                        <Badge variant="outline">매월 1일</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>최소 출금 수수료</span>
                        <Badge variant="outline">0.5%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 게스트용 CTA */}
            {isGuest && (
              <Card className="text-center bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">지금 시작하여 최고 85% 요율을 받아보세요</h3>
                  <p className="text-primary-foreground/90 mb-6">
                    3분이면 가입 완료! 업계 최고 조건으로 암호화폐 레퍼럴을 시작하세요
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button 
                      size="lg" 
                      variant="secondary"
                      onClick={() => setShowLoginModal(true)}
                      className="bg-white text-primary hover:bg-white/90"
                    >
                      무료로 시작하기 →
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
                      <CheckCircle className="w-4 h-4" />
                      <span>신용카드 불필요 • 즉시 시작 가능</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Other tabs - show content for both guest and authenticated users */}
          <TabsContent value="exchanges" className="mt-0 space-y-6">
            <Exchanges />
          </TabsContent>
          
          <TabsContent value="uid" className="mt-0 space-y-6">
            <UIDRegistry />
          </TabsContent>
          
          <TabsContent value="approvals" className="mt-0 space-y-6">
            <Approvals />
          </TabsContent>
          
          <TabsContent value="customers" className="mt-0 space-y-6">
            <Customers />
          </TabsContent>
        </div>
      </Tabs>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        trigger={loginTrigger}
        onSuccess={() => {
          // 로그인 성공 후 원래 탭 유지
          if (loginTrigger !== 'general') {
            // 원래 액션 재실행 로직
          }
        }}
      />
    </div>
  );
};

export default PartnerHub;
