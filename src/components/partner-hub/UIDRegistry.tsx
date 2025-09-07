import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Plus, Search, CheckCircle, Clock, XCircle, AlertTriangle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UIDRecord {
  id: string;
  exchange: string;
  uid: string;
  status: 'active' | 'pending' | 'inactive' | 'rejected';
  registeredAt: string;
  totalCommission: number;
}

interface CustomerUID {
  id: string;
  customer_uid: string;
  exchange_id: string;
  status: string;
  registered_at: string;
  approved_at?: string;
  rejection_reason?: string;
}

export function UIDRegistry() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { isAdmin, hasAnyRole } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [newUID, setNewUID] = useState("");
  const [selectedExchange, setSelectedExchange] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  
  // Customer UID Registration
  const [customerUID, setCustomerUID] = useState("");
  const [customerExchange, setCustomerExchange] = useState("");
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerUIDs, setCustomerUIDs] = useState<CustomerUID[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Check if user should see preview data
  const canSeePreviewData = isAdmin || hasAnyRole(['SuperAdmin', 'Dev']);
  
  // Mock data - only for admin/dev users
  const getMockUIDs = (): UIDRecord[] => {
    if (!canSeePreviewData) return [];
    return [
      {
        id: "1",
        exchange: "Binance",
        uid: "12345678",
        status: "active",
        registeredAt: "2024-01-15",
        totalCommission: 1250.50
      },
      {
        id: "2",
        exchange: "Bybit", 
        uid: "87654321",
        status: "pending",
        registeredAt: "2024-01-10",
        totalCommission: 0
      }
    ];
  };

  const [uids, setUids] = useState<UIDRecord[]>([]);

  const exchanges = [
    { code: "binance", name: "Binance" },
    { code: "bybit", name: "Bybit" },
    { code: "okx", name: "OKX" },
    { code: "gate", name: "Gate.io" }
  ];

  useEffect(() => {
    if (isAuthenticated && user) {
      loadMyUIDs();
      loadCustomerUIDs();
    }
  }, [isAuthenticated, user, canSeePreviewData]);

  const loadMyUIDs = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      // Load real UIDs from database
      const { data, error } = await supabase
        .from('uids')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match UIDRecord interface
      const transformedUIDs = data?.map(uid => ({
        id: uid.id,
        exchange: uid.exchange_id,
        uid: uid.uid,
        status: uid.status.toLowerCase() as 'active' | 'pending' | 'inactive' | 'rejected',
        registeredAt: uid.created_at.split('T')[0],
        totalCommission: 0 // Will be calculated from earnings
      })) || [];

      // Add mock data for admin users
      const mockUIDs = getMockUIDs();
      setUids([...transformedUIDs, ...mockUIDs]);
    } catch (error) {
      console.error('Error loading UIDs:', error);
    }
  };

  const loadCustomerUIDs = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('customer_uid_registrations')
        .select('*')
        .eq('partner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomerUIDs(data || []);
    } catch (error) {
      console.error('Error loading customer UIDs:', error);
    }
  };

  const validateUID = (uid: string, exchange: string): boolean => {
    const patterns: Record<string, RegExp> = {
      binance: /^[0-9]{8,12}$/,
      bybit: /^[0-9]{5,12}$/,
      okx: /^[A-Za-z0-9]{6,20}$/,
      gate: /^[0-9]{6,15}$/
    };
    
    const pattern = patterns[exchange.toLowerCase()];
    return pattern ? pattern.test(uid) : /^[A-Za-z0-9_-]{3,32}$/.test(uid);
  };

  const handleAddUID = async () => {
    if (!newUID || !selectedExchange) return;
    
    const exchangeCode = exchanges.find(e => e.name === selectedExchange)?.code;
    if (!exchangeCode) return;

    if (!validateUID(newUID, exchangeCode)) {
      toast({
        title: "잘못된 UID 형식",
        description: `${selectedExchange}의 UID 형식이 올바르지 않습니다.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('uids')
        .insert({
          user_id: user!.id,
          exchange_id: exchangeCode,
          uid: newUID,
          status: 'Pending'
        });

      if (error) throw error;

      toast({
        title: "UID 등록 완료",
        description: `${selectedExchange} UID가 등록되었습니다. 심사 후 활성화됩니다.`,
      });
      
      setNewUID("");
      setSelectedExchange("");
      setAddModalOpen(false);
      loadMyUIDs();
    } catch (error: any) {
      toast({
        title: "등록 실패",
        description: error.message || "UID 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleAddCustomerUID = async () => {
    if (!customerUID || !customerExchange) return;
    
    const exchangeCode = exchanges.find(e => e.name === customerExchange)?.code;
    if (!exchangeCode) return;

    if (!validateUID(customerUID, exchangeCode)) {
      toast({
        title: "잘못된 UID 형식",
        description: `${customerExchange}의 UID 형식이 올바르지 않습니다.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('customer_uid_registrations')
        .insert({
          partner_id: user!.id,
          exchange_id: exchangeCode,
          customer_uid: customerUID,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "고객 UID 등록 완료",
        description: `고객 UID가 등록되었습니다. 승인 후 수익 연동이 시작됩니다.`,
      });
      
      setCustomerUID("");
      setCustomerExchange("");
      setCustomerModalOpen(false);
      loadCustomerUIDs();
    } catch (error: any) {
      toast({
        title: "등록 실패",
        description: error.message || "고객 UID 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const filteredUIDs = uids.filter(uid => 
    uid.exchange.toLowerCase().includes(searchQuery.toLowerCase()) ||
    uid.uid.includes(searchQuery)
  );

  const filteredCustomerUIDs = customerUIDs.filter(uid => {
    const matchesSearch = uid.exchange_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uid.customer_uid.includes(searchQuery);
    const matchesFilter = filterStatus === "all" || uid.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'inactive':
      case 'rejected':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    const variants = {
      active: 'default',
      approved: 'default',
      pending: 'secondary',
      inactive: 'outline',
      rejected: 'destructive'
    } as const;

    const labels = {
      active: '활성',
      approved: '승인됨',
      pending: '대기중',
      inactive: '비활성',
      rejected: '거부됨'
    };

    return (
      <Badge variant={variants[normalizedStatus as keyof typeof variants] || 'outline'} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {labels[normalizedStatus as keyof typeof labels] || status}
      </Badge>
    );
  };

  // Empty state check
  const hasNoData = !canSeePreviewData && uids.length === 0 && customerUIDs.length === 0;

  if (!isAuthenticated || !user) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">로그인이 필요합니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Guide Banner */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          고객의 거래소 UID를 등록하여 수익 공유를 시작하세요. 승인된 UID만 수익 계산에 포함됩니다.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>UID 관리</CardTitle>
          <CardDescription>
            본인 UID와 고객 UID를 구분하여 관리하고 수익을 추적하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="my-uid" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my-uid">내 UID</TabsTrigger>
              <TabsTrigger value="customer-uid" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                고객 UID
              </TabsTrigger>
            </TabsList>

            {/* My UID Tab */}
            <TabsContent value="my-uid" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="거래소 또는 UID 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      내 UID 등록
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>내 UID 등록</DialogTitle>
                      <DialogDescription>
                        본인의 거래소 UID를 등록하여 수익 승인을 받으세요.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="exchange">거래소 선택</Label>
                        <select
                          id="exchange"
                          value={selectedExchange}
                          onChange={(e) => setSelectedExchange(e.target.value)}
                          className="w-full mt-1 p-2 border border-input rounded-md bg-background"
                        >
                          <option value="">거래소를 선택하세요</option>
                          {exchanges.map((exchange) => (
                            <option key={exchange.code} value={exchange.name}>
                              {exchange.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="new-uid">내 UID</Label>
                        <Input
                          id="new-uid"
                          value={newUID}
                          onChange={(e) => setNewUID(e.target.value)}
                          placeholder="본인의 UID를 입력하세요"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setAddModalOpen(false)}>
                          취소
                        </Button>
                        <Button onClick={handleAddUID} disabled={!newUID || !selectedExchange}>
                          등록하기
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>거래소</TableHead>
                      <TableHead>UID</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>등록일</TableHead>
                      <TableHead className="text-right">총 수익</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUIDs.length > 0 ? (
                      filteredUIDs.map((uid) => (
                        <TableRow key={uid.id}>
                          <TableCell className="font-medium">{uid.exchange}</TableCell>
                          <TableCell className="font-mono">{uid.uid}</TableCell>
                          <TableCell>{getStatusBadge(uid.status)}</TableCell>
                          <TableCell>{uid.registeredAt}</TableCell>
                          <TableCell className="text-right">
                            ${uid.totalCommission.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          {searchQuery ? "검색 결과가 없습니다." : "등록된 UID가 없습니다."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Customer UID Tab */}
            <TabsContent value="customer-uid" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="고객 UID 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="p-2 border border-input rounded-md bg-background"
                  >
                    <option value="all">전체 상태</option>
                    <option value="pending">대기중</option>
                    <option value="approved">승인됨</option>
                    <option value="rejected">거부됨</option>
                  </select>
                </div>
                
                <Dialog open={customerModalOpen} onOpenChange={setCustomerModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      고객 UID 등록
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>고객 UID 등록</DialogTitle>
                      <DialogDescription>
                        고객의 거래소 UID를 등록하여 수익 공유를 시작하세요.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="customer-exchange">거래소 선택</Label>
                        <select
                          id="customer-exchange"
                          value={customerExchange}
                          onChange={(e) => setCustomerExchange(e.target.value)}
                          className="w-full mt-1 p-2 border border-input rounded-md bg-background"
                        >
                          <option value="">거래소를 선택하세요</option>
                          {exchanges.map((exchange) => (
                            <option key={exchange.code} value={exchange.name}>
                              {exchange.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="customer-uid">고객 UID</Label>
                        <Input
                          id="customer-uid"
                          value={customerUID}
                          onChange={(e) => setCustomerUID(e.target.value)}
                          placeholder="고객의 UID를 입력하세요"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setCustomerModalOpen(false)}>
                          취소
                        </Button>
                        <Button onClick={handleAddCustomerUID} disabled={!customerUID || !customerExchange}>
                          등록하기
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>거래소</TableHead>
                      <TableHead>고객 UID</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>등록일</TableHead>
                      <TableHead>승인일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomerUIDs.length > 0 ? (
                      filteredCustomerUIDs.map((uid) => (
                        <TableRow key={uid.id}>
                          <TableCell className="font-medium">{uid.exchange_id}</TableCell>
                          <TableCell className="font-mono">{uid.customer_uid}</TableCell>
                          <TableCell>{getStatusBadge(uid.status)}</TableCell>
                          <TableCell>{uid.registered_at?.split('T')[0]}</TableCell>
                          <TableCell>{uid.approved_at?.split('T')[0] || '—'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          {hasNoData ? "고객 UID가 없습니다. 첫 번째 고객을 등록해보세요." : "검색 결과가 없습니다."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}