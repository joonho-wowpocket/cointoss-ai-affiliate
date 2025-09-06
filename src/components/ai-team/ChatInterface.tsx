import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, Bot, User, Sparkles, BarChart3, Target, Brain, Search, Shield } from "lucide-react";
import { AIAgentList } from "./AIAgentList";
import { MessageComponent } from "./MessageComponent";
import { ActionPanel } from "./ActionPanel";
import { aiAgents, type AIAgent, type ChatMessage } from "@/lib/types/ai-team";

export const ChatInterface = () => {
  const [selectedAgent, setSelectedAgent] = useState<AIAgent>(aiAgents[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSendMessage = async () => {
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

  const generateMockResponse = (agent: AIAgent, userInput: string): string => {
    const responses = {
      'CREA': `📝 ${agent.name}입니다! "${userInput}"에 대한 콘텐츠를 생성하겠습니다. 
      
어떤 플랫폼용 콘텐츠를 원하시나요?
- 📱 SNS 포스트 (Twitter, Instagram)
- 📺 YouTube 스크립트
- 📋 블로그 아티클
- 🎨 비주얼 콘텐츠`,

      'DANNY': `📊 ${agent.name}입니다! "${userInput}"에 대한 데이터 분석을 시작하겠습니다.

현재 가능한 분석:
- 👥 고객 세그먼테이션
- 📈 성과 지표 분석  
- 🎯 타겟 분석
- 💤 휴면 고객 식별`,

      'RAY': `🎯 ${agent.name}입니다! "${userInput}"를 도와드리겠습니다.

업무 지원 가능 영역:
- 📅 일정 관리
- 📋 작업 우선순위 설정
- 🔄 워크플로우 자동화
- 📊 일일 요약 리포트`,

      'LEO': `🧠 ${agent.name}입니다! "${userInput}"에 대한 전략적 인사이트를 제공하겠습니다.

분석 가능한 영역:
- 📈 시장 동향 분석
- ⚡ 기회/위험 요소
- 🎯 전략적 우선순위
- 💡 성장 기회 발굴`,

      'ALPHA': `🔍 ${agent.name}입니다! "${userInput}"와 관련된 기회를 탐색하겠습니다.

탐색 영역:
- 🪙 신규 코인 모니터링
- 🎁 에어드랍 기회
- 📢 이벤트 알림
- 💰 수익 기회 분석`,

      'GUARDIAN': `🛡️ ${agent.name}입니다! "${userInput}"에 대한 컴플라이언스 검토를 진행하겠습니다.

검토 항목:
- ⚖️ 법적 리스크 평가
- 📋 규정 준수 확인
- 🚨 위험 요소 식별
- ✅ 승인 여부 판단`
    };

    return responses[agent.id as keyof typeof responses] || `${agent.name}가 응답 중입니다...`;
  };

  const currentMessages = messages.filter(msg => msg.agentId === selectedAgent.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
      {/* Left Panel - AI Agents */}
      <div className="lg:col-span-1">
        <AIAgentList 
          agents={aiAgents}
          selectedAgent={selectedAgent}
          onSelectAgent={setSelectedAgent}
        />
      </div>

      {/* Center Panel - Chat */}
      <div className="lg:col-span-2">
        <Card className="h-full bg-gradient-card border-border/50 glass">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedAgent.avatar} alt={selectedAgent.name} />
                <AvatarFallback>{selectedAgent.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{selectedAgent.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{selectedAgent.role}</p>
              </div>
              <Badge variant="outline" className="ml-auto border-accent text-accent">
                온라인
              </Badge>
            </div>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="flex flex-col h-full p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {currentMessages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">{selectedAgent.avatar}</div>
                    <p className="text-muted-foreground">
                      {selectedAgent.name}과 대화를 시작해보세요
                    </p>
                  </div>
                )}
                
                {currentMessages.map((message) => (
                  <MessageComponent key={message.id} message={message} agent={selectedAgent} />
                ))}
                
                {isGenerating && (
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={selectedAgent.avatar} alt={selectedAgent.name} />
                      <AvatarFallback>{selectedAgent.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted/50 rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin">⚡</div>
                        <span className="text-sm">AI가 응답을 생성 중...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border/50">
              <div className="flex space-x-2">
                <Textarea
                  placeholder={`${selectedAgent.name}에게 메시지를 보내세요...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 min-h-[60px] bg-muted/50 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isGenerating}
                  className="bg-gradient-primary hover:shadow-glow px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Actions */}
      <div className="lg:col-span-1">
        <ActionPanel agent={selectedAgent} />
      </div>
    </div>
  );
};