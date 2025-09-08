import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useRuntime } from "@/contexts/RuntimeContext";
import { PreviewBlockedBanner } from "@/components/PreviewBlockedBanner";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Clock, XCircle, Eye, FileText, Calendar, Loader2 } from "lucide-react";

interface ApprovalRecord {
  id: string;
  exchange: string;
  type: 'partnership' | 'uid_verification' | 'rate_upgrade';
  status: 'pending' | 'approved' | 'rejected' | 'reviewing';
  submittedAt: string;
  expectedDays: number;
  progress: number;
  notes?: string;
}

export function Approvals() {
  const { isAuthenticated, isGuest } = useAuth();
  const { isPreviewBlocked, allowPreviewData } = useRuntime();
  const [selectedRecord, setSelectedRecord] = useState<ApprovalRecord | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // 미리보기용 더미 데이터
  const getPreviewApprovals = (): ApprovalRecord[] => [
    {
      id: "1",
      exchange: "Binance",
      type: "partnership",
      status: "approved",
      submittedAt: "2024-01-10",
      expectedDays: 7,
      progress: 100,
      notes: "파트너십 승인 완료. 85% 수수료 율 적용됨."
    },
    {
      id: "2",
      exchange: "Bybit",
      type: "uid_verification",
      status: "reviewing",
      submittedAt: "2024-01-15",
      expectedDays: 3,
      progress: 65,
      notes: "UID 검증 중. 추가 서류 요청 예정."
    },
    {
      id: "3",
      exchange: "OKX",
      type: "rate_upgrade",
      status: "pending",
      submittedAt: "2024-01-18",
      expectedDays: 5,
      progress: 20,
      notes: "수수료 율 업그레이드 신청 접수됨."
    },
    {
      id: "4",
      exchange: "Gate.io",
      type: "partnership",
      status: "rejected",
      submittedAt: "2024-01-05",
      expectedDays: 7,
      progress: 100,
      notes: "최소 거래량 요구사항 미충족으로 반려. 3개월 후 재신청 가능."
    }
  ];

  // 승인 데이터 로드
  const loadApprovals = async () => {
    setLoading(true);
    try {
      // 게스트 또는 미리보기가 차단된 경우 더미 데이터 사용
      if (isGuest || isPreviewBlocked) {
        setTimeout(() => {
          setApprovals(getPreviewApprovals());
          setLoading(false);
        }, 800);
        return;
      }

      // 인증된 사용자는 실제 데이터 로드 (현재는 더미 데이터 사용)
      // TODO: 실제 API 연동 시 아래 코드로 교체
      // const { data, error } = await supabase.from('applications')...
      setApprovals(getPreviewApprovals());
    } catch (error) {
      console.error('승인 데이터 로드 오류:', error);
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, [isGuest, isPreviewBlocked]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'reviewing':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: 'default',
      reviewing: 'secondary',
      pending: 'secondary',
      rejected: 'destructive'
    } as const;

    const labels = {
      approved: '승인됨',
      reviewing: '심사중',
      pending: '대기중',
      rejected: '반려됨'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      partnership: '파트너십 신청',
      uid_verification: 'UID 검증',
      rate_upgrade: '수수료 율 업그레이드'
    };
    return labels[type as keyof typeof labels];
  };

  const handleViewDetails = (record: ApprovalRecord) => {
    setSelectedRecord(record);
    setDetailsModalOpen(true);
  };

  const getProgressColor = (status: string, progress: number) => {
    if (status === 'approved') return 'bg-green-500';
    if (status === 'rejected') return 'bg-red-500';
    if (progress > 80) return 'bg-blue-500';
    if (progress > 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* 미리보기 배너 - 게스트 사용자에게 표시 */}
      {isGuest && (
        <PreviewBlockedBanner 
          message="승인 현황 미리보기" 
          showAdminOverride={false}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>승인 현황</CardTitle>
            <CardDescription>
              거래소 파트너십 및 UID 검증 신청의 현재 상태를 확인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {approvals.filter(a => a.status === 'approved').length}
                  </div>
                  <div className="text-sm text-muted-foreground">승인됨</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {approvals.filter(a => a.status === 'reviewing').length}
                  </div>
                  <div className="text-sm text-muted-foreground">심사중</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {approvals.filter(a => a.status === 'pending').length}
                  </div>
                  <div className="text-sm text-muted-foreground">대기중</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {approvals.filter(a => a.status === 'rejected').length}
                  </div>
                  <div className="text-sm text-muted-foreground">반려됨</div>
                </div>
              </div>

              {/* Approvals Table */}
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>거래소</TableHead>
                      <TableHead>신청 유형</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>진행률</TableHead>
                      <TableHead>신청일</TableHead>
                      <TableHead>예상 기간</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvals.map((approval) => (
                      <TableRow key={approval.id}>
                        <TableCell className="font-medium">{approval.exchange}</TableCell>
                        <TableCell>{getTypeLabel(approval.type)}</TableCell>
                        <TableCell>{getStatusBadge(approval.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={approval.progress} className="w-16" />
                            <span className="text-sm text-muted-foreground">
                              {approval.progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{approval.submittedAt}</TableCell>
                        <TableCell>{approval.expectedDays}일</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(approval)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              승인 세부 정보
            </DialogTitle>
            <DialogDescription>
              신청의 상세 정보 및 진행 상황을 확인하세요.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">거래소</div>
                  <div className="text-lg font-semibold">{selectedRecord.exchange}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">신청 유형</div>
                  <div className="text-lg">{getTypeLabel(selectedRecord.type)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">현재 상태</div>
                  <div className="mt-1">{getStatusBadge(selectedRecord.status)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">신청일</div>
                  <div className="flex items-center gap-1 text-lg">
                    <Calendar className="w-4 h-4" />
                    {selectedRecord.submittedAt}
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">진행률</div>
                <div className="flex items-center gap-3">
                  <Progress value={selectedRecord.progress} className="flex-1" />
                  <span className="text-lg font-semibold">{selectedRecord.progress}%</span>
                </div>
              </div>

              {/* Notes */}
              {selectedRecord.notes && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">상세 내용</div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">{selectedRecord.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => setDetailsModalOpen(false)}>
                  닫기
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}