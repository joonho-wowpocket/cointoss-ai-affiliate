import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, 
  Pause, 
  Settings, 
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Zap
} from "lucide-react";
import { type AIPipeline, aiAgents } from "@/lib/types/ai-team";
import { useToast } from "@/hooks/use-toast";

export const Pipelines = () => {
  const { toast } = useToast();
  const [pipelines] = useState<AIPipeline[]>([
    {
      id: "1",
      name: "콘텐츠 자동 발행 파이프라인",
      description: "시장 분석 → 콘텐츠 생성 → 컴플라이언스 검토 → SNS 발행",
      status: "active",
      createdAt: new Date(Date.now() - 86400000),
      steps: [
        {
          id: "1-1",
          agentId: "LEO",
          name: "시장 동향 분석",
          status: "completed",
          input: { timeframe: "24h" },
          output: { trend: "상승", confidence: 0.85 },
          createdAt: new Date(),
          completedAt: new Date()
        },
        {
          id: "1-2", 
          agentId: "CREA",
          name: "SNS 포스트 생성",
          status: "running",
          input: { trend_data: "상승세" },
          createdAt: new Date()
        },
        {
          id: "1-3",
          agentId: "GUARDIAN", 
          name: "컴플라이언스 검토",
          status: "queued",
          input: {},
          createdAt: new Date()
        }
      ]
    },
    {
      id: "2",
      name: "고객 재활성화 캠페인",
      description: "휴면 고객 탐지 → 개인화 메시지 생성 → 발송",
      status: "paused",
      createdAt: new Date(Date.now() - 172800000),
      steps: [
        {
          id: "2-1",
          agentId: "DANNY",
          name: "휴면 고객 식별",
          status: "completed", 
          input: { days_inactive: 30 },
          output: { count: 245 },
          createdAt: new Date(),
          completedAt: new Date()
        },
        {
          id: "2-2",
          agentId: "CREA",
          name: "개인화 메시지 생성",
          status: "queued",
          input: {},
          createdAt: new Date()
        }
      ]
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <Play className="w-4 h-4 text-accent" />;
      case "paused": return <Pause className="w-4 h-4 text-muted-foreground" />;
      case "completed": return <CheckCircle className="w-4 h-4 text-accent" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-3 h-3 text-accent" />;
      case "running": return <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      case "queued": return <Clock className="w-3 h-3 text-muted-foreground" />;
      case "failed": return <AlertCircle className="w-3 h-3 text-destructive" />;
      default: return <Clock className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const calculateProgress = (pipeline: AIPipeline) => {
    const total = pipeline.steps.length;
    const completed = pipeline.steps.filter(step => step.status === "completed").length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const handleTogglePipeline = (pipelineId: string) => {
    toast({
      title: "파이프라인 제어",
      description: "파이프라인 상태가 변경되었습니다.",
    });
  };

  const handleCreatePipeline = () => {
    toast({
      title: "파이프라인 생성",
      description: "새 파이프라인 생성 기능을 준비 중입니다.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI 파이프라인</h2>
          <p className="text-muted-foreground">자동화된 AI 워크플로우를 관리하세요</p>
        </div>
        
        <Button onClick={handleCreatePipeline} className="bg-gradient-primary hover:shadow-glow">
          <Plus className="w-4 h-4 mr-2" />
          새 파이프라인
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card border-border/50 glass">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent/10 rounded">
                <Play className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">활성 파이프라인</p>
                <p className="text-2xl font-bold">
                  {pipelines.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 glass">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">실행된 작업</p>
                <p className="text-2xl font-bold">
                  {pipelines.reduce((acc, p) => acc + p.steps.filter(s => s.status === 'completed').length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 glass">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-crypto-gold/10 rounded">
                <CheckCircle className="w-5 h-5 text-crypto-gold" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">완료율</p>
                <p className="text-2xl font-bold">87.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipelines List */}
      <Card className="bg-gradient-card border-border/50 glass">
        <CardHeader>
          <CardTitle>파이프라인 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-6">
              {pipelines.map(pipeline => {
                const progress = calculateProgress(pipeline);
                
                return (
                  <Card key={pipeline.id} className="border-border/30">
                    <CardContent className="p-6">
                      {/* Pipeline Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(pipeline.status)}
                            <h3 className="font-semibold text-lg">{pipeline.name}</h3>
                            <Badge 
                              variant="outline" 
                              className={
                                pipeline.status === 'active' 
                                  ? 'border-accent text-accent' 
                                  : 'border-muted-foreground text-muted-foreground'
                              }
                            >
                              {pipeline.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {pipeline.description}
                          </p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>진행률</span>
                              <span>{progress.toFixed(0)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePipeline(pipeline.id)}
                          >
                            {pipeline.status === 'active' ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Pipeline Steps */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground">워크플로우 단계</h4>
                        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                          {pipeline.steps.map((step, index) => {
                            const agent = aiAgents.find(a => a.id === step.agentId);
                            
                            return (
                              <div key={step.id} className="flex items-center space-x-2 flex-shrink-0">
                                <div className="flex flex-col items-center space-y-2 min-w-[120px]">
                                  <div className={`p-3 rounded-lg border border-border/30 bg-muted/20 
                                    ${step.status === 'completed' ? 'border-accent/50 bg-accent/5' : ''}
                                    ${step.status === 'running' ? 'border-primary/50 bg-primary/5' : ''}
                                  `}>
                                    <div className="flex items-center justify-center mb-2">
                                      {getTaskStatusIcon(step.status)}
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs font-medium">{agent?.name}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {step.name}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                {index < pipeline.steps.length - 1 && (
                                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="mt-4 pt-4 border-t border-border/30">
                        <p className="text-xs text-muted-foreground">
                          생성일: {pipeline.createdAt.toLocaleDateString()} • 
                          마지막 실행: {pipeline.steps
                            .filter(s => s.completedAt)
                            .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))[0]
                            ?.completedAt?.toLocaleString() || "없음"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};