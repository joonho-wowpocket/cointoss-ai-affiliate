import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, TrendingUp, Users, DollarSign, Calendar } from "lucide-react";

interface Customer {
  id: string;
  uid: string;
  exchange: string;
  status: 'active' | 'inactive' | 'vip';
  totalVolume: number;
  totalCommission: number;
  registeredAt: string;
  lastActivity: string;
  tier: 'basic' | 'premium' | 'vip';
}

export function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterExchange, setFilterExchange] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Mock data
  const customers: Customer[] = [
    {
      id: "1",
      uid: "12345678",
      exchange: "Binance",
      status: "active",
      totalVolume: 125000,
      totalCommission: 1250.50,
      registeredAt: "2024-01-15",
      lastActivity: "2024-01-20",
      tier: "premium"
    },
    {
      id: "2",
      uid: "87654321",
      exchange: "Bybit",
      status: "vip",
      totalVolume: 250000,
      totalCommission: 3750.75,
      registeredAt: "2024-01-10",
      lastActivity: "2024-01-20",
      tier: "vip"
    },
    {
      id: "3",
      uid: "11223344",
      exchange: "OKX",
      status: "active",
      totalVolume: 50000,
      totalCommission: 500.25,
      registeredAt: "2024-01-18",
      lastActivity: "2024-01-19",
      tier: "basic"
    },
    {
      id: "4",
      uid: "99887766",
      exchange: "Binance",
      status: "inactive",
      totalVolume: 15000,
      totalCommission: 150.00,
      registeredAt: "2024-01-05",
      lastActivity: "2024-01-12",
      tier: "basic"
    }
  ];

  const exchanges = ["Binance", "Bybit", "OKX", "Gate.io"];
  
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.uid.includes(searchQuery) || 
                         customer.exchange.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesExchange = !filterExchange || customer.exchange === filterExchange;
    const matchesStatus = !filterStatus || customer.status === filterStatus;
    
    return matchesSearch && matchesExchange && matchesStatus;
  });

  const totalStats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === 'active' || c.status === 'vip').length,
    totalVolume: customers.reduce((sum, c) => sum + c.totalVolume, 0),
    totalCommission: customers.reduce((sum, c) => sum + c.totalCommission, 0)
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      vip: 'destructive'
    } as const;

    const labels = {
      active: '활성',
      inactive: '비활성',
      vip: 'VIP'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getTierBadge = (tier: string) => {
    const variants = {
      basic: 'outline',
      premium: 'secondary',
      vip: 'default'
    } as const;

    const labels = {
      basic: '베이직',
      premium: '프리미엄',
      vip: 'VIP'
    };

    return (
      <Badge variant={variants[tier as keyof typeof variants]}>
        {labels[tier as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">총 고객</div>
            </div>
            <div className="text-2xl font-bold">{totalStats.totalCustomers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">활성 고객</div>
            </div>
            <div className="text-2xl font-bold text-green-600">{totalStats.activeCustomers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">총 거래량</div>
            </div>
            <div className="text-2xl font-bold">${totalStats.totalVolume.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">총 수수료</div>
            </div>
            <div className="text-2xl font-bold text-primary">${totalStats.totalCommission.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>고객 관리</CardTitle>
          <CardDescription>
            파트너 고객들의 거래 현황 및 수수료 정보를 확인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="UID 또는 거래소 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterExchange || "all"} onValueChange={(value) => setFilterExchange(value === "all" ? "" : value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="거래소" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {exchanges.map((exchange) => (
                  <SelectItem key={exchange} value={exchange}>
                    {exchange}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterStatus || "all"} onValueChange={(value) => setFilterStatus(value === "all" ? "" : value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="inactive">비활성</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Customers Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>UID</TableHead>
                  <TableHead>거래소</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>등급</TableHead>
                  <TableHead className="text-right">총 거래량</TableHead>
                  <TableHead className="text-right">총 수수료</TableHead>
                  <TableHead>등록일</TableHead>
                  <TableHead>최근 활동</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-mono">{customer.uid}</TableCell>
                      <TableCell className="font-medium">{customer.exchange}</TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell>{getTierBadge(customer.tier)}</TableCell>
                      <TableCell className="text-right">
                        ${customer.totalVolume.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${customer.totalCommission.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.registeredAt}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.lastActivity}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      {searchQuery || filterExchange || filterStatus 
                        ? "필터 조건에 맞는 고객이 없습니다." 
                        : "등록된 고객이 없습니다."}
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