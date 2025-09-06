import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Shield, 
  Zap,
  Play
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiApi } from "@/lib/api";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  agent: 'CREA' | 'DANNY' | 'RAY' | 'LEO' | 'ALPHA' | 'GUARDIAN';
  taskName: string;
  icon: any;
  color: string;
  input?: any;
}

const quickActions: QuickAction[] = [
  {
    id: 'market-pulse',
    title: '시장 분석 포스트',
    description: '현재 시장 상황을 분석한 SNS 콘텐츠 생성',
    agent: 'CREA',
    taskName: 'generate_social_post',
    icon: TrendingUp,
    color: 'border-purple-200 bg-purple-50 text-purple-700',
    input: {
      signal: 'Market analysis',
      template: 'short_tweet',
      platform: 'Twitter'
    }
  },
  {
    id: 'dormant-analysis',
    title: '휴면 고객 분석',
    description: '21일 이상 비활성 고객 세그먼트 식별',
    agent: 'DANNY',
    taskName: 'find_dormant',
    icon: Users,
    color: 'border-blue-200 bg-blue-50 text-blue-700',
    input: { days: 21 }
  },
  {
    id: 'opportunity-scan',
    title: '기회 스캔',
    description: '새로운 에어드랍 및 이벤트 기회 탐색',
    agent: 'ALPHA',
    taskName: 'scan_opportunities',
    icon: Zap,
    color: 'border-orange-200 bg-orange-50 text-orange-700'
  },
  {
    id: 'compliance-check',
    title: '컴플라이언스 검토',
    description: '최근 콘텐츠의 규정 준수 상태 점검',
    agent: 'GUARDIAN',
    taskName: 'score_compliance',
    icon: Shield,
    color: 'border-red-200 bg-red-50 text-red-700'
  },
  {
    id: 'daily-summary',
    title: '일일 요약',
    description: 'AI 팀 활동 및 성과 종합 리포트',
    agent: 'RAY',
    taskName: 'summarize_daily',
    icon: BarChart3,
    color: 'border-green-200 bg-green-50 text-green-700'
  },
  {
    id: 'reactivation-pipeline',
    title: '재활성화 캠페인',
    description: '휴면 고객 재활성화 파이프라인 실행',
    agent: 'RAY',
    taskName: 'create_pipeline',
    icon: Sparkles,
    color: 'border-yellow-200 bg-yellow-50 text-yellow-700'
  }
];

export const AIQuickActions = () => {
  const { toast } = useToast();
  const [executingAction, setExecutingAction] = useState<string | null>(null);

  const executeAction = async (action: QuickAction) => {
    try {
      setExecutingAction(action.id);

      if (action.id === 'reactivation-pipeline') {
        // Execute pipeline
        const pipeline = {
          name: "휴면 고객 재활성화 캠페인",
          context: { campaignType: "reactivation", trigger: "quick_action" },
          steps: [
            { agent: "DANNY", name: "find_dormant", input: { days: 21 } },
            { agent: "CREA", name: "generate_social_post", inputFrom: "$step[0].output" },
            { agent: "GUARDIAN", name: "review_content", inputFrom: "$step[1].output" }
          ]
        };
        
        await aiApi.createPipeline(pipeline);
        
        toast({
          title: "파이프라인 시작됨",
          description: "휴면 고객 재활성화 캠페인 파이프라인이 시작되었습니다.",
        });
      } else {
        // Execute single task
        await aiApi.createTask({
          agent: action.agent,
          name: action.taskName,
          input: action.input || {}
        });
        
        toast({
          title: "AI 작업 시작",
          description: `${action.title} 작업이 시작되었습니다.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "실행 실패",
        description: error.message || "작업 실행에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setExecutingAction(null);
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50 glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI 빠른 작업
        </CardTitle>
        <CardDescription>원클릭으로 자주 사용하는 AI 작업 실행</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const isExecuting = executingAction === action.id;
            
            return (
              <div 
                key={action.id}
                className={`border rounded-lg p-4 hover:shadow-md transition-all ${action.color}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <Icon className="w-6 h-6" />
                  <Badge variant="outline" className="text-xs">
                    {action.agent}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  <h4 className="font-semibold text-sm">{action.title}</h4>
                  <p className="text-xs opacity-80">{action.description}</p>
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => executeAction(action)}
                  disabled={isExecuting}
                >
                  {isExecuting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      실행중...
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 mr-2" />
                      실행
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};