import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  TrendingDown, 
  Copy, 
  ExternalLink, 
  RefreshCw,
  DollarSign,
  Users,
  Link,
  Calendar,
  BarChart3,
  PlusCircle,
  Target,
  Loader2,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";

const Dashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [kpiData, setKpiData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    generateDashboardKPI();
  }, []);

  const generateDashboardKPI = async () => {
    setLoading(true);
    try {
      const mockMetrics = {
        earnings: [
          { date: "2025-09-01", amount: 1234.5, currency: "USDT" },
          { date: "2025-09-02", amount: 2150.0, currency: "USDT" },
          { date: "2025-09-03", amount: 1890.5, currency: "USDT" }
        ],
        uids: { total: 120, pending: 14, approved: 98, rejected: 8 },
        clicks: { total: 920, unique: 750 },
        conversions: { signups: 54, rate: 0.072 }
      };

      const { data, error } = await supabase.functions.invoke('generate-dashboard-kpi', {
        body: {
          locale: "ko",
          period: "last_30d",
          filters: { exchanges: ["bybit", "binance"], mode: "all" },
          metrics: mockMetrics
        }
      });

      if (error) throw error;

      if (data.success) {
        setKpiData(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Dashboard KPI 생성 오류:', error);
      toast({
        title: "로드 실패",
        description: error.message || "대시보드 로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await generateDashboardKPI();
    setRefreshing(false);
    toast({
      title: "데이터 새로고침 완료",
      description: "최신 데이터로 업데이트되었습니다.",
    });
  };

  // Mock data for fallback
  const stats = {
    totalCommission: 15420.50,
    todayCommission: 342.80,
    monthlyGrowth: 23.5,
    activeLinks: 8,
    totalClicks: 1247,
    conversionRate: 12.4
  };

  const exchanges = [
    { 
      id: 1,
      name: "Binance", 
      commission: 85, 
      status: "connected", 
      logo: "🔶",
      earnings: 8950.30,
      referrals: 68,
      apiKey: "binance_****_9x2k"
    },
    { 
      id: 2,
      name: "OKX", 
      commission: 80, 
      status: "pending", 
      logo: "⚫",
      earnings: 3420.15,
      referrals: 34,
      apiKey: "okx_****_7h8m"
    },
    { 
      id: 3,
      name: "Bybit", 
      commission: 75, 
      status: "connected", 
      logo: "🟡",
      earnings: 2890.45,
      referrals: 28,
      apiKey: "bybit_****_5k9n"
    },
    { 
      id: 4,
      name: "Gate.io", 
      commission: 70, 
      status: "disconnected", 
      logo: "🔵",
      earnings: 160.60,
      referrals: 8,
      apiKey: "gate_****_3m4p"
    }
  ];

  const recentActivities = [
    { type: "signup", user: "user_892", exchange: "Bybit", amount: 150.50, time: "2분 전" },
    { type: "approval", user: "uid_445612", exchange: "Binance", amount: 0, time: "15분 전" },
    { type: "commission", user: "user_234", exchange: "OKX", amount: 45.20, time: "1시간 전" },
    { type: "settlement", user: "파트너", exchange: "All", amount: 2500.00, time: "3시간 전" }
  ];

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "복사 완료",
      description: `${type}이(가) 클립보드에 복사되었습니다.`,
    });
  };

  if (loading && !kpiData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">AI 대시보드 생성 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">대시보드</h1>
          <p className="text-muted-foreground">실시간 수익 현황 및 성과 분석</p>
        </div>
        <Button onClick={refreshData} disabled={refreshing} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {/* AI Generated KPI Cards */}
      {kpiData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiData.cards.map((card: any, index: number) => (
            <Card key={index} className="bg-gradient-card border-border/50 glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-accent" />
                </div>
                {card.delta && (
                  <div className="mt-4">
                    <p className="text-sm text-accent">{card.delta}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI Generated Insights */}
      {kpiData && kpiData.insights.length > 0 && (
        <Card className="bg-gradient-card border-border/50 glass mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              AI 인사이트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpiData.insights.map((insight: string, index: number) => (
                <div key={index} className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                  <p className="text-sm text-foreground">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Generated Next Best Actions */}
      {kpiData && kpiData.next_best_actions.length > 0 && (
        <Card className="bg-gradient-card border-border/50 glass mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              추천 액션
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kpiData.next_best_actions.map((action: any, index: number) => (
                <Button key={index} variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <p className="font-medium">{action.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">클릭하여 실행</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fallback 메인 KPI 카드 */}
      {!kpiData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-card border-border/50 glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">총 커미션</p>
                  <p className="text-2xl font-bold text-accent">
                    ${stats.totalCommission.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-accent" />
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-accent mr-1" />
                  <span className="text-accent">+{stats.monthlyGrowth}%</span>
                  <span className="text-muted-foreground ml-1">이번 달</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">오늘 수익</p>
                  <p className="text-2xl font-bold text-neon-blue">
                    ${stats.todayCommission.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-neon-blue" />
              </div>
              <div className="mt-4">
                <Progress value={65} className="h-2" />
                <p className="text-sm text-muted-foreground mt-1">일일 목표의 65%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">활성 링크</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.activeLinks}
                  </p>
                </div>
                <Link className="w-8 h-8 text-primary" />
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">총 클릭: {stats.totalClicks}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">전환율</p>
                  <p className="text-2xl font-bold text-crypto-gold">
                    {stats.conversionRate}%
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-crypto-gold" />
              </div>
              <div className="mt-4">
                <Badge variant="outline" className="border-crypto-gold text-crypto-gold">
                  업계 평균 상회
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 거래소 연동 상태 */}
      <Card className="bg-gradient-card border-border/50 glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>거래소 연동 현황</CardTitle>
            <Button variant="outline" size="sm">
              <PlusCircle className="w-4 h-4 mr-2" />
              새 거래소 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exchanges.map((exchange) => (
              <div key={exchange.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{exchange.logo}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{exchange.name}</h3>
                      <Badge 
                        variant={exchange.status === 'connected' ? 'default' : exchange.status === 'pending' ? 'secondary' : 'outline'}
                        className={
                          exchange.status === 'connected' 
                            ? 'bg-accent/20 text-accent border-accent/30' 
                            : exchange.status === 'pending'
                            ? 'bg-primary/20 text-primary border-primary/30'
                            : 'border-muted-foreground/30'
                        }
                      >
                        {exchange.status === 'connected' && '연결됨'}
                        {exchange.status === 'pending' && '대기중'}
                        {exchange.status === 'disconnected' && '연결 끊김'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      커미션 {exchange.commission}% | 추천: {exchange.referrals}명 | 수익: ${exchange.earnings.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(exchange.apiKey, "API 키")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 최근 활동 */}
      <Card className="bg-gradient-card border-border/50 glass">
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
          <CardDescription>실시간 거래 및 수익 활동</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'signup' ? 'bg-accent' :
                    activity.type === 'approval' ? 'bg-primary' :
                    activity.type === 'commission' ? 'bg-neon-blue' :
                    'bg-crypto-gold'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium">
                      {activity.type === 'signup' && '신규 가입'}
                      {activity.type === 'approval' && 'UID 승인'}
                      {activity.type === 'commission' && '커미션 발생'}
                      {activity.type === 'settlement' && '정산 완료'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user} · {activity.exchange}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.amount > 0 && (
                    <p className="text-sm font-semibold text-accent">
                      +${activity.amount.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;