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