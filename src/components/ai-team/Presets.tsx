import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  Settings, 
  Copy,
  Edit,
  Trash2,
  Sparkles,
  Target,
  BarChart3,
  Shield,
  Zap,
  FileText
} from "lucide-react";
import { aiAgents } from "@/lib/types/ai-team";
import { useToast } from "@/hooks/use-toast";

interface AIPreset {
  id: string;
  name: string;
  description: string;
  agentId: string;
  template: string;
  variables: string[];
  category: string;
  useCount: number;
}

export const Presets = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const [presets] = useState<AIPreset[]>([
    {
      id: "1",
      name: "비트코인 분석 포스트",
      description: "비트코인 가격 동향을 분석하고 SNS용 포스트를 생성합니다",
      agentId: "CREA",
      template: "🚀 #{coin} 시장 분석\n\n현재 가격: ${price}\n24시간 변동: ${change}%\n\n#{trend_analysis}\n\n#비트코인 #암호화폐 #투자분석",
      variables: ["coin", "price", "change", "trend_analysis"],
      category: "content",
      useCount: 42
    },
    {
      id: "2", 
      name: "고객 세그먼트 분석",
      description: "고객 활동 데이터를 기반으로 VIP/일반/휴면 고객을 분류합니다",
      agentId: "DANNY",
      template: "고객 세그먼트 분석 보고서\n\n분석 기간: ${period}\n총 고객 수: ${total_customers}\n\nVIP 고객: ${vip_count}명 (${vip_percentage}%)\n일반 고객: ${regular_count}명 (${regular_percentage}%)\n휴면 고객: ${dormant_count}명 (${dormant_percentage}%)",
      variables: ["period", "total_customers", "vip_count", "vip_percentage", "regular_count", "regular_percentage", "dormant_count", "dormant_percentage"],
      category: "analytics",
      useCount: 28
    },
    {
      id: "3",
      name: "시장 리스크 알림",
      description: "시장 변동성이 높을 때 자동으로 리스크 경고를 생성합니다",
      agentId: "LEO",
      template: "⚠️ 시장 리스크 알림\n\n현재 변동성 수준: ${volatility_level}\n리스크 점수: ${risk_score}/100\n\n주요 위험 요소:\n${risk_factors}\n\n권장 조치:\n${recommendations}",
      variables: ["volatility_level", "risk_score", "risk_factors", "recommendations"],
      category: "strategy",
      useCount: 15
    },
    {
      id: "4",
      name: "컴플라이언스 체크",
      description: "콘텐츠가 금융 규정에 위배되는지 자동으로 검토합니다",
      agentId: "GUARDIAN",
      template: "컴플라이언스 검토 결과\n\n검토 대상: ${content_type}\n위험 수준: ${risk_level}\n\n발견된 문제:\n${issues}\n\n수정 제안:\n${suggestions}\n\n승인 여부: ${approval_status}",
      variables: ["content_type", "risk_level", "issues", "suggestions", "approval_status"],
      category: "compliance",
      useCount: 31
    }
  ]);

  const categories = [
    { id: "all", name: "전체", icon: Sparkles },
    { id: "content", name: "콘텐츠", icon: FileText },
    { id: "analytics", name: "분석", icon: BarChart3 },
    { id: "strategy", name: "전략", icon: Target },
    { id: "compliance", name: "컴플라이언스", icon: Shield }
  ];

  const filteredPresets = presets.filter(preset => {
    const matchesSearch = preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         preset.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || preset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUsePreset = (preset: AIPreset) => {
    toast({
      title: "프리셋 적용됨",
      description: `${preset.name} 프리셋이 채팅창에 적용되었습니다.`,
    });
  };

  const handleCopyPreset = (preset: AIPreset) => {
    navigator.clipboard.writeText(preset.template);
    toast({
      title: "복사됨",
      description: "프리셋 템플릿이 클립보드에 복사되었습니다.",
    });
  };

  const handleCreatePreset = () => {
    toast({
      title: "새 프리셋",
      description: "새 프리셋 생성 기능을 준비 중입니다.",
    });
  };

  const getAgentName = (agentId: string) => {
    return aiAgents.find(agent => agent.id === agentId)?.name || agentId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI 프리셋</h2>
          <p className="text-muted-foreground">자주 사용하는 AI 작업을 템플릿으로 저장하고 재사용하세요</p>
        </div>
        
        <Button onClick={handleCreatePreset} className="bg-gradient-primary hover:shadow-glow">
          <Plus className="w-4 h-4 mr-2" />
          새 프리셋
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="프리셋 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex space-x-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center space-x-2"
            >
              <category.icon className="w-4 h-4" />
              <span>{category.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPresets.map(preset => (
          <Card key={preset.id} className="bg-gradient-card border-border/50 glass hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{preset.name}</CardTitle>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {getAgentName(preset.agentId)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {preset.useCount}회 사용
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleCopyPreset(preset)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {preset.description}
              </p>
              
              {/* Template Preview */}
              <div className="bg-muted/30 rounded border p-3 mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">템플릿 미리보기:</p>
                <ScrollArea className="h-20">
                  <p className="text-xs font-mono whitespace-pre-wrap">
                    {preset.template.length > 150 
                      ? preset.template.substring(0, 150) + "..." 
                      : preset.template}
                  </p>
                </ScrollArea>
              </div>
              
              {/* Variables */}
              {preset.variables.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">변수:</p>
                  <div className="flex flex-wrap gap-1">
                    {preset.variables.slice(0, 3).map((variable) => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        ${variable}
                      </Badge>
                    ))}
                    {preset.variables.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{preset.variables.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              <Button 
                onClick={() => handleUsePreset(preset)}
                className="w-full bg-gradient-primary hover:shadow-glow"
                size="sm"
              >
                <Zap className="w-3 h-3 mr-2" />
                프리셋 사용
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPresets.length === 0 && (
        <Card className="bg-gradient-card border-border/50 glass">
          <CardContent className="py-12">
            <div className="text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">프리셋이 없습니다</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== "all" 
                  ? "검색 조건에 맞는 프리셋이 없습니다." 
                  : "첫 번째 프리셋을 만들어보세요."}
              </p>
              <Button onClick={handleCreatePreset} className="bg-gradient-primary hover:shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                새 프리셋 만들기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};