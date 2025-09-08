import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRuntime } from "@/contexts/RuntimeContext";
import { PreviewBlockedBanner } from "@/components/PreviewBlockedBanner";
import { CampaignModal } from "@/components/CampaignModal";
import { ApprovalProcessModal } from "@/components/ApprovalProcessModal";
import { supabase } from "@/integrations/supabase/client";
import { 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  XCircle,
  Loader2,
  Sparkles,
  Zap
} from "lucide-react";

interface ExchangeCard {
  exchange_code: string;
  exchange_name: string;
  rate_label?: string;
  rate_value?: string;
  base_rate?: string;
  approved_rate?: string;
  state_badge: string | { text: string; color: string };
  cta?: {
    text: string;
    url: string;
  };
  ctas?: Array<{
    label: string;
    action: string;
    payload: Record<string, any>;
  }>;
  cta_label?: string;
  cta_url?: string;
  nudge?: string;
}

export function Exchanges() {
  const { toast } = useToast();
  const { isAuthenticated, isGuest } = useAuth();
  const { isPreviewBlocked, allowPreviewData } = useRuntime();
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [exchangeCards, setExchangeCards] = useState<ExchangeCard[]>([]);
  const [selectedExchange, setSelectedExchange] = useState<string>("");
  const [uidModalOpen, setUidModalOpen] = useState(false);
  const [approvalProcessModalOpen, setApprovalProcessModalOpen] = useState(false);
  const [uidValue, setUidValue] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");

  const exchanges = [
    { code: "bybit", name: "Bybit", base_rate: 0.25, approved_rate: 0.85, state: "NotApplied" as const },
    { code: "binance", name: "Binance", base_rate: 0.30, approved_rate: 0.85, state: "Approved" as const },
    { code: "okx", name: "OKX", base_rate: 0.25, approved_rate: 0.80, state: "Applied" as const },
    { code: "gate", name: "Gate.io", base_rate: 0.20, approved_rate: 0.75, state: "NotApplied" as const }
  ];

  // 퍼센티지 변환 헬퍼 함수
  const formatPercentage = (decimal: number): string => {
    console.log(`Converting ${decimal} to percentage:`, `${(decimal * 100).toFixed(0)}%`);
    return `${(decimal * 100).toFixed(0)}%`;
  };

  // 미리보기용 더미 데이터
  const getPreviewCards = (tab: 'basic' | 'approved'): ExchangeCard[] => {
    console.log('Generating preview cards for tab:', tab);
    const baseCards = [
      {
        exchange_code: "binance",
        exchange_name: "Binance",
        rate_label: tab === 'basic' ? `기본 커미션: ${formatPercentage(0.30)}` : `승인 커미션: ${formatPercentage(0.85)}`,
        state_badge: tab === 'basic' ? "연결됨" : "승인됨",
        ctas: tab === 'basic' ? [
          { label: "링크 복사", action: "copy_basic_link", payload: { exchange: "binance" } },
          { label: "UID 등록", action: "open_uid_modal", payload: { exchange: "binance" } }
        ] : [
          { label: "코드 복사", action: "copy_approved_code", payload: { exchange: "binance" } }
        ]
      },
      {
        exchange_code: "bybit",
        exchange_name: "Bybit", 
        rate_label: tab === 'basic' ? `기본 커미션: ${formatPercentage(0.25)}` : `승인 커미션: ${formatPercentage(0.85)}`,
        state_badge: tab === 'basic' ? "미연결" : "미신청",
        ctas: tab === 'basic' ? [
          { label: "연결하기", action: "open_external", payload: { url: "https://partner.bybit.com/b/cointoss" } }
        ] : [
          { label: "승인 신청", action: "open_apply_modal", payload: { exchange: "bybit" } }
        ]
      },
      {
        exchange_code: "okx",
        exchange_name: "OKX",
        rate_label: tab === 'basic' ? `기본 커미션: ${formatPercentage(0.25)}` : `승인 커미션: ${formatPercentage(0.80)}`,
        state_badge: tab === 'basic' ? "미연결" : "심사중",
        ctas: tab === 'basic' ? [
          { label: "연결하기", action: "open_external", payload: { url: "https://www.okx.com/join/cointoss" } }
        ] : [
          { label: "진행 상황", action: "open_external", payload: { url: "#" } }
        ]
      },
      {
        exchange_code: "gate",
        exchange_name: "Gate.io",
        rate_label: tab === 'basic' ? `기본 커미션: ${formatPercentage(0.20)}` : `승인 커미션: ${formatPercentage(0.75)}`,
        state_badge: tab === 'basic' ? "미연결" : "미신청",
        ctas: tab === 'basic' ? [
          { label: "연결하기", action: "open_external", payload: { url: "https://www.gate.io/ref/cointoss" } }
        ] : [
          { label: "승인 신청", action: "open_apply_modal", payload: { exchange: "gate" } }
        ]
      }
    ];
    
    console.log('Generated preview cards:', baseCards);
    return baseCards;
  };

  const generatePartnerHub = async (tab: 'basic' | 'approved') => {
    setLoading(true);
    try {
      // 게스트 또는 미리보기가 차단된 경우 더미 데이터 사용
      if (isGuest || isPreviewBlocked) {
        setTimeout(() => {
          setExchangeCards(getPreviewCards(tab));
          setLoading(false);
        }, 800); // 실제 API 호출처럼 약간의 로딩 시간 추가
        return;
      }

      // 인증된 사용자는 실제 데이터베이스에서 exchanges 가져오기
      const { data: dbExchanges, error } = await supabase
        .from('exchanges')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      const exchangesWithRates = (dbExchanges || []).map((exchange: any) => ({
        code: exchange.id,
        name: exchange.name,
        base_rate: exchange.base_rate,
        approved_rate: exchange.approved_rate,
        state: exchanges.find(e => e.code === exchange.id)?.state || 'NotApplied'
      }));

      const { data, error: functionError } = await supabase.functions.invoke('generate-partner-hub', {
        body: {
          locale: "ko",
          tab: tab,
          exchanges: exchangesWithRates
        }
      });

      if (functionError) throw functionError;

      if (data.success) {
        // Normalize the data to ensure ctas is always an array
        const normalizedCards = data.data.cards.map((card: any) => ({
          ...card,
          ctas: Array.isArray(card.ctas) ? card.ctas : []
        }));
        setExchangeCards(normalizedCards);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Partner Hub 생성 오류:', error);
      toast({
        title: "로드 실패",
        description: error.message || "파트너 허브 로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePartnerHub(activeTab as 'basic' | 'approved');
  }, [activeTab]);

  const handleAction = (action: string, payload: any) => {
    switch (action) {
      case 'copy_basic_link':
        navigator.clipboard.writeText(`https://partner.${payload.exchange}.com/signup?ref=cointoss_basic`);
        toast({
          title: "링크 복사 완료",
          description: "기본 추천 링크가 클립보드에 복사되었습니다.",
        });
        break;
      case 'copy_approved_code':
        navigator.clipboard.writeText(`COINTOSS_${payload.exchange.toUpperCase()}_APPROVED`);
        toast({
          title: "코드 복사 완료",
          description: "승인 추천 코드가 클립보드에 복사되었습니다.",
        });
        break;
      case 'open_uid_modal':
        setSelectedExchange(payload.exchange);
        setUidModalOpen(true);
        break;
      case 'open_apply_modal':
        setSelectedExchange(payload.exchange);
        setApprovalProcessModalOpen(true);
        break;
      case 'open_external':
        window.open(payload.url, '_blank');
        break;
    }
  };

  const submitUID = async () => {
    if (!uidValue || !selectedExchange) return;

    toast({
      title: "UID 등록 완료",
      description: `${selectedExchange} UID가 심사 대기열에 추가되었습니다.`,
    });
    
    setUidValue("");
    setUidModalOpen(false);
  };

  // Remove old submitApplication function as it's now handled by ApprovalProcessModal

  const getStateIcon = (state: string) => {
    switch (state) {
      case '승인':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case '대기중':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case '미신청':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 미리보기 배너 - 게스트 사용자에게 표시 */}
      {isGuest && (
        <PreviewBlockedBanner 
          message="거래소 관리 미리보기" 
          showAdminOverride={false}
        />
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="basic" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            기본 연동
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            승인 연동
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exchangeCards.map((card, index) => (
                <Card key={index} className="bg-gradient-card border-border/50 glass">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{card.exchange_name || 'Unknown Exchange'}</CardTitle>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getStateIcon(typeof card.state_badge === 'string' ? card.state_badge : card.state_badge?.text || '')}
                        {typeof card.state_badge === 'string' ? card.state_badge : card.state_badge?.text || 'Unknown'}
                      </Badge>
                    </div>
                    <CardDescription>{card.rate_label || card.rate_value || 'Rate not available'}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {card.nudge && (
                      <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                        <p className="text-sm text-accent">{card.nudge}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {(card.ctas || []).map((cta, ctaIndex) => (
                        <Button
                          key={ctaIndex}
                          variant={ctaIndex === 0 ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAction(cta.action, cta.payload)}
                        >
                          {cta.action === 'copy_basic_link' && <Copy className="w-4 h-4 mr-2" />}
                          {cta.action === 'open_external' && <ExternalLink className="w-4 h-4 mr-2" />}
                          {cta.label}
                        </Button>
                      ))}
                      
                      {/* AI Campaign Buttons */}
                      <div className="w-full border-t border-border/50 pt-3 mt-2">
                        <div className="flex flex-wrap gap-2">
                          <CampaignModal
                            exchangeId={card.exchange_code || ''}
                            exchangeName={card.exchange_name || 'Unknown'}
                            preset="campaign:new"
                          >
                            <Button variant="secondary" size="sm" className="bg-primary/10 text-primary hover:bg-primary/20">
                              <Sparkles className="w-4 h-4 mr-2" />
                              신규 캠페인 생성
                            </Button>
                          </CampaignModal>
                          
                          <CampaignModal
                            exchangeId={card.exchange_code || ''}
                            exchangeName={card.exchange_name || 'Unknown'}
                            preset="campaign:reactivate"
                          >
                            <Button variant="secondary" size="sm" className="bg-accent/10 text-accent hover:bg-accent/20">
                              <Zap className="w-4 h-4 mr-2" />
                              휴면 리액티베이션
                            </Button>
                          </CampaignModal>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exchangeCards.map((card, index) => (
                <Card key={index} className="bg-gradient-card border-border/50 glass">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{card.exchange_name || 'Unknown Exchange'}</CardTitle>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getStateIcon(typeof card.state_badge === 'string' ? card.state_badge : card.state_badge?.text || '')}
                        {typeof card.state_badge === 'string' ? card.state_badge : card.state_badge?.text || 'Unknown'}
                      </Badge>
                    </div>
                    <CardDescription>{card.rate_label || card.rate_value || 'Rate not available'}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {(card.ctas || []).map((cta, ctaIndex) => (
                        <Button
                          key={ctaIndex}
                          variant={ctaIndex === 0 ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAction(cta.action, cta.payload)}
                        >
                          {cta.action === 'copy_approved_code' && <Copy className="w-4 h-4 mr-2" />}
                          {cta.action === 'open_external' && <ExternalLink className="w-4 h-4 mr-2" />}
                          {cta.label}
                        </Button>
                      ))}
                      
                      {/* AI Campaign Buttons */}
                      <div className="w-full border-t border-border/50 pt-3 mt-2">
                        <div className="flex flex-wrap gap-2">
                          <CampaignModal
                            exchangeId={card.exchange_code || ''}
                            exchangeName={card.exchange_name || 'Unknown'}
                            preset="campaign:new"
                          >
                            <Button variant="secondary" size="sm" className="bg-primary/10 text-primary hover:bg-primary/20">
                              <Sparkles className="w-4 h-4 mr-2" />
                              신규 캠페인 생성
                            </Button>
                          </CampaignModal>
                          
                          <CampaignModal
                            exchangeId={card.exchange_code || ''}
                            exchangeName={card.exchange_name || 'Unknown'}
                            preset="campaign:reactivate"
                          >
                            <Button variant="secondary" size="sm" className="bg-accent/10 text-accent hover:bg-accent/20">
                              <Zap className="w-4 h-4 mr-2" />
                              휴면 리액티베이션
                            </Button>
                          </CampaignModal>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* UID Registration Modal */}
      <Dialog open={uidModalOpen} onOpenChange={setUidModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>UID 등록</DialogTitle>
            <DialogDescription>
              고객의 {selectedExchange} UID를 등록하여 수익 추적을 시작하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="uid">고객 UID</Label>
              <Input
                id="uid"
                value={uidValue}
                onChange={(e) => setUidValue(e.target.value)}
                placeholder="UID를 입력하세요"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setUidModalOpen(false)}>
                취소
              </Button>
              <Button onClick={submitUID}>
                등록하기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approval Process Modal */}
      <ApprovalProcessModal
        open={approvalProcessModalOpen}
        onOpenChange={setApprovalProcessModalOpen}
        exchangeId={selectedExchange}
        exchangeName={exchanges.find(ex => ex.code === selectedExchange)?.name}
      />
    </div>
  );
}