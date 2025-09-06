import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Coins,
  Star,
  TrendingUp,
  Wallet,
  Gift,
  Shield,
  Lock,
  Unlock,
  Plus,
  Minus,
  ExternalLink,
  Crown,
  Diamond,
  Medal,
  Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TokenManager = () => {
  const { toast } = useToast();
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  // Mock wallet data
  const walletData = {
    address: "0x742...89aB",
    ctossBalance: 2500,
    stakedAmount: 1500,
    availableToStake: 1000,
    currentTier: "Gold",
    nextTier: "Platinum",
    tierProgress: 75,
    totalRewards: 342.50,
    pendingRewards: 12.80,
    apr: 24.5
  };

  const stakingTiers = [
    {
      name: "Bronze",
      icon: <Medal className="w-6 h-6 text-crypto-bronze" />,
      requirement: 100,
      commissionBoost: 5,
      rewards: ["기본 대시보드", "이메일 지원"],
      color: "crypto-bronze"
    },
    {
      name: "Silver", 
      icon: <Award className="w-6 h-6 text-crypto-silver" />,
      requirement: 500,
      commissionBoost: 10,
      rewards: ["고급 분석", "우선 지원", "월간 리포트"],
      color: "crypto-silver"
    },
    {
      name: "Gold",
      icon: <Star className="w-6 h-6 text-crypto-gold" />,
      requirement: 1000,
      commissionBoost: 15,
      rewards: ["AI 어시스턴트", "실시간 알림", "프리미엄 템플릿"],
      color: "crypto-gold",
      current: true
    },
    {
      name: "Platinum",
      icon: <Crown className="w-6 h-6 text-primary" />,
      requirement: 2500,
      commissionBoost: 20,
      rewards: ["전용 매니저", "베타 기능", "커스텀 개발"],
      color: "primary"
    },
    {
      name: "Diamond",
      icon: <Diamond className="w-6 h-6 text-neon-blue" />,
      requirement: 5000,
      commissionBoost: 25,
      rewards: ["모든 기능", "1:1 컨설팅", "파트너십"],
      color: "neon-blue"
    }
  ];

  const rewardHistory = [
    { date: "2024-01-20", amount: 15.50, type: "스테이킹 보상", txHash: "0x123...abc" },
    { date: "2024-01-19", amount: 12.30, type: "스테이킹 보상", txHash: "0x456...def" },
    { date: "2024-01-18", amount: 25.00, type: "티어 보너스", txHash: "0x789...ghi" },
    { date: "2024-01-17", amount: 18.70, type: "스테이킹 보상", txHash: "0xabc...123" }
  ];

  const connectWallet = async () => {
    setIsStaking(true);
    // Simulate wallet connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    setWalletConnected(true);
    setIsStaking(false);
    toast({
      title: "지갑 연결 완료",
      description: "MetaMask 지갑이 성공적으로 연결되었습니다.",
    });
  };

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    
    setIsStaking(true);
    // Simulate staking transaction
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsStaking(false);
    setStakeAmount("");
    
    toast({
      title: "스테이킹 완료",
      description: `${stakeAmount} CTOSS 토큰이 성공적으로 스테이킹되었습니다.`,
    });
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) return;
    
    setIsStaking(true);
    // Simulate unstaking transaction
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsStaking(false);
    setUnstakeAmount("");
    
    toast({
      title: "언스테이킹 완료",
      description: `${unstakeAmount} CTOSS 토큰이 성공적으로 언스테이킹되었습니다.`,
    });
  };

  const claimRewards = async () => {
    setIsStaking(true);
    // Simulate claim transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsStaking(false);
    
    toast({
      title: "보상 수령 완료",
      description: `${walletData.pendingRewards} CTOSS 토큰을 받았습니다.`,
    });
  };

  if (!walletConnected) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">토큰 관리</h1>
          <p className="text-muted-foreground">CTOSS 토큰 스테이킹으로 추가 수익과 티어별 혜택을 받으세요</p>
        </div>

        <Card className="max-w-md mx-auto bg-gradient-card border-border/50 glass">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 glow-primary">
              <Wallet className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">지갑 연결</CardTitle>
            <CardDescription>
              CTOSS 토큰 관리를 위해 MetaMask 지갑을 연결해주세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={connectWallet}
              disabled={isStaking}
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 py-6"
              size="lg"
            >
              {isStaking ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"></div>
                  연결 중...
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5 mr-2" />
                  MetaMask 연결
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Polygon 네트워크에서 작동합니다
            </p>
          </CardContent>
        </Card>

        {/* Staking Tiers Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stakingTiers.map((tier, index) => (
            <Card key={tier.name} className="bg-gradient-card border-border/50 glass text-center">
              <CardContent className="p-4">
                <div className="mb-2">{tier.icon}</div>
                <h3 className="font-semibold text-sm">{tier.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {tier.requirement.toLocaleString()} CTOSS
                </p>
                <Badge variant="outline" className="mt-2 text-xs">
                  +{tier.commissionBoost}% 커미션
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">토큰 관리</h1>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-muted-foreground">지갑: {walletData.address}</p>
            <Badge variant="outline" className="border-accent text-accent">
              연결됨
            </Badge>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <ExternalLink className="w-4 h-4 mr-2" />
          Polygon 스캔
        </Button>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-card border-border/50 glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CTOSS 잔액</p>
                <p className="text-2xl font-bold text-crypto-gold">
                  {walletData.ctossBalance.toLocaleString()}
                </p>
              </div>
              <Coins className="w-8 h-8 text-crypto-gold" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">스테이킹 중</p>
                <p className="text-2xl font-bold text-primary">
                  {walletData.stakedAmount.toLocaleString()}
                </p>
              </div>
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">총 보상</p>
                <p className="text-2xl font-bold text-accent">
                  {walletData.totalRewards}
                </p>
              </div>
              <Gift className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">현재 APR</p>
                <p className="text-2xl font-bold text-neon-blue">
                  {walletData.apr}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-neon-blue" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Tier Status */}
      <Card className="bg-gradient-card border-border/50 glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Star className="w-8 h-8 text-crypto-gold" />
              <div>
                <h3 className="text-xl font-bold text-crypto-gold">{walletData.currentTier} 티어</h3>
                <p className="text-sm text-muted-foreground">현재 커미션 보너스: +15%</p>
              </div>
            </div>
            <Badge variant="outline" className="border-crypto-gold text-crypto-gold">
              활성
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{walletData.nextTier} 티어까지</span>
              <span className="text-foreground">{walletData.tierProgress}%</span>
            </div>
            <Progress value={walletData.tierProgress} className="h-3" />
            <p className="text-xs text-muted-foreground">
              1,000 CTOSS 더 스테이킹하면 Platinum 티어에 도달합니다
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="stake" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="stake" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Lock className="w-4 h-4 mr-2" />
            스테이킹
          </TabsTrigger>
          <TabsTrigger value="rewards" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Gift className="w-4 h-4 mr-2" />
            보상
          </TabsTrigger>
          <TabsTrigger value="tiers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Crown className="w-4 h-4 mr-2" />
            티어 시스템
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stake" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stake Tokens */}
            <Card className="bg-gradient-card border-border/50 glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-primary" />
                  토큰 스테이킹
                </CardTitle>
                <CardDescription>
                  CTOSS 토큰을 스테이킹하여 보상을 받고 티어를 올리세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>스테이킹 수량</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="bg-muted/50"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setStakeAmount(walletData.availableToStake.toString())}
                    >
                      최대
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    사용 가능: {walletData.availableToStake.toLocaleString()} CTOSS
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">예상 APR:</span>
                    <span className="text-neon-blue font-semibold">{walletData.apr}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">예상 월 수익:</span>
                    <span className="text-accent font-semibold">
                      {stakeAmount ? (parseFloat(stakeAmount) * walletData.apr / 100 / 12).toFixed(2) : '0'} CTOSS
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={handleStake}
                  disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0}
                  className="w-full bg-gradient-primary hover:shadow-glow"
                >
                  {isStaking ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"></div>
                      스테이킹 중...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      스테이킹
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Unstake Tokens */}
            <Card className="bg-gradient-card border-border/50 glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Unlock className="w-5 h-5 mr-2 text-destructive" />
                  토큰 언스테이킹
                </CardTitle>
                <CardDescription>
                  스테이킹된 토큰을 언스테이킹합니다 (7일 락업 기간)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>언스테이킹 수량</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      className="bg-muted/50"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setUnstakeAmount(walletData.stakedAmount.toString())}
                    >
                      최대
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    스테이킹 중: {walletData.stakedAmount.toLocaleString()} CTOSS
                  </p>
                </div>

                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm">
                  <div className="flex items-center text-destructive mb-1">
                    <Shield className="w-4 h-4 mr-1" />
                    주의사항
                  </div>
                  <p className="text-xs text-muted-foreground">
                    언스테이킹 후 7일간 토큰이 잠깁니다. 티어 혜택도 즉시 사라집니다.
                  </p>
                </div>

                <Button 
                  onClick={handleUnstake}
                  disabled={isStaking || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
                  variant="destructive"
                  className="w-full"
                >
                  {isStaking ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-destructive-foreground border-t-transparent rounded-full mr-2"></div>
                      언스테이킹 중...
                    </>
                  ) : (
                    <>
                      <Minus className="w-4 h-4 mr-2" />
                      언스테이킹
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Claim Rewards */}
            <Card className="bg-gradient-card border-border/50 glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="w-5 h-5 mr-2 text-accent" />
                  보상 수령
                </CardTitle>
                <CardDescription>
                  스테이킹 보상을 수령하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">수령 가능한 보상</p>
                  <p className="text-3xl font-bold text-accent glow-profit">
                    {walletData.pendingRewards} CTOSS
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ≈ ${(walletData.pendingRewards * 1.25).toFixed(2)} USD
                  </p>
                </div>

                <Button 
                  onClick={claimRewards}
                  disabled={isStaking || walletData.pendingRewards <= 0}
                  className="w-full bg-gradient-primary hover:shadow-glow"
                >
                  {isStaking ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"></div>
                      수령 중...
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-2" />
                      보상 수령
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Reward Stats */}
            <Card className="bg-gradient-card border-border/50 glass">
              <CardHeader>
                <CardTitle>보상 통계</CardTitle>
                <CardDescription>스테이킹 보상 내역</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">총 보상</span>
                    <p className="text-lg font-semibold text-accent">
                      {walletData.totalRewards} CTOSS
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">월 평균</span>
                    <p className="text-lg font-semibold text-neon-blue">
                      {(walletData.totalRewards / 3).toFixed(1)} CTOSS
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">이번 달 진행률</span>
                    <span className="text-foreground">68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reward History */}
          <Card className="bg-gradient-card border-border/50 glass">
            <CardHeader>
              <CardTitle>보상 내역</CardTitle>
              <CardDescription>최근 보상 수령 내역</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rewardHistory.map((reward, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{reward.type}</p>
                      <p className="text-xs text-muted-foreground">{reward.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-accent">+{reward.amount} CTOSS</p>
                      <button className="text-xs text-primary hover:underline">
                        {reward.txHash}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-6">
          <div className="text-center space-y-4 mb-8">
            <h3 className="text-2xl font-bold text-foreground">스테이킹 티어 시스템</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              더 많은 CTOSS를 스테이킹할수록 더 높은 커미션율과 프리미엄 혜택을 받을 수 있습니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stakingTiers.map((tier, index) => (
              <Card 
                key={tier.name} 
                className={`bg-gradient-card border-border/50 glass hover:shadow-glow transition-all duration-300 ${
                  tier.current ? 'ring-2 ring-crypto-gold shadow-crypto' : ''
                }`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mb-3">{tier.icon}</div>
                  <CardTitle className="text-lg">{tier.name}</CardTitle>
                  {tier.current && (
                    <Badge variant="outline" className="border-crypto-gold text-crypto-gold">
                      현재 티어
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">필요 수량</p>
                    <p className="text-xl font-bold text-primary">
                      {tier.requirement.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">CTOSS</p>
                  </div>

                  <div className="text-center">
                    <Badge variant="outline" className={`border-${tier.color} text-${tier.color}`}>
                      +{tier.commissionBoost}% 커미션
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">혜택:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {tier.rewards.map((reward, idx) => (
                        <li key={idx} className="flex items-center">
                          <div className="w-1 h-1 bg-primary rounded-full mr-2"></div>
                          {reward}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tier Benefits Comparison */}
          <Card className="bg-gradient-card border-border/50 glass">
            <CardHeader>
              <CardTitle>티어별 상세 혜택</CardTitle>
              <CardDescription>각 티어에서 제공되는 모든 혜택을 확인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2">혜택</th>
                      {stakingTiers.map(tier => (
                        <th key={tier.name} className="text-center py-2">{tier.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    <tr className="border-b border-border/30">
                      <td className="py-2 text-muted-foreground">커미션 보너스</td>
                      {stakingTiers.map(tier => (
                        <td key={tier.name} className="text-center py-2">+{tier.commissionBoost}%</td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2 text-muted-foreground">AI 어시스턴트</td>
                      <td className="text-center py-2">❌</td>
                      <td className="text-center py-2">❌</td>
                      <td className="text-center py-2">✅</td>
                      <td className="text-center py-2">✅</td>
                      <td className="text-center py-2">✅</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2 text-muted-foreground">전용 매니저</td>
                      <td className="text-center py-2">❌</td>
                      <td className="text-center py-2">❌</td>
                      <td className="text-center py-2">❌</td>
                      <td className="text-center py-2">✅</td>
                      <td className="text-center py-2">✅</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-muted-foreground">1:1 컨설팅</td>
                      <td className="text-center py-2">❌</td>
                      <td className="text-center py-2">❌</td>
                      <td className="text-center py-2">❌</td>
                      <td className="text-center py-2">❌</td>
                      <td className="text-center py-2">✅</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TokenManager;