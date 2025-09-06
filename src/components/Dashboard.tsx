import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  PlusCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  // Mock data
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
      status: "connected", 
      logo: "⚫",
      earnings: 4870.20,
      referrals: 42,
      apiKey: "okx_****_7m1p"
    },
    { 
      id: 3,
      name: "Bybit", 
      commission: 75, 
      status: "pending", 
      logo: "🟡",
      earnings: 1350.00,
      referrals: 23,
      apiKey: "bybit_****_5k9n"
    },
    { 
      id: 4,
      name: "Gate.io", 
      commission: 70, 
      status: "available", 
      logo: "🔵",
      earnings: 250.00,
      referrals: 9,
      apiKey: "gate_****_3j7w"
    }
  ];

  const referralLinks = [
    {
      id: 1,
      exchange: "Binance",
      url: "https://www.binance.com/join?ref=CTOSS_BN_2024",
      clicks: 342,
      conversions: 28,
      revenue: 2150.50,
      created: "2024-01-15"
    },
    {
      id: 2,
      exchange: "OKX",
      url: "https://www.okx.com/join/CTOSS_OKX_2024",
      clicks: 187,
      conversions: 15,
      revenue: 980.30,
      created: "2024-01-10"
    }
  ];

  const recentActivity = [
    { type: "conversion", exchange: "Binance", amount: 45.80, user: "User_***x9k2", time: "2분 전" },
    { type: "click", exchange: "OKX", clicks: 12, time: "5분 전" },
    { type: "payout", exchange: "Binance", amount: 1250.00, time: "1시간 전" },
    { type: "conversion", exchange: "Bybit", amount: 23.50, user: "User_***m7n1", time: "2시간 전" }
  ];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "복사 완료",
      description: `${label}이(가) 클립보드에 복사되었습니다.`,
    });
  };

  const refreshData = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
    toast({
      title: "데이터 업데이트 완료",
      description: "최신 수익 정보를 불러왔습니다.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">대시보드</h1>
          <p className="text-muted-foreground">실시간 수익 현황과 거래소 연동 관리</p>
        </div>
        <Button 
          onClick={refreshData} 
          disabled={refreshing}
          className="bg-primary hover:bg-primary/90"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? '업데이트 중...' : '새로고침'}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-card border-border/50 glass col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">총 수익</p>
                <p className="text-3xl font-bold text-accent glow-profit">
                  ${stats.totalCommission.toLocaleString()}
                </p>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-accent mr-1" />
                  <span className="text-accent">+{stats.monthlyGrowth}% </span>
                  <span className="text-muted-foreground">이번 달</span>
                </div>
              </div>
              <DollarSign className="w-12 h-12 text-accent opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 glass">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">오늘 수익</p>
              <p className="text-2xl font-bold text-primary">
                ${stats.todayCommission}
              </p>
              <Badge variant="outline" className="mt-2 border-accent text-accent">
                실시간
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 glass">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">활성 링크</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.activeLinks}
              </p>
              <div className="flex items-center justify-center mt-2 text-sm text-muted-foreground">
                <Link className="w-3 h-3 mr-1" />
                {stats.totalClicks} 클릭
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 glass">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">전환율</p>
              <p className="text-2xl font-bold text-neon-blue">
                {stats.conversionRate}%
              </p>
              <Progress value={stats.conversionRate} className="mt-2 h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="exchanges" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="exchanges" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            거래소 관리
          </TabsTrigger>
          <TabsTrigger value="links" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            추천 링크
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            실시간 활동
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exchanges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exchanges.map((exchange) => (
              <Card key={exchange.id} className="bg-gradient-card border-border/50 glass hover:shadow-crypto transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{exchange.logo}</div>
                      <div>
                        <CardTitle className="text-lg">{exchange.name}</CardTitle>
                        <CardDescription>커미션 {exchange.commission}%</CardDescription>
                      </div>
                    </div>
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
                      {exchange.status === 'available' && '사용가능'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">수익</span>
                      <p className="text-lg font-semibold text-accent">
                        ${exchange.earnings.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">추천 수</span>
                      <p className="text-lg font-semibold text-foreground">
                        {exchange.referrals}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">API 키</Label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        value={exchange.apiKey} 
                        readOnly 
                        className="text-xs bg-muted/50" 
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(exchange.apiKey, 'API 키')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {exchange.status === 'connected' ? (
                      <>
                        <Button size="sm" variant="outline" className="flex-1">
                          설정 수정
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </>
                    ) : exchange.status === 'pending' ? (
                      <Button size="sm" className="flex-1 bg-primary">
                        연동 완료하기
                      </Button>
                    ) : (
                      <Button size="sm" className="flex-1 bg-gradient-primary">
                        <PlusCircle className="w-3 h-3 mr-1" />
                        연동 시작
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">추천 링크 관리</h3>
            <Button className="bg-gradient-primary">
              <PlusCircle className="w-4 h-4 mr-2" />
              새 링크 생성
            </Button>
          </div>

          <div className="space-y-4">
            {referralLinks.map((link) => (
              <Card key={link.id} className="bg-gradient-card border-border/50 glass">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-primary text-primary">
                          {link.exchange}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {link.created}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Input 
                          value={link.url} 
                          readOnly 
                          className="text-xs bg-muted/50" 
                        />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(link.url, '추천 링크')}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 text-center">
                      <p className="text-sm text-muted-foreground">클릭</p>
                      <p className="text-lg font-semibold">{link.clicks}</p>
                    </div>
                    
                    <div className="md:col-span-2 text-center">
                      <p className="text-sm text-muted-foreground">전환</p>
                      <p className="text-lg font-semibold text-neon-blue">{link.conversions}</p>
                    </div>
                    
                    <div className="md:col-span-2 text-center">
                      <p className="text-sm text-muted-foreground">전환율</p>
                      <p className="text-lg font-semibold text-accent">
                        {((link.conversions / link.clicks) * 100).toFixed(1)}%
                      </p>
                    </div>
                    
                    <div className="md:col-span-2 text-center">
                      <p className="text-sm text-muted-foreground">수익</p>
                      <p className="text-lg font-semibold text-accent">
                        ${link.revenue.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="md:col-span-1">
                      <Button size="sm" variant="outline">
                        <BarChart3 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <h3 className="text-xl font-semibold">실시간 활동</h3>
          
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <Card key={index} className="bg-gradient-card border-border/50 glass">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {activity.type === 'conversion' && (
                        <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-accent" />
                        </div>
                      )}
                      {activity.type === 'click' && (
                        <div className="w-8 h-8 bg-neon-blue/20 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-neon-blue" />
                        </div>
                      )}
                      {activity.type === 'payout' && (
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      
                      <div>
                        <p className="font-medium">
                          {activity.type === 'conversion' && `새로운 전환 - ${activity.exchange}`}
                          {activity.type === 'click' && `링크 클릭 - ${activity.exchange}`}
                          {activity.type === 'payout' && `수익 정산 - ${activity.exchange}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.type === 'conversion' && `${activity.user} • $${activity.amount}`}
                          {activity.type === 'click' && `${activity.clicks}회 클릭`}
                          {activity.type === 'payout' && `$${activity.amount?.toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;