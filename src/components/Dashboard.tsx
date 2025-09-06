import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ArrowUpRight,
  Zap,
  Bot,
  Target,
  Activity,
  Clock,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { dashboardApi } from "@/lib/api";
import { AITaskCenter } from "./AITaskCenter";
import { AIQuickActions } from "./AIQuickActions";

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

      const response = await dashboardApi.generateKPI({
        locale: "ko",
        period: "last_30d",
        filters: { exchanges: ["bybit", "binance"], mode: "all" },
        metrics: mockMetrics
      });

      if (response.success) {
        setKpiData(response.data);
      } else {
        throw new Error(response.error);
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">대시보드</h1>
          <p className="text-muted-foreground">실시간 수익 현황, AI 팀 활동 및 성과 분석</p>
        </div>
        <Button onClick={refreshData} disabled={refreshing} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BarChart3 className="w-4 h-4 mr-2" />
            개요
          </TabsTrigger>
          <TabsTrigger value="ai-center" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Bot className="w-4 h-4 mr-2" />
            AI 센터
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiData?.top_line_cards?.map((card: any, index: number) => (
              <Card key={index} className="bg-gradient-card border-border/50 glass hover:shadow-glow transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{card.title}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {card.value}
                      </p>
                      {card.trend_value && (
                        <p className="text-sm text-accent mt-1">{card.trend_value}</p>
                      )}
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <DollarSign className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  {card.description && (
                    <p className="text-xs text-muted-foreground mt-3">{card.description}</p>
                  )}
                </CardContent>
              </Card>
            )) || (
              // Fallback KPI cards
              <>
                <Card className="bg-gradient-card border-border/50 glass hover:shadow-glow transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">총 수익</p>
                        <p className="text-2xl font-bold text-accent">$15,420</p>
                        <p className="text-sm text-accent">+23.5% 이번 달</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-accent" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-card border-border/50 glass hover:shadow-glow transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">활성 추천</p>
                        <p className="text-2xl font-bold text-foreground">142</p>
                        <p className="text-sm text-primary">목표의 75%</p>
                      </div>
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-card border-border/50 glass hover:shadow-glow transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">AI 작업</p>
                        <p className="text-2xl font-bold text-neon-blue">24</p>
                        <p className="text-sm text-neon-blue">24시간 활동</p>
                      </div>
                      <Bot className="w-8 h-8 text-neon-blue" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-card border-border/50 glass hover:shadow-glow transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">전환율</p>
                        <p className="text-2xl font-bold text-crypto-gold">7.2%</p>
                        <p className="text-sm text-crypto-gold pulse-slow">업계 평균</p>
                      </div>
                      <Target className="w-8 h-8 text-crypto-gold" />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* AI Quick Actions */}
          <AIQuickActions />

          {/* Insights and Next Actions */}
          {kpiData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Insights */}
              <Card className="bg-gradient-card border-border/50 glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    주요 인사이트
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {kpiData.trends?.map((trend: any, index: number) => (
                      <div key={index} className="p-3 bg-muted/20 rounded-lg">
                        <div className="font-medium text-sm">{trend.metric}</div>
                        <div className="text-xs text-muted-foreground mt-1">{trend.pattern}</div>
                        {trend.insight && (
                          <div className="text-xs text-primary mt-1">{trend.insight}</div>
                        )}
                      </div>
                    ))}
                    {kpiData.anomalies?.map((anomaly: any, index: number) => (
                      <div key={index} className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                        <div className="font-medium text-sm text-accent">{anomaly.metric}</div>
                        <div className="text-xs text-muted-foreground mt-1">{anomaly.detail}</div>
                        {anomaly.suggestion && (
                          <div className="text-xs text-accent mt-1">{anomaly.suggestion}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Next Best Actions */}
              <Card className="bg-gradient-card border-border/50 glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-crypto-gold" />
                    권장 액션
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {kpiData.next_best_actions?.map((action: any, index: number) => (
                      <div key={index} className="p-3 border border-border/50 rounded-lg hover:bg-muted/10 transition-colors">
                        <div className="font-medium text-sm">{action.action}</div>
                        <div className="text-xs text-muted-foreground mt-1">{action.description}</div>
                        <Button size="sm" variant="outline" className="mt-2">
                          실행하기
                          <ArrowUpRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai-center" className="space-y-6">
          <AITaskCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;