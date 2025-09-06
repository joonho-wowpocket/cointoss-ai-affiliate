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
  Pause
} from "lucide-react";
import { type AITask, aiAgents } from "@/lib/types/ai-team";
import { useToast } from "@/hooks/use-toast";

export const TaskCenter = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [selectedAgent, setSelectedAgent] = useState<string>("all");

  // Mock data for demonstration
  useEffect(() => {
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
        agentId: "LEO",
        name: "시장 리스크 평가",
        status: "queued",
        input: { markets: ["BTC", "ETH", "BNB"] },
        createdAt: new Date(Date.now() - 300000)
      },
      {
        id: "4",
        agentId: "GUARDIAN",
        name: "컴플라이언스 검토",
        status: "failed",
        input: { content: "투자 권유 콘텐츠" },
        createdAt: new Date(Date.now() - 1200000)
      }
    ];
    setTasks(mockTasks);
  }, []);

  const getStatusIcon = (status: AITask['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-accent" />;
      case 'failed': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-primary animate-spin" />;
      case 'queued': return <Clock className="w-4 h-4 text-muted-foreground" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: AITask['status']) => {
    switch (status) {
      case 'completed': return 'border-accent text-accent';
      case 'failed': return 'border-destructive text-destructive';
      case 'running': return 'border-primary text-primary';
      case 'queued': return 'border-muted-foreground text-muted-foreground';
      default: return 'border-muted-foreground text-muted-foreground';
    }
  };

  const handleCopyOutput = (output: any) => {
    const content = typeof output === 'object' ? JSON.stringify(output, null, 2) : output;
    navigator.clipboard.writeText(content);
    toast({
      title: "복사됨",
      description: "작업 결과가 클립보드에 복사되었습니다.",
    });
  };

  const handleCancelTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'failed' as const }
        : task
    ));
    toast({
      title: "작업 취소됨",
      description: "작업이 취소되었습니다.",
    });
  };

  const filteredTasks = tasks.filter(task => {
    if (filter !== "all" && task.status !== filter) return false;
    if (selectedAgent !== "all" && task.agentId !== selectedAgent) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">작업 센터</h2>
          <p className="text-muted-foreground">AI 작업 현황을 모니터링하고 관리하세요</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="border-primary text-primary">
            <RefreshCw className="w-3 h-3 mr-1" />
            {tasks.filter(t => t.status === 'running').length}개 실행중
          </Badge>
          <Badge variant="outline" className="border-accent text-accent">
            <CheckCircle className="w-3 h-3 mr-1" />
            {tasks.filter(t => t.status === 'completed').length}개 완료
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            <SelectItem value="running">실행중</SelectItem>
            <SelectItem value="completed">완료됨</SelectItem>
            <SelectItem value="queued">대기중</SelectItem>
            <SelectItem value="failed">실패</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="AI 에이전트" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 에이전트</SelectItem>
            {aiAgents.map(agent => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tasks List */}
      <Card className="bg-gradient-card border-border/50 glass">
        <CardHeader>
          <CardTitle>작업 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {filteredTasks.map(task => {
                const agent = aiAgents.find(a => a.id === task.agentId);
                
                return (
                  <Card key={task.id} className="border-border/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(task.status)}
                            <h4 className="font-medium">{task.name}</h4>
                            <Badge variant="outline" className={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground mb-2">
                            <span className="font-medium">{agent?.name}</span> • 
                            {task.createdAt.toLocaleString()}
                          </div>

                          {task.output && (
                            <div className="mt-3 p-3 bg-muted/30 rounded border">
                              <p className="text-sm font-medium mb-1">결과:</p>
                              <p className="text-sm text-muted-foreground">
                                {typeof task.output === 'object' 
                                  ? task.output.content || JSON.stringify(task.output).substring(0, 100) + "..." 
                                  : task.output.toString().substring(0, 100) + "..."}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {task.output && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyOutput(task.output)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          )}
                          
                          {task.status === 'running' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelTask(task.id)}
                            >
                              <Pause className="w-3 h-3" />
                            </Button>
                          )}
                          
                          {task.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toast({ title: "다운로드", description: "파일 다운로드 기능을 준비 중입니다." })}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {filteredTasks.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {filter === 'all' && selectedAgent === 'all' 
                      ? "작업이 없습니다." 
                      : "필터 조건에 맞는 작업이 없습니다."}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};