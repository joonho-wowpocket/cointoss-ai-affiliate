import { useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Workflow, Zap, Sparkles } from "lucide-react";
import { ChatInterface } from "./ChatInterface";
import { TaskCenter } from "./TaskCenter";
import { Pipelines } from "./Pipelines";
import { Presets } from "./Presets";

export const AITeamLayout = () => {
  const location = useLocation();
  
  // Determine active tab based on route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/tasks')) return 'tasks';
    if (path.includes('/pipelines')) return 'pipelines';
    if (path.includes('/presets')) return 'presets';
    return 'chat';
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My AI Team</h1>
          <p className="text-muted-foreground">6인의 전문 AI 팀과 협업하여 업무를 자동화하세요</p>
        </div>
      </div>

      <Card className="bg-gradient-card border-border/50 glass">
        <Tabs value={getActiveTab()} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              onClick={() => window.history.pushState({}, '', '/ai-assistants')}
            >
              <Bot className="w-4 h-4 mr-2" />
              AI 채팅
            </TabsTrigger>
            <TabsTrigger 
              value="tasks" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              onClick={() => window.history.pushState({}, '', '/ai-assistants/tasks')}
            >
              <Workflow className="w-4 h-4 mr-2" />
              작업 센터
            </TabsTrigger>
            <TabsTrigger 
              value="pipelines" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              onClick={() => window.history.pushState({}, '', '/ai-assistants/pipelines')}
            >
              <Zap className="w-4 h-4 mr-2" />
              파이프라인
            </TabsTrigger>
            <TabsTrigger 
              value="presets" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              onClick={() => window.history.pushState({}, '', '/ai-assistants/presets')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              프리셋
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-6">
            <ChatInterface />
          </TabsContent>
          <TabsContent value="tasks" className="mt-6">
            <TaskCenter />
          </TabsContent>
          <TabsContent value="pipelines" className="mt-6">
            <Pipelines />
          </TabsContent>
          <TabsContent value="presets" className="mt-6">
            <Presets />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};