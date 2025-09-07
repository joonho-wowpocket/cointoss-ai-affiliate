import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRuntime } from '@/contexts/RuntimeContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Plus, 
  Search,
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle,
  Filter,
  RefreshCw,
  DollarSign
} from 'lucide-react';

interface CustomerUID {
  id: string;
  partner_id: string;
  exchange_id: string;
  customer_uid: string;
  status: 'pending' | 'approved' | 'rejected';
  validation_status?: 'pending' | 'valid' | 'invalid' | 'duplicate';
  partner_notes?: string;
  commission_rate: number;
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

interface Exchange {
  id: string;
  name: string;
  base_rate: number;
  approved_rate?: number;
}

interface CustomerStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  monthly_earnings: number;
}

export function CustomerUIDManager() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { isPreviewBlocked } = useRuntime();
  
  const [customerUIDs, setCustomerUIDs] = useState<CustomerUID[]>([]);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CustomerStats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    monthly_earnings: 0
  });

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterExchange, setFilterExchange] = useState<string>('all');

  // Add modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newUID, setNewUID] = useState('');
  const [selectedExchange, setSelectedExchange] = useState('');
  const [partnerNotes, setPartnerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadExchanges(),
        loadCustomerUIDs(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading customer UID data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExchanges = async () => {
    try {
      const { data, error } = await supabase
        .from('exchanges')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      setExchanges(data || []);
    } catch (error) {
      console.error('Error loading exchanges:', error);
    }
  };

  const loadCustomerUIDs = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('customer_uid_registrations')
        .select('*')
        .eq('partner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomerUIDs((data as any[])?.map(item => ({
        ...item,
        status: item.status as 'pending' | 'approved' | 'rejected'
      })) || []);
    } catch (error) {
      console.error('Error loading customer UIDs:', error);
    }
  };

  const loadStats = async () => {
    if (!user || !customerUIDs.length) return;
    
    const total = customerUIDs.length;
    const approved = customerUIDs.filter(uid => uid.status === 'approved').length;
    const pending = customerUIDs.filter(uid => uid.status === 'pending').length;
    const rejected = customerUIDs.filter(uid => uid.status === 'rejected').length;

    // Load earnings for approved UIDs
    try {
      const { data: earnings, error } = await supabase
        .from('earnings')
        .select('amount')
        .eq('user_id', user.id)
        .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      const monthlyEarnings = earnings?.reduce((sum, earning) => sum + parseFloat(earning.amount.toString()), 0) || 0;

      setStats({
        total,
        approved,
        pending,
        rejected,
        monthly_earnings: monthlyEarnings
      });
    } catch (error) {
      console.error('Error loading earnings stats:', error);
      setStats({ total, approved, pending, rejected, monthly_earnings: 0 });
    }
  };

  const handleAddCustomerUID = async () => {
    if (!newUID || !selectedExchange || !user) return;
    
    setIsSubmitting(true);
    try {
      // Validate UID first
      const { data: validationResult, error: validationError } = await supabase
        .rpc('validate_and_register_uid', {
          p_user_id: user.id,
          p_exchange_id: selectedExchange,
          p_uid: newUID,
          p_uid_type: 'customer'
        });

      if (validationError) throw validationError;
      
      const result = validationResult as any;
      if (!result?.valid) {
        throw new Error(result?.message || 'Validation failed');
      }

      // Register customer UID
      const { error } = await supabase
        .from('customer_uid_registrations')
        .insert({
          partner_id: user.id,
          exchange_id: selectedExchange,
          customer_uid: newUID,
          status: 'pending',
          validation_status: result?.validation_status || 'pending',
          partner_notes: partnerNotes || null,
          commission_rate: 0.25 // Default base rate
        });

      if (error) throw error;

      toast({
        title: "고객 UID 등록 완료",
        description: "고객 UID가 성공적으로 등록되었습니다. 승인 후 수익 추적이 시작됩니다.",
      });

      // Reset form
      setNewUID('');
      setSelectedExchange('');
      setPartnerNotes('');
      setAddModalOpen(false);
      
      loadData();
    } catch (error: any) {
      toast({
        title: "등록 실패",
        description: error.message || "고객 UID 등록 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string, validationStatus?: string) => {
    if (validationStatus === 'invalid') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          형식 오류
        </Badge>
      );
    }

    if (validationStatus === 'duplicate') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          중복 UID
        </Badge>
      );
    }

    const badges = {
      pending: { label: '심사 대기', variant: 'secondary' as const, icon: Clock },
      approved: { label: '승인됨', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: '거부됨', variant: 'destructive' as const, icon: XCircle }
    };

    const badge = badges[status as keyof typeof badges];
    if (!badge) return null;

    const IconComponent = badge.icon;

    return (
      <Badge variant={badge.variant} className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        {badge.label}
      </Badge>
    );
  };

  const getExchangeName = (exchangeId: string) => {
    const exchange = exchanges.find(e => e.id === exchangeId);
    return exchange?.name || exchangeId;
  };

  // Filter UIDs
  const filteredUIDs = customerUIDs.filter(uid => {
    const matchesSearch = 
      uid.customer_uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getExchangeName(uid.exchange_id).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || uid.status === filterStatus;
    const matchesExchange = filterExchange === 'all' || uid.exchange_id === filterExchange;
    
    return matchesSearch && matchesStatus && matchesExchange;
  });

  // Empty state for new users
  if (!isAuthenticated || isPreviewBlocked) {
    return (
      <Card>
        <CardContent className="p-12 text-center space-y-4">
          <Users className="w-12 h-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold mb-2">고객 UID 관리</h3>
            <p className="text-muted-foreground">
              고객의 거래소 UID를 등록하여 수익 공유를 시작하세요.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              총 고객 수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              승인된 고객
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              심사 대기
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              거부된 고객
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              이번 달 수익
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${stats.monthly_earnings.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                고객 UID 관리
              </CardTitle>
              <CardDescription>
                고객의 거래소 UID를 등록하고 수익을 추적하세요
              </CardDescription>
            </div>
            
            <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  고객 UID 추가
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>고객 UID 등록</DialogTitle>
                  <DialogDescription>
                    고객의 거래소 UID를 등록하여 수익 공유를 시작하세요
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      반드시 고객의 동의를 받은 후 UID를 등록해주세요. 
                      승인 후 해당 UID의 거래 수익이 공유됩니다.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="exchange">거래소 선택</Label>
                    <Select value={selectedExchange} onValueChange={setSelectedExchange}>
                      <SelectTrigger>
                        <SelectValue placeholder="거래소를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {exchanges.map((exchange) => (
                          <SelectItem key={exchange.id} value={exchange.id}>
                            {exchange.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="customer-uid">고객 UID</Label>
                    <Input
                      id="customer-uid"
                      value={newUID}
                      onChange={(e) => setNewUID(e.target.value)}
                      placeholder="고객의 UID를 입력하세요"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">메모 (선택사항)</Label>
                    <Input
                      id="notes"
                      value={partnerNotes}
                      onChange={(e) => setPartnerNotes(e.target.value)}
                      placeholder="고객 정보나 메모를 입력하세요"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setAddModalOpen(false)}>
                      취소
                    </Button>
                    <Button 
                      onClick={handleAddCustomerUID}
                      disabled={!newUID || !selectedExchange || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          등록 중...
                        </>
                      ) : (
                        '등록하기'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="UID 또는 거래소 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="pending">대기중</SelectItem>
                <SelectItem value="approved">승인됨</SelectItem>
                <SelectItem value="rejected">거부됨</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterExchange} onValueChange={setFilterExchange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="거래소" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {exchanges.map((exchange) => (
                  <SelectItem key={exchange.id} value={exchange.id}>
                    {exchange.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>거래소</TableHead>
                  <TableHead>고객 UID</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>수수료율</TableHead>
                  <TableHead>메모</TableHead>
                  <TableHead>등록일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUIDs.length > 0 ? (
                  filteredUIDs.map((uid) => (
                    <TableRow key={uid.id}>
                      <TableCell className="font-medium">
                        {getExchangeName(uid.exchange_id)}
                      </TableCell>
                      <TableCell className="font-mono">{uid.customer_uid}</TableCell>
                      <TableCell>
                        {getStatusBadge(uid.status, uid.validation_status)}
                      </TableCell>
                      <TableCell>{(uid.commission_rate * 100).toFixed(1)}%</TableCell>
                      <TableCell className="max-w-32 truncate">
                        {uid.partner_notes || '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(uid.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {searchQuery || filterStatus !== 'all' || filterExchange !== 'all' 
                        ? "검색 결과가 없습니다." 
                        : "등록된 고객 UID가 없습니다."
                      }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}