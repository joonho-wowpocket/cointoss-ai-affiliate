import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, CheckCircle, Clock, XCircle } from "lucide-react";

interface UIDRecord {
  id: string;
  exchange: string;
  uid: string;
  status: 'active' | 'pending' | 'inactive';
  registeredAt: string;
  totalCommission: number;
}

export function UIDRegistry() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [newUID, setNewUID] = useState("");
  const [selectedExchange, setSelectedExchange] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Mock data
  const [uids, setUids] = useState<UIDRecord[]>([
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
    },
    {
      id: "3",
      exchange: "OKX",
      uid: "11223344",
      status: "active",
      registeredAt: "2024-01-08",
      totalCommission: 890.25
    }
  ]);

  const exchanges = [
    { code: "binance", name: "Binance" },
    { code: "bybit", name: "Bybit" },
    { code: "okx", name: "OKX" },
    { code: "gate", name: "Gate.io" }
  ];

  const filteredUIDs = uids.filter(uid => 
    uid.exchange.toLowerCase().includes(searchQuery.toLowerCase()) ||
    uid.uid.includes(searchQuery)
  );

  const handleAddUID = async () => {
    if (!newUID || !selectedExchange) return;

    const newRecord: UIDRecord = {
      id: Date.now().toString(),
      exchange: selectedExchange,
      uid: newUID,
      status: "pending",
      registeredAt: new Date().toISOString().split('T')[0],
      totalCommission: 0
    };

    setUids([...uids, newRecord]);
    
    toast({
      title: "UID 등록 완료",
      description: `${selectedExchange} UID가 등록되었습니다. 심사 후 활성화됩니다.`,
    });
    
    setNewUID("");
    setSelectedExchange("");
    setAddModalOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      pending: 'secondary',
      inactive: 'outline'
    } as const;

    const labels = {
      active: '활성',
      pending: '대기중',
      inactive: '비활성'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>UID 등록 관리</CardTitle>
          <CardDescription>
            고객의 거래소 UID를 등록하여 수익을 추적하고 관리하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                  UID 등록
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>새 UID 등록</DialogTitle>
                  <DialogDescription>
                    고객의 거래소 UID를 등록하여 수익 추적을 시작하세요.
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
                    <Label htmlFor="new-uid">고객 UID</Label>
                    <Input
                      id="new-uid"
                      value={newUID}
                      onChange={(e) => setNewUID(e.target.value)}
                      placeholder="UID를 입력하세요"
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
        </CardContent>
      </Card>
    </div>
  );
}