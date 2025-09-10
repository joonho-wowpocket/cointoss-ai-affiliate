import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  AlertCircle,
  Copy,
  Download,
  Trash2,
  Play,
  Pause,
  Lock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { GuestBanner } from "@/components/GuestBanner";
import { LoginModal } from "@/components/auth/LoginModal";
import { type AITask, aiAgents } from "@/lib/types/ai-team";
import { useToast } from "@/hooks/use-toast";

export const TaskCenter = () => {
  const { isGuest } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Guest preview and mock data
  useEffect(() => {
    const guestTasks: AITask[] = [
      {
        id: "guest-1",
        agentId: "CREA",
        name: "인스타그램 포스트 생성",
        status: "completed",
        input: { prompt: "거래소 프로모션 콘텐츠", platform: "Instagram" },
        output: { content: "🎯 거래소 특별 혜택! 지금 가입하고 수수료 할인 받으세요!" },
        createdAt: new Date(Date.now() - 7200000),
        completedAt: new Date(Date.now() - 6600000)
      },
      {
        id: "guest-2",
        agentId: "DANNY",
        name: "고객 리텐션 분석",
        status: "completed",
        input: { timeframe: "7d" },
        output: { insights: "신규 고객 90% 유지율, VIP 고객 활동도 증가" },
        createdAt: new Date(Date.now() - 5400000),
        completedAt: new Date(Date.now() - 4800000)
      },
      {
        id: "guest-3",
        agentId: "SARAH",
        name: "텔레그램 자동 응답 설정",
        status: "running",
        input: { channel: "crypto_signals" },
        createdAt: new Date(Date.now() - 1800000)
      }
    ];
    
    const mockTasks: AITask[] = [
      {
        id: "1",
        agentId: "CREA",
        name: "SNS 포스트 생성",
        status: "completed",
        input: { prompt: "비트코인 시장 분석", platform: "Twitter" },
        output: { content: "🚀 비트코인이 새로운 고점을 향해 상승 중입니다! 기술적 분석에 따르면..." },
        createdAt: new Date(Date.now() - 3600000),
        completedAt: new Date(Date.now() - 3000000)
      },
      {
        id: "2",
        agentId: "DANNY",
        name: "고객 세그먼트 분석",
        status: "running",
        input: { timeframe: "30d" },
        createdAt: new Date(Date.now() - 600000)
      },
      {
        id: "3",
        agentId: "SARAH",
        name: "고객 응답 자동화",
        status: "failed",
        input: { template: "환영 메시지" },
        createdAt: new Date(Date.now() - 1800000)
      },
      {
        id: "4",
        agentId: "ALEX",
        name: "성과 리포트 생성",
        status: "queued",
        input: { period: "weekly" },
        createdAt: new Date(Date.now() - 900000)
      }
    ];
    
    setTasks(isGuest ? guestTasks : mockTasks);
  }, [isGuest]);

  const handleAction = (taskId: string, action: string) => {
    if (isGuest) {
      setShowLoginModal(true);
      return;
    }
    
    // Mock action handling
    toast({
      description: `작업 ${action}: ${taskId}`
    });
  };

  const getStatusIcon = (status: AITask['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'queued':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: AITask['status']) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      running: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      queued: 'bg-yellow-100 text-yellow-800'
    };

    const labels = {
      completed: '완료',
      running: '실행 중',
      failed: '실패',
      queued: '대기'
    };

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const filteredTasks = tasks.filter(task => {
    if (filter !== 'all' && task.status !== filter) return false;
    if (selectedAgent !== 'all' && task.agentId !== selectedAgent) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {isGuest && <GuestBanner onLoginClick={() => setShowLoginModal(true)} />}
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>작업 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">상태</label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                  <SelectItem value="running">실행 중</SelectItem>
                  <SelectItem value="failed">실패</SelectItem>
                  <SelectItem value="pending">대기</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">AI 에이전트</label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {aiAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>작업 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>작업이 없습니다.</p>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const agent = aiAgents.find(a => a.id === task.agentId);
                  
                  return (
                    <Card key={task.id} className="border border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(task.status)}
                              <h4 className="font-semibold">{task.name}</h4>
                              {getStatusBadge(task.status)}
                            </div>
                            
                            <div className="text-sm text-muted-foreground mb-3">
                              <p><strong>AI 에이전트:</strong> {agent?.name || task.agentId}</p>
                              <p><strong>생성 시간:</strong> {task.createdAt.toLocaleString()}</p>
                              {task.completedAt && (
                                <p><strong>완료 시간:</strong> {task.completedAt.toLocaleString()}</p>
                              )}
                            </div>

                            {task.output && (
                              <div className="bg-muted/50 p-3 rounded-lg mb-3">
                                <p className="text-sm font-medium mb-1">결과:</p>
                                <p className="text-sm">{JSON.stringify(task.output, null, 2)}</p>
                              </div>
                            )}

                            <div className="flex gap-2">
                              {task.status === 'failed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAction(task.id, 'retry')}
                                  disabled={isGuest}
                                >
                                  {isGuest ? <Lock className="w-3 h-3 mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                                  재시도
                                </Button>
                              )}
                              
                              {task.status === 'running' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAction(task.id, 'pause')}
                                  disabled={isGuest}
                                >
                                  {isGuest ? <Lock className="w-3 h-3 mr-1" /> : <Pause className="w-3 h-3 mr-1" />}
                                  일시정지
                                </Button>
                              )}
                              
                              {task.status === 'queued' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAction(task.id, 'resume')}
                                  disabled={isGuest}
                                >
                                  {isGuest ? <Lock className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                                  재개
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-1 ml-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleAction(task.id, 'copy')}
                              disabled={isGuest}
                            >
                              {isGuest ? <Lock className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleAction(task.id, 'download')}
                              disabled={isGuest}
                            >
                              {isGuest ? <Lock className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleAction(task.id, 'delete')}
                              disabled={isGuest}
                            >
                              {isGuest ? <Lock className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
};