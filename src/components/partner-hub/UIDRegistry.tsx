import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useRuntime } from "@/contexts/RuntimeContext";
import { MyUIDManager } from "./MyUIDManager";
import { CustomerUIDManager } from "./CustomerUIDManager";
import { AlertTriangle, User, Users } from "lucide-react";

export function UIDRegistry() {
  const { user, isAuthenticated } = useAuth();
  const { isPreviewBlocked } = useRuntime();

  if (!isAuthenticated || !user) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">로그인이 필요합니다.</p>
        </CardContent>
      </Card>
    );
  }

  if (isPreviewBlocked) {
    return (
      <Card>
        <CardContent className="p-12 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold mb-2">UID 관리 시스템</h3>
            <p className="text-muted-foreground">
              거래소 연동 후 UID 등록 기능을 이용할 수 있습니다.
            </p>
          </div>
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
          <div className="space-y-2">
            <p className="font-medium">UID 등록 가이드:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>내 UID:</strong> 본인의 거래소 UID를 등록하여 승인 받으면 최대 85% 요율 적용</li>
              <li><strong>고객 UID:</strong> 고객의 동의 하에 UID를 등록하여 수익 공유</li>
              <li><strong>승인 과정:</strong> 모든 UID는 심사 후 승인되며, 승인된 UID만 수익 계산에 포함</li>
            </ul>
          </div>
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
              <TabsTrigger value="my-uid" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                내 UID
              </TabsTrigger>
              <TabsTrigger value="customer-uid" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                고객 UID
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-uid" className="space-y-4">
              <MyUIDManager />
            </TabsContent>

            <TabsContent value="customer-uid" className="space-y-4">
              <CustomerUIDManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
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