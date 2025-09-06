import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CampaignModal } from "@/components/CampaignModal";
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
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [exchangeCards, setExchangeCards] = useState<ExchangeCard[]>([]);
  const [selectedExchange, setSelectedExchange] = useState<string>("");
  const [uidModalOpen, setUidModalOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [uidValue, setUidValue] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");

  const exchanges = [
    { code: "bybit", name: "Bybit", base_rate: "25%", approved_rate: "85%", state: "NotApplied" as const },
    { code: "binance", name: "Binance", base_rate: "30%", approved_rate: "85%", state: "Approved" as const },
    { code: "okx", name: "OKX", base_rate: "25%", approved_rate: "80%", state: "Applied" as const },
    { code: "gate", name: "Gate.io", base_rate: "20%", approved_rate: "75%", state: "NotApplied" as const }
  ];

  const generatePartnerHub = async (tab: 'basic' | 'approved') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-partner-hub', {
        body: {
          locale: "ko",
          tab: tab,
          exchanges: exchanges
        }
      });

      if (error) throw error;

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
        setApplyModalOpen(true);
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

  const submitApplication = async () => {
    if (!partnerName || !partnerEmail || !selectedExchange) return;

    toast({
      title: "승인 신청 완료",
      description: `${selectedExchange} 승인 연동 신청이 제출되었습니다.`,
    });
    
    setPartnerName("");
    setPartnerEmail("");
    setApplyModalOpen(false);
  };

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

      {/* Apply Modal */}
      <Dialog open={applyModalOpen} onOpenChange={setApplyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>승인 연동 신청</DialogTitle>
            <DialogDescription>
              {selectedExchange} 승인 연동을 위한 정보를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="partnerName">파트너 닉네임</Label>
              <Input
                id="partnerName"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="닉네임을 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="partnerEmail">이메일</Label>
              <Input
                id="partnerEmail"
                type="email"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setApplyModalOpen(false)}>
                취소
              </Button>
              <Button onClick={submitApplication}>
                신청하기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}