import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { type AIAgent } from "@/lib/types/ai-team";

interface AIAgentListProps {
  agents: AIAgent[];
  selectedAgent: AIAgent;
  onSelectAgent: (agent: AIAgent) => void;
}

export const AIAgentList = ({ agents, selectedAgent, onSelectAgent }: AIAgentListProps) => {
  return (
    <Card className="bg-gradient-card border-border/50 glass h-full">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">
          AI 팀 멤버
        </h3>
        <div className="space-y-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
                selectedAgent.id === agent.id 
                  ? 'bg-primary/10 border border-primary/20 shadow-sm' 
                  : 'hover:shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={agent.avatar} alt={agent.name} />
                  <AvatarFallback className="text-xs">{agent.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm truncate">{agent.name}</h4>
                    <Badge 
                      variant="outline" 
                      className="ml-2 border-accent text-accent text-xs"
                    >
                      온라인
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {agent.role}
                  </p>
                </div>
              </div>
              
              {selectedAgent.id === agent.id && (
                <div className="mt-3 pt-3 border-t border-border/30">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {agent.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {agent.capabilities.slice(0, 2).map((capability, index) => (
                      <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                        {capability}
                      </Badge>
                    ))}
                    {agent.capabilities.length > 2 && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        +{agent.capabilities.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};