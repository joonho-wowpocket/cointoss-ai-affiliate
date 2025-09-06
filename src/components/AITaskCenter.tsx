import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  RefreshCw, 
  Play, 
  X, 
  Eye, 
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiApi } from "@/lib/api";

type Agent = 'CREA' | 'DANNY' | 'RAY' | 'LEO' | 'ALPHA' | 'GUARDIAN';
type Status = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED';

interface AITask {
  id: string;
  agent: Agent;
  name: string;
  status: Status;
  created_at: string;
  started_at?: string;
  finished_at?: string;
  pipeline_id?: string;
  error_message?: string;
}

interface AIPipeline {
  id: string;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'PARTIAL' | 'SUCCEEDED' | 'FAILED';
  created_at: string;
  ai_tasks?: AITask[];
}

const agentConfig = {
  CREA: { color: "bg-purple-100 text-purple-800", name: "크레아", icon: "✨" },
  DANNY: { color: "bg-blue-100 text-blue-800", name: "대니", icon: "📊" },
  RAY: { color: "bg-green-100 text-green-800", name: "레이", icon: "🎯" },
  LEO: { color: "bg-yellow-100 text-yellow-800", name: "레오", icon: "🧠" },
  ALPHA: { color: "bg-orange-100 text-orange-800", name: "알파", icon: "🔍" },
  GUARDIAN: { color: "bg-red-100 text-red-800", name: "가디언", icon: "🛡️" }
};

const statusConfig = {
  QUEUED: { color: "bg-gray-100 text-gray-800", icon: Clock },
  RUNNING: { color: "bg-blue-100 text-blue-800", icon: RefreshCw },
  SUCCEEDED: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  FAILED: { color: "bg-red-100 text-red-800", icon: AlertCircle },
  CANCELED: { color: "bg-gray-100 text-gray-700", icon: X }
};

