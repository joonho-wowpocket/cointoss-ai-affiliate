import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  Sparkles,
  BarChart3,
  MessageSquare,
  Send,
  Download,
  Calendar,
  Users,
  TrendingUp,
  Copy,
  Play,
  Pause,
  Settings,
  Clock,
  Zap,
  FileText,
  Shield,
  Search,
  Target,
  Brain,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Bell,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiApi } from "@/lib/api";

type Agent = 'CREA' | 'DANNY' | 'RAY' | 'LEO' | 'ALPHA' | 'GUARDIAN';

interface AITask {
  id: string;
  agent: Agent;
  name: string;
  input: any;
  output: any;
  status: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED';
  created_at: string;
  finished_at?: string;
  error_message?: string;
}

interface AIPipeline {
  id: string;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'PARTIAL' | 'SUCCEEDED' | 'FAILED';
  created_at: string;
  ai_tasks?: AITask[];
}

const AIAssistants = () => {
  const { toast } = useToast();
  const [selectedAgent, setSelectedAgent] = useState<Agent>("CREA");
  const [chatMessage, setChatMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [pipelines, setPipelines] = useState<AIPipeline[]>([]);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // AI Team Members Configuration
  const agents = [
    {
      id: "CREA" as Agent,
      name: "크레아 (Crea)",
      role: "콘텐츠 매니저",
      description: "마케팅 콘텐츠 자동 생성 및 발행 자동화",
      status: "active",
      avatar: "✨",
      color: "neon-purple",
      tasks: ["generate_social_post", "schedule_post", "transform_signal_to_content"],
      capabilities: ["SNS 포스트", "카드뉴스", "비디오 스크립트", "텔레그램/유튜브 콘텐츠"]
    },
    {
      id: "DANNY" as Agent,
      name: "대니 (Danny)",
      role: "데이터 분석가",
      description: "고객 세그멘테이션 및 활동 분석",
      status: "active",
      avatar: "📊",
      color: "neon-blue",
      tasks: ["find_dormant", "segment_customers", "suggest_reactivation"],
      capabilities: ["VIP 고객 식별", "휴면 고객 감지", "재활성화 캠페인", "보존 인사이트"]
    },
    {
      id: "RAY" as Agent,
      name: "레이 (Ray)",
      role: "경영 어시스턴트",
      description: "개인 비서 및 AI 팀 오케스트레이터",
      status: "active",
      avatar: "🎯",
      color: "accent",
      tasks: ["create_pipeline", "summarize_daily", "dispatch_tasks"],
      capabilities: ["일정 관리", "마감일 리마인드", "워크플로우 트리거", "AI 결과 요약"]
    },
    {
      id: "LEO" as Agent,
      name: "레오 (Leo)",
      role: "전략 어드바이저",
      description: "시장 및 리스크 전략가",
      status: "active",
      avatar: "🧠",
      color: "crypto-gold",
      tasks: ["market_pulse", "risk_brief", "exchange_priority"],
      capabilities: ["시장 펄스 리포트", "기회/리스크 알림", "거래소 우선순위", "전략 인사이트"]
    },
    {
      id: "ALPHA" as Agent,
      name: "알파 (Alpha)",
      role: "기회 탐색가",
      description: "성장 기회 발굴 및 모니터링",
      status: "active",
      avatar: "🔍",
      color: "neon-green",
      tasks: ["scan_opportunities", "rank_airdrops", "event_alert"],
      capabilities: ["신규 코인 모니터링", "에어드랍 기회", "이벤트 알림", "ROI 우선순위"]
    },
    {
      id: "GUARDIAN" as Agent,
      name: "가디언 (Guardian)",
      role: "컴플라이언스 오피서",
      description: "리스크 및 규정 준수 게이트키퍼",
      status: "active",
      avatar: "🛡️",
      color: "red-500",
      tasks: ["review_content", "score_compliance", "fix_risky_phrases"],
      capabilities: ["콘텐츠 검토", "규정 준수 검증", "리스크 스코어링", "법적 검토"]
    }
  ];

  const quickTasks = {
    CREA: [
      { name: "generate_social_post", label: "시장 분석 포스트", icon: TrendingUp },
      { name: "schedule_post", label: "예약 게시물", icon: Calendar },
      { name: "transform_signal_to_content", label: "시그널→콘텐츠", icon: Sparkles }
    ],
    DANNY: [
      { name: "find_dormant", label: "휴면 고객 찾기", icon: Users },
      { name: "segment_customers", label: "고객 세그먼트", icon: BarChart3 },
      { name: "suggest_reactivation", label: "재활성화 전략", icon: Target }
    ],
    RAY: [
      { name: "create_pipeline", label: "워크플로우 생성", icon: Activity },
      { name: "summarize_daily", label: "일일 요약", icon: FileText },
      { name: "dispatch_tasks", label: "작업 배포", icon: Send }
    ],
    LEO: [
      { name: "market_pulse", label: "시장 펄스", icon: Brain },
      { name: "risk_brief", label: "리스크 브리프", icon: AlertCircle },
      { name: "exchange_priority", label: "거래소 우선순위", icon: TrendingUp }
    ],
    ALPHA: [
      { name: "scan_opportunities", label: "기회 스캔", icon: Search },
      { name: "rank_airdrops", label: "에어드랍 순위", icon: Zap },
      { name: "event_alert", label: "이벤트 알림", icon: Bell }
    ],
    GUARDIAN: [
      { name: "review_content", label: "콘텐츠 검토", icon: Shield },
      { name: "score_compliance", label: "컴플라이언스 점수", icon: CheckCircle },
      { name: "fix_risky_phrases", label: "위험 문구 수정", icon: AlertCircle }
    ]
  };

  useEffect(() => {
    loadTasks();
    loadPipelines();
    const interval = setInterval(() => {
      loadTasks();
      loadPipelines();
    }, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadTasks = async () => {
    try {
      const response = await aiApi.getTasks({ limit: 50 });
      setTasks(response.data || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const loadPipelines = async () => {
    try {
      const response = await aiApi.getPipelines({ limit: 20 });
      setPipelines(response.data || []);
    } catch (error) {
      console.error('Failed to load pipelines:', error);
    }
  };

  const createTask = async (agent: Agent, taskName: string, input?: any) => {
    try {
      setIsGenerating(true);
      const response = await aiApi.createTask({
        agent,
        name: taskName,
        input: input || {}
      });
      
      toast({
        title: "AI 작업 생성됨",
        description: `${agent} 에이전트가 작업을 시작했습니다.`,
      });
      
      loadTasks(); // Refresh tasks
      return response.data;
    } catch (error: any) {
      toast({
        title: "작업 생성 실패",
        description: error.message || "알 수 없는 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    const agent = agents.find(a => a.id === selectedAgent);
    if (!agent) return;

    const input = {
      prompt: chatMessage,
      template: "chat_response",
      context: "user_chat"
    };

    await createTask(selectedAgent, agent.tasks[0], input);
    setChatMessage("");
  };

  const executeQuickTask = async (taskName: string) => {
    let input: any = {};

    // Customize input based on task
    switch (taskName) {
      case "generate_social_post":
        input = {
          signal: "Market analysis",
          template: "short_tweet",
          platform: "Twitter",
          branding: "CoinToss Partner"
        };
        break;
      case "find_dormant":
        input = { days: 21 };
        break;
      case "market_pulse":
        input = { timeframe: "24h", focus: "major_coins" };
        break;
      case "review_content":
        input = { content: chatMessage || "Sample content for review" };
        break;
    }

    await createTask(selectedAgent, taskName, input);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCEEDED': return <CheckCircle className="w-4 h-4 text-accent" />;
      case 'FAILED': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'RUNNING': return <RefreshCw className="w-4 h-4 text-primary animate-spin" />;
      case 'QUEUED': return <Clock className="w-4 h-4 text-muted-foreground" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCEEDED': return 'border-accent text-accent';
      case 'FAILED': return 'border-destructive text-destructive';
      case 'RUNNING': return 'border-primary text-primary';
      case 'QUEUED': return 'border-muted-foreground text-muted-foreground';
      default: return 'border-muted-foreground text-muted-foreground';
    }
  };

  const selectedAgentData = agents.find(a => a.id === selectedAgent);
  const agentTasks = tasks.filter(t => t.agent === selectedAgent);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My AI-Assistants</h1>
          <p className="text-muted-foreground">6인의 전문 AI 팀이 24시간 자동화 업무를 수행합니다</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="border-neon-blue text-neon-blue pulse-slow">
            <Activity className="w-3 h-3 mr-1" />
            {tasks.filter(t => t.status === 'RUNNING').length}개 실행중
          </Badge>
          <Badge variant="outline" className="border-accent text-accent">
            <CheckCircle className="w-3 h-3 mr-1" />
            {tasks.filter(t => t.status === 'SUCCEEDED').length}개 완료
          </Badge>
        </div>
      </div>

      {/* AI Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const agentTaskCount = tasks.filter(t => t.agent === agent.id).length;
          const successRate = agentTaskCount > 0 
            ? (tasks.filter(t => t.agent === agent.id && t.status === 'SUCCEEDED').length / agentTaskCount * 100)
            : 0;

          return (
            <Card 
              key={agent.id} 
              className={`bg-gradient-card border-border/50 glass hover:shadow-glow transition-all duration-300 cursor-pointer ${
                selectedAgent === agent.id ? 'ring-2 ring-primary shadow-crypto' : ''
              }`}
              onClick={() => setSelectedAgent(agent.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{agent.avatar}</div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <CardDescription>{agent.role}</CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={agent.status === 'active' ? 'border-accent text-accent' : 'border-muted-foreground text-muted-foreground'}
                  >
                    {agent.status === 'active' ? '활성' : '대기'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{agent.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">오늘 작업</span>
                    <span className="text-neon-blue font-semibold">{agentTaskCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">성공률</span>
                    <span className="text-accent font-semibold">{successRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={successRate} className="h-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="chat" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MessageSquare className="w-4 h-4 mr-2" />
            AI 채팅
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Activity className="w-4 h-4 mr-2" />
            작업 현황
          </TabsTrigger>
          <TabsTrigger value="pipelines" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Settings className="w-4 h-4 mr-2" />
            파이프라인
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <Card className="lg:col-span-2 bg-gradient-card border-border/50 glass">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{selectedAgentData?.avatar}</div>
                  <div>
                    <CardTitle>{selectedAgentData?.name}와 대화</CardTitle>
                    <CardDescription>{selectedAgentData?.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-96 w-full rounded-md border border-border/50 p-4">
                  <div className="space-y-4">
                    {agentTasks.slice(0, 10).map((task, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-end">
                          <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[80%]">
                            <p className="text-sm">작업: {task.name}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(task.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        {task.output && (
                          <div className="flex justify-start">
                            <div className="bg-muted/50 text-foreground rounded-lg p-3 max-w-[80%]">
                              <p className="text-sm whitespace-pre-wrap">
                                {typeof task.output === 'object' 
                                  ? task.output.content || JSON.stringify(task.output, null, 2)
                                  : task.output
                                }
                              </p>
                              {task.finished_at && (
                                <p className="text-xs opacity-70 mt-1">
                                  {new Date(task.finished_at).toLocaleTimeString()}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {isGenerating && (
                      <div className="flex justify-start">
                        <div className="bg-muted/50 text-foreground rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-sm">AI가 작업을 수행 중...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="flex space-x-2">
                  <Textarea 
                    placeholder={`${selectedAgentData?.name}에게 작업을 요청하세요...`}
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-1 min-h-[60px] bg-muted/50"
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={isGenerating || !chatMessage.trim()}
                    className="bg-gradient-primary hover:shadow-glow"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-card border-border/50 glass">
              <CardHeader>
                <CardTitle className="text-lg">빠른 작업</CardTitle>
                <CardDescription>{selectedAgentData?.name} 전용 작업들</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="mb-4">
                  <Select value={selectedAgent} onValueChange={(value: Agent) => setSelectedAgent(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.avatar} {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {quickTasks[selectedAgent]?.map((task, index) => {
                  const Icon = task.icon;
                  return (
                    <Button 
                      key={index}
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => executeQuickTask(task.name)}
                      disabled={isGenerating}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {task.label}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">AI 작업 현황</h3>
            <Button onClick={loadTasks} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              새로고침
            </Button>
          </div>

          <div className="space-y-4">
            {tasks.slice(0, 20).map((task) => (
              <Card key={task.id} className="bg-gradient-card border-border/50 glass">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge variant="outline" className="border-neon-blue text-neon-blue">
                          {task.agent}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(task.status)}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1">{task.status}</span>
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-foreground">{task.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        생성: {new Date(task.created_at).toLocaleString()}
                      </p>
                      {task.finished_at && (
                        <p className="text-sm text-muted-foreground">
                          완료: {new Date(task.finished_at).toLocaleString()}
                        </p>
                      )}
                      {task.error_message && (
                        <p className="text-sm text-destructive mt-2">{task.error_message}</p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      {task.output && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const content = typeof task.output === 'object' 
                              ? JSON.stringify(task.output, null, 2)
                              : String(task.output);
                            navigator.clipboard.writeText(content);
                            toast({ title: "복사 완료", description: "결과가 클립보드에 복사되었습니다." });
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                      {task.status === 'QUEUED' || task.status === 'RUNNING' ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            try {
                              await aiApi.cancelTask(task.id);
                              loadTasks();
                              toast({ title: "작업 취소됨", description: "작업이 성공적으로 취소되었습니다." });
                            } catch (error) {
                              toast({ title: "취소 실패", description: "작업 취소에 실패했습니다.", variant: "destructive" });
                            }
                          }}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  
                  {task.output && selectedTask === task.id && (
                    <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap overflow-auto">
                        {typeof task.output === 'object' 
                          ? JSON.stringify(task.output, null, 2)
                          : task.output
                        }
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pipelines" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">AI 파이프라인</h3>
            <Button 
              onClick={async () => {
                const pipeline = {
                  name: "휴면 고객 재활성화 캠페인",
                  context: { campaignType: "reactivation" },
                  steps: [
                    { agent: "DANNY", name: "find_dormant", input: { days: 21 } },
                    { agent: "CREA", name: "generate_social_post", inputFrom: "$step[0].output" },
                    { agent: "GUARDIAN", name: "review_content", inputFrom: "$step[1].output" }
                  ]
                };
                try {
                  await aiApi.createPipeline(pipeline);
                  loadPipelines();
                  toast({ title: "파이프라인 생성", description: "샘플 파이프라인이 생성되었습니다." });
                } catch (error) {
                  toast({ title: "생성 실패", description: "파이프라인 생성에 실패했습니다.", variant: "destructive" });
                }
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              샘플 파이프라인
            </Button>
          </div>

          <div className="space-y-4">
            {pipelines.map((pipeline) => (
              <Card key={pipeline.id} className="bg-gradient-card border-border/50 glass">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge variant="outline" className={getStatusColor(pipeline.status)}>
                          {getStatusIcon(pipeline.status)}
                          <span className="ml-1">{pipeline.status}</span>
                        </Badge>
                        {pipeline.ai_tasks && (
                          <Badge variant="outline">
                            {pipeline.ai_tasks.length}개 작업
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-foreground">{pipeline.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        생성: {new Date(pipeline.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {pipeline.ai_tasks && pipeline.ai_tasks.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h5 className="font-medium text-sm">파이프라인 단계:</h5>
                      {pipeline.ai_tasks.map((task, index) => (
                        <div key={task.id} className="flex items-center justify-between p-2 bg-muted/10 rounded">
                          <span className="text-sm">
                            {index + 1}. {task.agent} - {task.name}
                          </span>
                          <Badge variant="outline" className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAssistants;