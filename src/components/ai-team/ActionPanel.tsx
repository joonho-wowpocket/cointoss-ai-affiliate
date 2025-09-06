import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Zap, 
  Download, 
  ExternalLink, 
  Sparkles,
  BarChart3,
  Target,
  FileText,
  Users,
  Search,
  Shield
} from "lucide-react";
import { type AIAgent } from "@/lib/types/ai-team";
import { useToast } from "@/hooks/use-toast";

interface ActionPanelProps {
  agent: AIAgent;
}

export const ActionPanel = ({ agent }: ActionPanelProps) => {
  const { toast } = useToast();

  const handleQuickAction = (action: string) => {
    toast({
      title: "액션 실행",
      description: `${action} 작업을 시작했습니다.`,
    });
  };

  const getQuickActions = (agentId: string) => {
    const actions = {
      'CREA': [
        { name: "SNS 포스트 생성", icon: Sparkles, action: "generate_social_post" },
        { name: "콘텐츠 스케줄", icon: FileText, action: "schedule_content" },
        { name: "시그널→콘텐츠", icon: Target, action: "transform_signal" }
      ],
      'DANNY': [
        { name: "고객 세그먼트", icon: Users, action: "segment_customers" },
        { name: "휴면 고객 찾기", icon: Search, action: "find_dormant" },
        { name: "성과 분석", icon: BarChart3, action: "analyze_performance" }
      ],
      'RAY': [
        { name: "일일 요약", icon: FileText, action: "daily_summary" },
        { name: "워크플로우 생성", icon: Zap, action: "create_workflow" },
        { name: "작업 배포", icon: Target, action: "dispatch_tasks" }
      ],
      'LEO': [
        { name: "시장 분석", icon: BarChart3, action: "market_analysis" },
        { name: "전략 제안", icon: Target, action: "strategy_suggestion" },
        { name: "리스크 평가", icon: Shield, action: "risk_assessment" }
      ],
      'ALPHA': [
        { name: "기회 스캔", icon: Search, action: "opportunity_scan" },
        { name: "에어드랍 체크", icon: Sparkles, action: "airdrop_check" },
        { name: "이벤트 모니터", icon: Zap, action: "event_monitor" }
      ],
      'GUARDIAN': [
        { name: "컴플라이언스 검토", icon: Shield, action: "compliance_check" },
        { name: "리스크 스코어", icon: BarChart3, action: "risk_score" },
        { name: "법적 검토", icon: FileText, action: "legal_review" }
      ]
    };

    return actions[agentId as keyof typeof actions] || [];
  };

  const quickActions = getQuickActions(agent.id);

  return (
    <Card className="bg-gradient-card border-border/50 glass h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">빠른 작업</CardTitle>
        <p className="text-sm text-muted-foreground">
          {agent.name}의 주요 기능들
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="space-y-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start h-auto p-3 hover:bg-muted/50"
              onClick={() => handleQuickAction(action.name)}
            >
              <action.icon className="w-4 h-4 mr-3 text-primary" />
              <div className="text-left">
                <div className="font-medium text-sm">{action.name}</div>
              </div>
            </Button>
          ))}
        </div>

        <Separator />

        {/* Capabilities */}
        <div>
          <h4 className="font-medium text-sm mb-3">핵심 역량</h4>
          <div className="flex flex-wrap gap-2">
            {agent.capabilities.map((capability, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {capability}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Export Actions */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm mb-2">내보내기</h4>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => handleQuickAction("MyLink 연동")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            MyLink에 추가
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => handleQuickAction("Marketplace 등록")}
          >
            <Download className="w-4 h-4 mr-2" />
            Marketplace 등록
          </Button>
        </div>

        {/* Agent Stats */}
        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">오늘 작업</span>
            <span className="font-semibold text-accent">12</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">성공률</span>
            <span className="font-semibold text-accent">94.2%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">응답 시간</span>
            <span className="font-semibold text-primary">1.2초</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};