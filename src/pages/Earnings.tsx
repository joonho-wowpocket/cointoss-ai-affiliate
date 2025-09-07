import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { earningsApi } from "@/lib/api";
import { 
  Coins, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Filter,
  Download,
  Loader2,
  Plus,
  ExternalLink,
  AlertTriangle
} from "lucide-react";

const Earnings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { isAdmin, hasAnyRole, roles } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [earningsData, setEarningsData] = useState<any>(null);
  const [period, setPeriod] = useState('30d');
  const [mode, setMode] = useState('all');
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>([]);

  // Check if user should see preview data
  const canSeePreviewData = isAdmin || hasAnyRole(['SuperAdmin', 'Dev']);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadEarnings();
    }
  }, [period, mode, selectedExchanges, isAuthenticated, user, canSeePreviewData]);

  const loadEarnings = async () => {
    if (!isAuthenticated || !user) return;
    
    setLoading(true);
    try {
      const data = await earningsApi.getEarnings({
        period: period as '7d' | '30d' | '90d',
        mode: mode as 'basic' | 'approved' | 'all',
        exchanges: selectedExchanges.length > 0 ? selectedExchanges : undefined,
      }, roles);

      if (data.success) {
        setEarningsData(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('수익 데이터 로드 오류:', error);
      // Only show error for admin users
      if (canSeePreviewData) {
        toast({
          title: "로드 실패",
          description: error.message || "수익 데이터 로드 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

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
            <Tabs value="earnings" className="w-auto">
              <TabsList className="bg-muted/50">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  onClick={() => navigate("/")}
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="dashboard" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  onClick={() => navigate("/")}
                >
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="partnerhub" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  onClick={() => navigate("/partner-hub")}
                >
                  Partner Hub
                </TabsTrigger>
                <TabsTrigger 
                  value="earnings" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Earnings
                </TabsTrigger>
                <TabsTrigger 
                  value="leadgen" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  onClick={() => navigate("/lead-generator")}
                >
                  Lead Generator
                </TabsTrigger>
                <TabsTrigger 
                  value="ai" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  onClick={() => navigate("/")}
                >
                  AI Assistant
                </TabsTrigger>
                <TabsTrigger 
                  value="tokens" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  onClick={() => navigate("/")}
                >
                  Tokens
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">수익 현황</h1>
              <p className="text-muted-foreground">거래소별 커미션 수익 및 정산 관리</p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              리포트 다운로드
            </Button>
          </div>

          {/* Filters */}
          <Card className="bg-gradient-card border-border/50 glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 w-5" />
                필터
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">기간</label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">최근 7일</SelectItem>
                      <SelectItem value="30d">최근 30일</SelectItem>
                      <SelectItem value="90d">최근 90일</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">연동 유형</label>
                  <Select value={mode} onValueChange={setMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="basic">기본연동</SelectItem>
                      <SelectItem value="approved">승인연동</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">거래소</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="전체" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="bybit">Bybit</SelectItem>
                      <SelectItem value="binance">Binance</SelectItem>
                      <SelectItem value="okx">OKX</SelectItem>
                      <SelectItem value="gate">Gate.io</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">수익 데이터 로드 중...</span>
            </div>
          ) : !canSeePreviewData && (!earningsData || (earningsData.summary?.total === 0 && earningsData.rows?.length === 0)) ? (
            // Empty State for New Users
            <div className="text-center py-12">
              <Card className="max-w-2xl mx-auto border-dashed border-2 border-muted-foreground/20">
                <CardContent className="p-12">
                  <div className="w-16 h-16 mx-auto mb-6 bg-muted/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">승인된 UID가 없습니다</h3>
                  <p className="text-muted-foreground mb-6">
                    수익을 확인하려면 먼저 UID를 등록하고 승인을 받아야 합니다.
                  </p>
                  
                  <Alert className="mb-6 text-left">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      승인된 고객 UID만 수익 계산에 포함됩니다. 승인 과정은 보통 24-48시간이 소요됩니다.
                    </AlertDescription>
                  </Alert>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={() => navigate('/partner-hub?tab=uid')} className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      UID 등록하기
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/partner-hub?tab=approvals')} className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      승인 현황 보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {/* Admin Preview Notice */}
              {canSeePreviewData && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>관리자 모드:</strong> 이 데이터는 미리보기용입니다. 실제 사용자에게는 빈 상태가 표시됩니다.
                  </AlertDescription>
                </Alert>
              )}

              {/* Summary Cards */}
              {earningsData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-card border-border/50 glass">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">총 수익</p>
                          <p className="text-2xl font-bold text-accent">
                            ${earningsData.summary?.total?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-accent" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-card border-border/50 glass">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">기본연동 수익</p>
                          <p className="text-2xl font-bold text-primary">
                            ${earningsData.summary?.basic?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-card border-border/50 glass">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">승인연동 수익</p>
                          <p className="text-2xl font-bold text-crypto-gold">
                            ${earningsData.summary?.approved?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <Coins className="w-8 h-8 text-crypto-gold" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Earnings Table */}
              <Card className="bg-gradient-card border-border/50 glass">
                <CardHeader>
                  <CardTitle>수익 내역</CardTitle>
                  <CardDescription>거래소별 상세 수익 현황</CardDescription>
                </CardHeader>
                <CardContent>
                  {earningsData && earningsData.rows?.length > 0 ? (
                    <div className="space-y-4">
                      {earningsData.rows.map((row: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h4 className="font-semibold">{row.exchange}</h4>
                              <p className="text-sm text-muted-foreground">{row.mode} 연동</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-accent">{row.amount}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {canSeePreviewData ? "수익 데이터가 없습니다." : "승인된 UID가 없습니다."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Earnings;