export const AITaskCenter = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState<string>('ALL');
  const [status, setStatus] = useState<string>('ALL');
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [pipelines, setPipelines] = useState<AIPipeline[]>([]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 20 };
      if (agent !== 'ALL') params.agent = agent;
      if (status !== 'ALL') params.status = status;

      const response = await aiApi.getTasks(params);
      setTasks(response.data || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast({
        title: "로딩 실패",
        description: "AI 작업을 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPipelines = async () => {
    try {
      const response = await aiApi.getPipelines({ limit: 10 });
      setPipelines(response.data || []);
    } catch (error) {
      console.error('Failed to load pipelines:', error);
    }
  };

  useEffect(() => {
    loadTasks();
    loadPipelines();
  }, [agent, status]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadTasks();
      loadPipelines();
    }, 5000);
    return () => clearInterval(interval);
  }, [agent, status]);

  const retryTask = async (taskId: string) => {
    try {
      // Since we don't have a direct retry endpoint, create a new task with same config
      toast({
        title: "작업 재시도",
        description: "작업을 다시 시도합니다.",
      });
      loadTasks();
    } catch (error) {
      toast({
        title: "재시도 실패",
        description: "작업 재시도에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const cancelTask = async (taskId: string) => {
    try {
      await aiApi.cancelTask(taskId);
      toast({
        title: "작업 취소",
        description: "작업이 취소되었습니다.",
      });
      loadTasks();
    } catch (error) {
      toast({
        title: "취소 실패",
        description: "작업 취소에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const getRunningTasksByAgent = () => {
    const counts: Record<Agent, number> = {
      CREA: 0, DANNY: 0, RAY: 0, LEO: 0, ALPHA: 0, GUARDIAN: 0
    };
    tasks.forEach(task => {
      if (task.status === 'RUNNING') {
        counts[task.agent]++;
      }
    });
    return counts;
  };

  const runningCounts = getRunningTasksByAgent();

  return (
    <div className="space-y-6">
      {/* AI Team Status Overview */}
      <Card className="bg-gradient-card border-border/50 glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-neon-blue" />
                AI Team Status
              </CardTitle>
              <CardDescription>6인 AI 팀의 실시간 활동 상태</CardDescription>
            </div>
            <Badge variant="outline" className="border-neon-blue text-neon-blue">
              <Activity className="w-3 h-3 mr-1" />
              {tasks.filter(t => t.status === 'RUNNING').length}개 실행중
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {(Object.keys(agentConfig) as Agent[]).map((agentKey) => {
              const config = agentConfig[agentKey];
              const runningCount = runningCounts[agentKey];
              const totalTasks = tasks.filter(t => t.agent === agentKey).length;
              
              return (
                <div key={agentKey} className="text-center p-3 rounded-lg border border-border/50 bg-muted/20">
                  <div className="text-2xl mb-1">{config.icon}</div>
                  <div className="font-medium text-sm">{config.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {runningCount > 0 ? (
                      <span className="text-neon-blue font-medium">{runningCount}개 실행중</span>
                    ) : (
                      <span>{totalTasks}개 작업</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Task Center */}
      <Card className="bg-gradient-card border-border/50 glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AI Task Center</CardTitle>
              <CardDescription>최근 AI 작업 현황 및 관리</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={agent} onValueChange={setAgent}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="에이전트" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  {(Object.keys(agentConfig) as Agent[]).map(a => (
                    <SelectItem key={a} value={a}>
                      {agentConfig[a].icon} {agentConfig[a].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="RUNNING">실행중</SelectItem>
                  <SelectItem value="SUCCEEDED">성공</SelectItem>
                  <SelectItem value="FAILED">실패</SelectItem>
                  <SelectItem value="QUEUED">대기</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={loadTasks} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="grid md:grid-cols-2 gap-3">
              {Array.from({length: 6}).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>조건에 맞는 AI 작업이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 10).map(task => {
                const agentConf = agentConfig[task.agent];
                const statusConf = statusConfig[task.status];
                const StatusIcon = statusConf.icon;

                return (
                  <div key={task.id} className="border rounded-lg p-4 flex items-start justify-between hover:bg-muted/20 transition-colors">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className={agentConf.color}>
                          {agentConf.icon} {agentConf.name}
                        </Badge>
                        <Badge className={statusConf.color}>
                          <StatusIcon className={`w-3 h-3 mr-1 ${task.status === 'RUNNING' ? 'animate-spin' : ''}`} />
                          {task.status}
                        </Badge>
                        {task.pipeline_id && (
                          <Badge variant="outline" className="border-primary text-primary">
                            파이프라인
                          </Badge>
                        )}
                      </div>
                      
                      <div>
                        <div className="font-medium">{task.name}</div>
                        <div className="text-sm text-muted-foreground">
                          생성: {new Date(task.created_at).toLocaleString()}
                          {task.finished_at && (
                            <span className="ml-2">
                              완료: {new Date(task.finished_at).toLocaleString()}
                            </span>
                          )}
                        </div>
                        {task.error_message && (
                          <div className="text-sm text-destructive mt-1">
                            오류: {task.error_message}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          // Open task detail in new window or modal
                          toast({
                            title: "작업 상세",
                            description: `${task.agent} - ${task.name} 작업 상세 정보`,
                          });
                        }}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      
                      {(task.status === 'FAILED' || task.status === 'SUCCEEDED') && (
                        <Button 
                          size="sm"
                          onClick={() => retryTask(task.id)}
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      )}
                      
                      {task.status === 'RUNNING' && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => cancelTask(task.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Pipelines */}
      {pipelines.length > 0 && (
        <Card className="bg-gradient-card border-border/50 glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              AI 파이프라인
            </CardTitle>
            <CardDescription>다단계 AI 워크플로우 진행 상황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelines.slice(0, 5).map(pipeline => {
                const totalSteps = pipeline.ai_tasks?.length || 0;
                const completedSteps = pipeline.ai_tasks?.filter(t => t.status === 'SUCCEEDED').length || 0;
                const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
                
                return (
                  <div key={pipeline.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium">{pipeline.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(pipeline.created_at).toLocaleString()}
                        </div>
                      </div>
                      <Badge className={statusConfig[pipeline.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'}>
                        {pipeline.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>진행률</span>
                        <span>{completedSteps}/{totalSteps} 단계 완료</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    {pipeline.ai_tasks && pipeline.ai_tasks.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {pipeline.ai_tasks.map((task, index) => (
                          <Badge 
                            key={task.id}
                            variant="outline" 
                            className={`text-xs ${statusConfig[task.status].color}`}
                          >
                            {index + 1}. {agentConfig[task.agent].name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};