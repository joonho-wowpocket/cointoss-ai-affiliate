import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Wallet, 
  Bot, 
  Coins, 
  BarChart3, 
  Shield, 
  Zap,
  Star,
  ArrowUpRight,
  DollarSign,
  Users,
  Target,
  Sparkles,
  FileText
} from "lucide-react";
import Dashboard from "@/components/Dashboard";
import AIAssistant from "@/components/AIAssistant";
import TokenManager from "@/components/TokenManager";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  // Mock data for demo
  const stats = {
    totalCommission: 15420.50,
    monthlyGrowth: 23.5,
    activeReferrals: 142,
    ctossBalance: 2500,
    stakingTier: "Gold"
  };

  const exchanges = [
    { name: "Binance", commission: 85, status: "connected", logo: "🔶" },
    { name: "OKX", commission: 80, status: "connected", logo: "⚫" },
    { name: "Bybit", commission: 75, status: "pending", logo: "🟡" },
    { name: "Gate.io", commission: 70, status: "available", logo: "🔵" }
  ];

  if (activeTab !== "overview") {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <nav className="border-b border-border bg-card/50 backdrop-blur-lg">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Coins className="w-6 h-6 text-primary-foreground font-bold" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  CoinToss
                </h1>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger 
                    value="leadgen" 
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    onClick={() => navigate("/lead-generator")}
                  >
                    Lead Generator
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    AI Assistant
                  </TabsTrigger>
                  <TabsTrigger value="tokens" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Tokens
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-8">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "ai" && <AIAssistant />}
          {activeTab === "tokens" && <TokenManager />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center glow-primary">
                <Coins className="w-6 h-6 text-primary-foreground font-bold" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                CoinToss
              </h1>
              <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                MVP
              </Badge>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="leadgen" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  onClick={() => navigate("/lead-generator")}
                >
                  Lead Generator
                </TabsTrigger>
                <TabsTrigger value="ai" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  AI Assistant
                </TabsTrigger>
                <TabsTrigger value="tokens" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Tokens
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-crypto opacity-10 animate-gradient"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                CoinToss
              </h1>
              <h2 className="text-3xl font-semibold text-foreground">
                암호화폐 추천 생태계 플랫폼
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                업계 최고 커미션율 85% + AI 자동화 + 토큰 보상을 통한 
                차세대 Web3 핀테크 플랫폼
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Badge variant="outline" className="border-accent text-accent">
                <TrendingUp className="w-4 h-4 mr-1" />
                최고 85% 커미션
              </Badge>
              <Badge variant="outline" className="border-neon-blue text-neon-blue">
                <Bot className="w-4 h-4 mr-1" />
                AI 자동화
              </Badge>
              <Badge variant="outline" className="border-primary text-primary">
                <Coins className="w-4 h-4 mr-1" />
                CTOSS 토큰 보상
              </Badge>
            </div>

            <Button 
              size="lg" 
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300 font-semibold px-8 py-6 text-lg"
              onClick={() => setActiveTab("dashboard")}
            >
              플랫폼 시작하기
              <ArrowUpRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-card border-border/50 glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">총 수익</p>
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
                    <p className="text-sm text-muted-foreground">활성 추천</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.activeReferrals}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div className="mt-4">
                  <Progress value={75} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-1">목표의 75%</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">CTOSS 토큰</p>
                    <p className="text-2xl font-bold text-crypto-gold">
                      {stats.ctossBalance.toLocaleString()}
                    </p>
                  </div>
                  <Coins className="w-8 h-8 text-crypto-gold" />
                </div>
                <div className="mt-4">
                  <Badge variant="outline" className="border-crypto-gold text-crypto-gold">
                    <Star className="w-3 h-3 mr-1" />
                    {stats.stakingTier} 티어
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">AI 작업</p>
                    <p className="text-2xl font-bold text-neon-blue pulse-slow">
                      12
                    </p>
                  </div>
                  <Bot className="w-8 h-8 text-neon-blue" />
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">24시간 자동 실행</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Exchanges Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <h3 className="text-3xl font-bold text-foreground">지원 거래소</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              주요 글로벌 거래소와 연동하여 최고의 커미션율을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {exchanges.map((exchange, index) => (
              <Card key={exchange.name} className="bg-gradient-card border-border/50 glass hover:shadow-crypto transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{exchange.logo}</div>
                      <CardTitle className="text-lg">{exchange.name}</CardTitle>
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
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">커미션율</span>
                      <span className="text-lg font-bold text-accent">{exchange.commission}%</span>
                    </div>
                    <Progress value={exchange.commission} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <h3 className="text-3xl font-bold text-foreground">핵심 기능</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              AI와 Web3 기술을 결합한 차세대 핀테크 솔루션
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gradient-card border-border/50 glass hover:shadow-glow transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">실시간 대시보드</CardTitle>
                <CardDescription>
                  수익 현황, 추천 성과, 거래소 연동 상태를 실시간으로 모니터링
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-card border-border/50 glass hover:shadow-glow transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-neon-blue rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">AI 어시스턴트</CardTitle>
                <CardDescription>
                  크레아(콘텐츠 생성)와 대니(데이터 분석) - 24시간 자동화 지원
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-card border-border/50 glass hover:shadow-glow transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-crypto-gold rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-background" />
                </div>
                <CardTitle className="text-xl">토큰 보상</CardTitle>
                <CardDescription>
                  CTOSS 토큰 스테이킹으로 추가 수익과 티어별 혜택 제공
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <div className="space-y-6">
            <h3 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              지금 시작하세요
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              업계 최고의 커미션율과 AI 자동화로 새로운 수익 기회를 창출하세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300 font-semibold px-8"
                onClick={() => setActiveTab("dashboard")}
              >
                대시보드 보기
                <BarChart3 className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => setActiveTab("ai")}
              >
                AI 어시스턴트 체험
                <Bot className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;