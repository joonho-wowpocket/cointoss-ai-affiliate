import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface CampaignModalProps {
  exchangeId: string;
  exchangeName: string;
  preset: "campaign:new" | "campaign:reactivate";
  children: React.ReactNode;
}

export function CampaignModal({ exchangeId, exchangeName, preset, children }: CampaignModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [channels, setChannels] = useState<string[]>(["telegram"]);
  const [tone, setTone] = useState("pro-friendly");
  const [goals, setGoals] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChannelChange = (channel: string, checked: boolean) => {
    if (checked) {
      setChannels(prev => [...prev, channel]);
    } else {
      setChannels(prev => prev.filter(c => c !== channel));
    }
  };

  const createCampaign = async () => {
    if (!campaignName.trim()) {
      toast({
        title: "입력 오류",
        description: "캠페인 이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (channels.length === 0) {
      toast({
        title: "입력 오류", 
        description: "최소 하나의 채널을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-pipelines', {
        body: {
          name: `${campaignName} (${exchangeName})`,
          context: {
            preset,
            exchangeId,
            exchangeName,
            campaignName,
            channels,
            tone,
            goals: goals || "신규 고객 유치",
            locale: "ko-KR",
            constraints: {
              noInvestmentAdvice: true,
              complianceCheck: true
            }
          },
          steps: preset === "campaign:new" ? [
            { agent: "DANNY", name: "build_target_segment", input: { exchangeId, targetType: "new" } },
            { agent: "LEO", name: "summarize_exchange_usp", input: { exchangeId } },
            { agent: "CREA", name: "generate_multichannel_assets", input: { channels, tone, goals } },
            { agent: "GUARDIAN", name: "review_content", input: {} },
            { agent: "RAY", name: "schedule_proposal", input: { channels } }
          ] : [
            { agent: "DANNY", name: "find_dormant_users", input: { exchangeId, days: 21 } },
            { agent: "CREA", name: "generate_reactivation_copy", input: { tone, channels } },
            { agent: "GUARDIAN", name: "review_content", input: {} },
            { agent: "RAY", name: "schedule_proposal", input: { channels } }
          ]
        }
      });

      if (error) throw error;

      toast({
        title: "파이프라인 생성 완료",
        description: `AI 팀이 ${campaignName} 캠페인 작업을 시작했습니다.`,
      });

      // AI Assistants 페이지로 이동
      navigate("/ai-assistants");
      setOpen(false);
      
      // 입력값 리셋
      setCampaignName("");
      setChannels(["telegram"]);
      setTone("pro-friendly");
      setGoals("");
      
    } catch (error: any) {
      console.error("캠페인 생성 오류:", error);
      toast({
        title: "생성 실패",
        description: error.message || "캠페인 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const presetLabels = {
    "campaign:new": "신규 고객 캠페인",
    "campaign:reactivate": "휴면 고객 리액티베이션"
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {presetLabels[preset]} ({exchangeName})
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaignName">캠페인 이름</Label>
            <Input
              id="campaignName"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="예) 09월 신규 캠페인"
            />
          </div>

          <div className="space-y-2">
            <Label>채널 선택</Label>
            <div className="flex gap-4">
              {["telegram", "youtube", "twitter"].map(channel => (
                <label key={channel} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={channels.includes(channel)}
                    onCheckedChange={(checked) => handleChannelChange(channel, !!checked)}
                  />
                  <span className="text-sm capitalize">{channel}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">톤 & 스타일</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pro-friendly">Professional & Friendly</SelectItem>
                <SelectItem value="brief">Brief & Direct</SelectItem>
                <SelectItem value="energetic">Energetic & Engaging</SelectItem>
                <SelectItem value="educational">Educational & Informative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">캠페인 목표 (선택)</Label>
            <Textarea
              id="goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="예) 신규 회원가입 50명, 거래량 증가 등"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              취소
            </Button>
            <Button onClick={createCampaign} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI 팀 작업 시작 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI로 만들기
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}