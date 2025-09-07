import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Activity, 
  Wifi, 
  Coins,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface KPIData {
  newPartnersToday: string;
  pendingApplications: string;
  approvalRate7d: string;
  activeUsers: string;
  connectorUptime: string;
  tokenTreasury: string;
}

interface Alert {
  ts: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

interface DashboardData {
  kpi: KPIData;
  alerts: Alert[];
}

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const { data: response, error } = await supabase.functions.invoke('admin-dashboard');
      
      if (error) throw error;
      
      setData(response);
      setError(null);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('대시보드 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Poll every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'error':
        return 'destructive' as const;
      case 'warning':
      case 'info':
      default:
        return 'default' as const;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">높음</Badge>;
      case 'medium':
        return <Badge variant="secondary">보통</Badge>;
      case 'low':
      default:
        return <Badge variant="outline">낮음</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">관리자 대시보드</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">관리자 대시보드</h1>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchDashboardData}>다시 시도</Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">관리자 대시보드</h1>
        <Button variant="outline" onClick={fetchDashboardData}>
          새로고침
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">금일 신규 파트너</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpi.newPartnersToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpi.pendingApplications}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">7일 승인율</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpi.approvalRate7d}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpi.activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">커넥터 가용성</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpi.connectorUptime}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">토큰 트레저리</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpi.tokenTreasury}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle>운영 경보</CardTitle>
        </CardHeader>
        <CardContent>
          {data.alerts.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <span>현재 경보가 없습니다</span>
            </div>
          ) : (
            <div className="space-y-3">
              {data.alerts.map((alert, index) => (
                <Alert key={index} variant={getAlertVariant(alert.type)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-2">
                      {getAlertIcon(alert.type)}
                      <div>
                        <AlertDescription>{alert.message}</AlertDescription>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(alert.ts).toLocaleString('ko-KR')}
                        </div>
                      </div>
                    </div>
                    {getSeverityBadge(alert.severity)}
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 작업</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Button 
              onClick={() => navigate('/admin/applications')}
              variant="default"
            >
              승인 심사로 이동
            </Button>
            <Button 
              onClick={() => navigate('/admin/lead-captures')}
              variant="outline"
            >
              리드 캡처 관리
            </Button>
            <Button 
              onClick={() => navigate('/admin/token')}
              variant="outline"
            >
              토큰 관리
            </Button>
            <Button 
              onClick={() => navigate('/admin/connectors')}
              variant="outline"
            >
              커넥터 상태
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}