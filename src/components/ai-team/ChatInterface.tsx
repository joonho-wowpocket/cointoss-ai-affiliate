import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, Bot, User, Sparkles, BarChart3, Target, Brain, Search, Shield, Lock, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { GuestBanner } from "@/components/GuestBanner";
import { LoginModal } from "@/components/auth/LoginModal";
import { AIAgentList } from "./AIAgentList";
import { MessageComponent } from "./MessageComponent";
import { ActionPanel } from "./ActionPanel";
import { aiAgents, type AIAgent, type ChatMessage } from "@/lib/types/ai-team";

export const ChatInterface = () => {
  const { isGuest } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<AIAgent>(aiAgents[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Guest preview messages
  const guestMessages: ChatMessage[] = [
    {
      id: "guest-1",
      sender: 'user',
      content: "안녕하세요! 비트코인 시장 분석을 부탁드립니다.",
      type: 'text',
      timestamp: new Date(Date.now() - 300000),
      agentId: 'CREA'
    },
    {
      id: "guest-2", 
      sender: 'ai',
      content: "안녕하세요! 현재 비트코인 시장을 분석해드리겠습니다.\n\n📊 **기술적 분석**\n- 현재가: $42,350 (+2.3%)\n- RSI: 68 (과매수 근접)\n- 이동평균선: 상향 돌파 패턴\n\n🎯 **전망**\n단기적으로 $45,000 저항선 테스트 예상되며, 거래량 증가시 돌파 가능성이 높습니다. 리스크 관리를 위해 분할 매수를 추천드립니다.",
      type: 'text',
      timestamp: new Date(Date.now() - 240000),
      agentId: 'CREA'
    }
  ];

  const displayMessages = isGuest ? guestMessages : messages;

  const handleSendMessage = async () => {
    if (isGuest) {
      setShowLoginModal(true);
      return;
    }
    
    if (!inputMessage.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      type: 'text',
      timestamp: new Date(),
      agentId: selectedAgent.id
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsGenerating(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: generateMockResponse(selectedAgent, inputMessage),
        type: 'text',
        timestamp: new Date(),
        agentId: selectedAgent.id
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsGenerating(false);
    }, 2000);
  };

  const generateMockResponse = (agent: AIAgent, prompt: string): string => {
    const responses = {
      CREA: "크리에이티브한 콘텐츠를 생성했습니다! 📝",
      DANNY: "데이터 분석 결과를 준비했습니다 📊",
      SARAH: "고객 소통 전략을 제안드립니다 💬",
      ALEX: "성과 최적화 방안을 분석했습니다 📈",
      MAYA: "법률 리스크를 검토했습니다 ⚖️",
      FINN: "재무 분석을 완료했습니다 💰"
    };
    return responses[agent.id as keyof typeof responses] || "요청을 처리했습니다.";
  };

  return (
    <div className="space-y-6">
      {isGuest && <GuestBanner onLoginClick={() => setShowLoginModal(true)} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-240px)]">
        {/* AI Agent List */}
        <div className="lg:col-span-1">
          <AIAgentList
            agents={aiAgents}
            selectedAgent={selectedAgent}
            onSelectAgent={setSelectedAgent}
          />
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={selectedAgent.avatar} />
                  <AvatarFallback>{selectedAgent.id}</AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-lg font-bold">{selectedAgent.name}</span>
                  <p className="text-sm text-muted-foreground">{selectedAgent.role}</p>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  {selectedAgent.status === 'active' ? '온라인' : '오프라인'}
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4 p-4">
                  {displayMessages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>대화를 시작해보세요!</p>
                    </div>
                  ) : (
                    displayMessages.map((message) => (
                      <MessageComponent
                        key={message.id}
                        message={message}
                        agent={selectedAgent}
                      />
                    ))
                  )}
                  
                  {isGenerating && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>AI가 응답을 생성 중...</span>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <Separator />
              
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-4">
                <div className="flex gap-2">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={isGuest ? "로그인 후 AI와 대화해보세요..." : "메시지를 입력하세요..."}
                    className="flex-1 min-h-[44px] max-h-32 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isGuest}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!inputMessage.trim() || isGenerating || isGuest}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isGuest ? (
                      <Lock className="w-4 h-4" />
                    ) : isGenerating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-1">
          <ActionPanel />
        </div>
      </div>
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
};