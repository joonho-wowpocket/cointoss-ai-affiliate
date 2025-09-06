import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Download, ExternalLink } from "lucide-react";
import { type ChatMessage, type AIAgent } from "@/lib/types/ai-team";
import { useToast } from "@/hooks/use-toast";

interface MessageComponentProps {
  message: ChatMessage;
  agent: AIAgent;
}

export const MessageComponent = ({ message, agent }: MessageComponentProps) => {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content as string);
    toast({
      title: "복사됨",
      description: "메시지가 클립보드에 복사되었습니다.",
    });
  };

  const handleExport = () => {
    toast({
      title: "내보내기",
      description: "MyLink/Marketplace로 내보내기 기능을 준비 중입니다.",
    });
  };

  if (message.sender === 'user') {
    return (
      <div className="flex justify-end">
        <div className="flex items-end space-x-2 max-w-[80%]">
          <div className="bg-primary text-primary-foreground rounded-lg p-3">
            <p className="text-sm whitespace-pre-wrap">{message.content as string}</p>
            <p className="text-xs opacity-70 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs">나</AvatarFallback>
          </Avatar>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-3">
      <Avatar className="w-8 h-8">
        <AvatarImage src={agent.avatar} alt={agent.name} />
        <AvatarFallback className="text-xs">{agent.name.charAt(0)}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 max-w-[80%]">
        <Card className="bg-muted/50 border-border/30 p-3">
          {message.type === 'text' && (
            <div className="space-y-2">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content as string}
              </p>
              
              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <span className="text-xs text-muted-foreground">
                  {message.timestamp.toLocaleTimeString()}
                </span>
                
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-6 px-2 text-xs"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExport}
                    className="h-6 px-2 text-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {message.type === 'chart' && (
            <div className="space-y-2">
              <div className="bg-gradient-card p-4 rounded border border-border/30">
                <p className="text-sm text-center text-muted-foreground">
                  📊 차트 데이터가 여기에 표시됩니다
                </p>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-3 h-3 mr-1" />
                  다운로드
                </Button>
              </div>
            </div>
          )}
          
          {message.type === 'card' && (
            <div className="space-y-2">
              <Card className="bg-gradient-card border-border/30 p-3">
                <p className="text-sm">🎨 생성된 콘텐츠 카드</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {message.content as string}
                </p>
              </Card>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <ExternalLink className="w-3 h-3 mr-1" />
                  MyLink에 추가
                </Button>
              </div>
            </div>
          )}
          
          {message.type === 'alert' && (
            <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
              <div className="flex items-start space-x-2">
                <div className="text-destructive">⚠️</div>
                <div>
                  <p className="text-sm font-medium text-destructive">주의사항</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {message.content as string}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};