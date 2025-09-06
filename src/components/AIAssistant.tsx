import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AIAssistant = () => {
  const { toast } = useToast();
  const [selectedAssistant, setSelectedAssistant] = useState("crea");
  const [chatMessage, setChatMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data
  const assistants = [
    {
      id: "crea",
      name: "크레아 (Crea)",
      role: "콘텐츠 생성기",
      description: "GPT-4 기반 마케팅 콘텐츠 자동 생성",
      status: "active",
      tasksToday: 24,
      successRate: 94.2,
      avatar: "✨"
    },
    {
      id: "danny",
      name: "대니 (Danny)",
      role: "데이터 분석가",
      description: "고객 세그먼트 분석 및 최적화 전략 제시",
      status: "active", 
      tasksToday: 8,
      successRate: 89.7,
      avatar: "📊"
    }
  ];

  const chatHistory = [
    {
      type: "user",
      message: "비트코인 상승장에 대한 SNS 포스트를 만들어주세요",
      time: "14:32"
    },
    {
      type: "assistant",
      message: "🚀 #비트코인 이 새로운 고점을 향해 달려가고 있습니다!\n\n현재 시장 동향:\n• 24시간 상승률: +8.5%\n• 거래량 급증: +45%\n• 기관 투자 유입 지속\n\n⚡ 하지만 투자는 신중하게!\n📈 CoinToss에서 안전한 거래소를 추천받으세요\n\n#암호화폐 #투자 #CoinToss",
      time: "14:32"
    },
    {
      type: "user", 
      message: "이더리움 관련 카드뉴스도 만들어주세요",
      time: "14:35"
    },
    {
      type: "assistant",
      message: "이더리움 카드뉴스를 생성했습니다! 📋\n\n콘텐츠 구성:\n1. 커버: 이더리움 2024 전망\n2. 현재 가격 및 변동률\n3. 주요 업데이트 소식\n4. 전문가 의견\n5. CoinToss 추천 거래소\n\n미리보기와 다운로드가 준비되었습니다.",
      time: "14:35"
    }
  ];

  const generatedContent = [
    {
      id: 1,
      type: "social_post",
      title: "비트코인 상승장 SNS 포스트",
      content: "🚀 #비트코인 이 새로운 고점을 향해 달려가고 있습니다!...",
      platform: "Twitter",
      scheduled: "2024-01-20 15:00",
      status: "ready"
    },
    {
      id: 2,
      type: "card_news",
      title: "이더리움 2024 전망 카드뉴스",
      content: "5장의 카드뉴스로 구성된 이더리움 전망 콘텐츠",
      platform: "Instagram",
      scheduled: "2024-01-20 18:00", 
      status: "scheduled"
    },
    {
      id: 3,
      type: "analysis",
      title: "고객 세그먼트 분석 리포트",
      content: "VIP 고객 142명, 잠재 고객 89명 식별",
      platform: "Internal",
      scheduled: null,
      status: "completed"
    }
  ];

  const automationTasks = [
    {
      id: 1,
      name: "일일 시장 분석 포스트",
      assistant: "crea",
      frequency: "매일 09:00",
      lastRun: "2024-01-20 09:00",
      status: "active"
    },
    {
      id: 2,
      name: "주간 고객 분석 리포트",
      assistant: "danny", 
      frequency: "매주 월요일 10:00",
      lastRun: "2024-01-15 10:00",
      status: "active"
    },
    {
      id: 3,
      name: "거래소 프로모션 콘텐츠",
      assistant: "crea",
      frequency: "매주 수,금 14:00", 
      lastRun: "2024-01-19 14:00",
      status: "paused"
    }
  ];

  const sendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    setIsGenerating(true);
    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    setChatMessage("");
    
    toast({
      title: "메시지 전송 완료",
      description: "AI 어시스턴트가 응답을 생성 중입니다.",
    });
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "복사 완료",
      description: "콘텐츠가 클립보드에 복사되었습니다.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI 어시스턴트</h1>
          <p className="text-muted-foreground">24시간 자동화된 콘텐츠 생성과 데이터 분석</p>
        </div>
        <Badge variant="outline" className="border-neon-blue text-neon-blue pulse-slow">
          <Zap className="w-3 h-3 mr-1" />
          AI 활성화
        </Badge>
      </div>

      {/* AI Assistants Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assistants.map((assistant) => (
          <Card 
            key={assistant.id} 
            className={`bg-gradient-card border-border/50 glass hover:shadow-glow transition-all duration-300 cursor-pointer ${
              selectedAssistant === assistant.id ? 'ring-2 ring-primary shadow-crypto' : ''
            }`}
            onClick={() => setSelectedAssistant(assistant.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{assistant.avatar}</div>
                  <div>
                    <CardTitle className="text-lg">{assistant.name}</CardTitle>
                    <CardDescription>{assistant.role}</CardDescription>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={assistant.status === 'active' ? 'border-accent text-accent' : 'border-muted-foreground text-muted-foreground'}
                >
                  {assistant.status === 'active' ? '활성' : '대기'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{assistant.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">오늘 작업</span>
                  <p className="text-lg font-semibold text-neon-blue">{assistant.tasksToday}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">성공률</span>
                  <p className="text-lg font-semibold text-accent">{assistant.successRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="chat" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MessageSquare className="w-4 h-4 mr-2" />
            채팅
          </TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Sparkles className="w-4 h-4 mr-2" />
            생성된 콘텐츠
          </TabsTrigger>
          <TabsTrigger value="automation" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Settings className="w-4 h-4 mr-2" />
            자동화 설정
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <Card className="lg:col-span-2 bg-gradient-card border-border/50 glass">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {selectedAssistant === "crea" ? "✨" : "📊"}
                  </div>
                  <div>
                    <CardTitle>
                      {selectedAssistant === "crea" ? "크레아와 대화" : "대니와 대화"}
                    </CardTitle>
                    <CardDescription>
                      {selectedAssistant === "crea" 
                        ? "마케팅 콘텐츠 생성을 도와드립니다" 
                        : "데이터 분석과 인사이트를 제공합니다"
                      }
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-96 w-full rounded-md border border-border/50 p-4">
                  <div className="space-y-4">
                    {chatHistory.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.type === 'user' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted/50 text-foreground'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                        </div>
                      </div>
                    ))}
                    {isGenerating && (
                      <div className="flex justify-start">
                        <div className="bg-muted/50 text-foreground rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                            <span className="text-sm">AI가 응답을 생성 중...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="flex space-x-2">
                  <Textarea 
                    placeholder={
                      selectedAssistant === "crea" 
                        ? "원하는 콘텐츠 유형을 설명해주세요..." 
                        : "분석하고 싶은 데이터나 질문을 입력해주세요..."
                    }
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
                <CardDescription>자주 사용하는 AI 작업들</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedAssistant === "crea" ? (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setChatMessage("오늘의 시장 분석 SNS 포스트를 작성해주세요")}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      시장 분석 포스트
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setChatMessage("거래소 프로모션 카드뉴스를 만들어주세요")}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      프로모션 카드뉴스
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setChatMessage("이번 주 뉴스레터 콘텐츠를 준비해주세요")}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      뉴스레터 작성
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setChatMessage("VIP 고객 세그먼트를 분석해주세요")}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      VIP 고객 분석
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setChatMessage("최근 전환율 하락 원인을 찾아주세요")}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      전환율 분석
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setChatMessage("잠재 고객 재참여 전략을 제안해주세요")}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      재참여 전략
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">생성된 콘텐츠</h3>
            <Button className="bg-gradient-primary">
              <Download className="w-4 h-4 mr-2" />
              전체 다운로드
            </Button>
          </div>

          <div className="space-y-4">
            {generatedContent.map((content) => (
              <Card key={content.id} className="bg-gradient-card border-border/50 glass">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge 
                          variant="outline"
                          className={
                            content.type === 'social_post' 
                              ? 'border-neon-blue text-neon-blue'
                              : content.type === 'card_news'
                              ? 'border-neon-purple text-neon-purple'
                              : 'border-accent text-accent'
                          }
                        >
                          {content.type === 'social_post' && 'SNS 포스트'}
                          {content.type === 'card_news' && '카드뉴스'} 
                          {content.type === 'analysis' && '분석 리포트'}
                        </Badge>
                        <Badge 
                          variant={content.status === 'ready' ? 'default' : content.status === 'scheduled' ? 'secondary' : 'outline'}
                          className={
                            content.status === 'ready'
                              ? 'bg-accent/20 text-accent border-accent/30'
                              : content.status === 'scheduled'
                              ? 'bg-primary/20 text-primary border-primary/30'
                              : 'bg-muted/20 text-muted-foreground'
                          }
                        >
                          {content.status === 'ready' && '준비 완료'}
                          {content.status === 'scheduled' && '예약됨'}
                          {content.status === 'completed' && '완료'}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-foreground">{content.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{content.content}</p>
                      {content.scheduled && (
                        <div className="flex items-center text-xs text-muted-foreground mt-2">
                          <Calendar className="w-3 h-3 mr-1" />
                          {content.scheduled}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyContent(content.content)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">자동화 작업</h3>
            <Button className="bg-gradient-primary">
              <Play className="w-4 h-4 mr-2" />
              새 자동화 추가
            </Button>
          </div>

          <div className="space-y-4">
            {automationTasks.map((task) => (
              <Card key={task.id} className="bg-gradient-card border-border/50 glass">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge 
                          variant="outline"
                          className={
                            task.assistant === 'crea' 
                              ? 'border-neon-blue text-neon-blue' 
                              : 'border-accent text-accent'
                          }
                        >
                          {task.assistant === 'crea' ? '크레아' : '대니'}
                        </Badge>
                        <Badge 
                          variant={task.status === 'active' ? 'default' : 'secondary'}
                          className={
                            task.status === 'active'
                              ? 'bg-accent/20 text-accent border-accent/30'
                              : 'bg-muted/20 text-muted-foreground'
                          }
                        >
                          {task.status === 'active' ? '실행 중' : '일시 정지'}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-foreground">{task.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {task.frequency}
                        </div>
                        <div>마지막 실행: {task.lastRun}</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className={task.status === 'active' ? 'text-destructive' : 'text-accent'}
                      >
                        {task.status === 'active' ? (
                          <Pause className="w-3 h-3" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAssistant;