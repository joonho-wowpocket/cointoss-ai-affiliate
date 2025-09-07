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
    // Generate contextual responses based on conversation history
    const conversationLength = currentMessages.length;
    const isFollowUp = conversationLength > 0;
    
    const contextualResponses = {
      'CREA': [
        `📝 ${agent.name}입니다! "${userInput}"에 대한 콘텐츠를 생성하겠습니다. 

어떤 플랫폼용 콘텐츠를 원하시나요?
- 📱 SNS 포스트 (Twitter, Instagram)
- 📺 YouTube 스크립트
- 📋 블로그 아티클
- 🎨 비주얼 콘텐츠`,

        `✨ 좋은 아이디어네요! "${userInput}"를 바탕으로 다음과 같은 콘텐츠를 제안드립니다:

🎯 **메인 메시지**: 차별화된 가치 제안
📝 **콘텐츠 구조**: 
1. 훅(관심 끌기)
2. 핵심 내용
3. 행동 유도

더 구체적인 방향을 알려주시면 맞춤형 콘텐츠를 만들어드릴게요!`,

        `🚀 콘텐츠 전략을 세워보겠습니다!

"${userInput}"에 대한 분석:
- 타겟 오디언스: 암호화폐 투자자
- 핵심 키워드: 수익성, 신뢰성, 혁신
- 감정적 포인트: FOMO, 성공욕구

어떤 톤앤매너를 선호하시나요? (전문적/친근한/유머러스)`
      ],

      'DANNY': [
        `📊 ${agent.name}입니다! "${userInput}"에 대한 데이터 분석을 시작하겠습니다.

현재 가능한 분석:
- 👥 고객 세그먼테이션
- 📈 성과 지표 분석  
- 🎯 타겟 분석
- 💤 휴면 고객 식별`,

        `📈 데이터 인사이트를 발견했습니다!

"${userInput}" 관련 분석 결과:
- 전환율: 상위 20% 성과
- 고객 생애가치: 평균 대비 35% 높음
- 리텐션: 6개월 82% 유지

추가로 어떤 세그먼트를 분석해볼까요?`,

        `🎯 패턴 분석이 완료되었습니다!

"${userInput}"에서 흥미로운 트렌드를 발견:
- 피크 시간대: 오후 2-4시, 저녁 8-10시
- 선호 채널: 모바일 75%, 웹 25%
- 행동 패턴: 비교검토 → 의사결정 평균 3.2일

다음 단계로 무엇을 분석해드릴까요?`
      ],

      'RAY': [
        `🎯 ${agent.name}입니다! "${userInput}"를 도와드리겠습니다.

업무 지원 가능 영역:
- 📅 일정 관리
- 📋 작업 우선순위 설정
- 🔄 워크플로우 자동화
- 📊 일일 요약 리포트`,

        `✅ "${userInput}" 작업을 정리해드렸습니다!

**우선순위별 분류:**
🔴 긴급: 즉시 처리 필요 (2개)
🟡 중요: 이번 주 내 완료 (5개)
🟢 일반: 다음 주까지 (3개)

어떤 작업부터 시작하시겠습니까?`,

        `⚡ 워크플로우를 최적화했습니다!

"${userInput}" 프로세스 개선안:
- 기존 소요시간: 120분
- 개선 후: 45분 (62% 단축)
- 자동화 구간: 3단계
- 품질 체크포인트: 2곳

실행하시겠습니까?`
      ],

      'LEO': [
        `🧠 ${agent.name}입니다! "${userInput}"에 대한 전략적 인사이트를 제공하겠습니다.

분석 가능한 영역:
- 📈 시장 동향 분석
- ⚡ 기회/위험 요소
- 🎯 전략적 우선순위
- 💡 성장 기회 발굴`,

        `💡 전략적 분석이 완료되었습니다!

"${userInput}" 기회 분석:
🟢 **강점:** 시장 선점 가능성 높음
🟡 **위험:** 경쟁사 진입 예상 (3개월 내)
🔵 **기회:** 신규 고객층 확보 가능
🔴 **위협:** 규제 변화 모니터링 필요

다음 단계 전략을 수립해드릴까요?`,

        `🎯 성장 전략을 제안드립니다!

"${userInput}" 로드맵:
**Phase 1 (1-3개월):** 기반 구축
- 핵심 기능 개발
- 초기 고객 확보

**Phase 2 (4-6개월):** 확장
- 마케팅 강화  
- 파트너십 구축

실행 계획을 상세히 논의해볼까요?`
      ],

      'ALPHA': [
        `🔍 ${agent.name}입니다! "${userInput}"와 관련된 기회를 탐색하겠습니다.

탐색 영역:
- 🪙 신규 코인 모니터링
- 🎁 에어드랍 기회
- 📢 이벤트 알림
- 💰 수익 기회 분석`,

        `🚨 흥미로운 기회를 발견했습니다!

"${userInput}" 관련 알파 정보:
- 🆕 신규 런치패드 프로젝트 3개
- 💎 저평가된 토큰 발견
- 🎯 에어드랍 예정: 2개 프로젝트
- 📊 시장 모멘텀: 상승 신호

어떤 기회를 우선 탐색해보시겠습니까?`,

        `⚡ 실시간 모니터링 결과입니다!

"${userInput}" 업데이트:
- 거래량 급증: +340% (지난 24h)
- 소셜 멘션: 급상승 트렌드
- 개발팀 활동: 활발 (Github 커밋 증가)
- 파트너십: 주요 거래소 상장 루머

포지션 진입 타이밍을 분석해드릴까요?`
      ],

      'GUARDIAN': [
        `🛡️ ${agent.name}입니다! "${userInput}"에 대한 컴플라이언스 검토를 진행하겠습니다.

검토 항목:
- ⚖️ 법적 리스크 평가
- 📋 규정 준수 확인
- 🚨 위험 요소 식별
- ✅ 승인 여부 판단`,

        `⚠️ 컴플라이언스 검토가 완료되었습니다.

"${userInput}" 리스크 평가:
🟢 **낮음:** 기본 규정 준수
🟡 **중간:** 추가 문서화 권장
🔴 **높음:** 법무팀 검토 필요

세부 개선사항을 안내해드릴까요?`,

        `✅ 규정 준수 가이드를 제공합니다.

"${userInput}" 컴플라이언스 체크리스트:
- KYC/AML 절차: ✅ 완료
- 라이선스 요구사항: 🔄 진행중
- 데이터 보호: ✅ GDPR 준수
- 금융 규제: ⚠️ 업데이트 필요

우선순위 개선 항목을 실행하시겠습니까?`
      ]
    };

    const responses = contextualResponses[agent.id as keyof typeof contextualResponses];
    if (!responses) return `${agent.name}가 응답 중입니다...`;

    // Return different responses based on conversation progress
    const responseIndex = Math.min(conversationLength, responses.length - 1);
    return responses[responseIndex];
  };

  const currentMessages = messages.filter(msg => msg.agentId === selectedAgent.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-h-[calc(100vh-300px)] min-h-[500px]">
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
        <Card className="h-full bg-gradient-card border-border/50 glass flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
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
          
          <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
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
            <div className="p-4 border-t border-border/50 flex-shrink-0">
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