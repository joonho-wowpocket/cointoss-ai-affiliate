import { LeadMagnetGenerator } from "@/components/LeadMagnetGenerator";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Coins, FileText } from "lucide-react";

const LeadGenerator = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center glow-primary">
                <Coins className="w-6 h-6 text-primary-foreground font-bold" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                CoinToss
              </h1>
              <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                MVP
              </Badge>
            </div>
            <Tabs value="leadgen" className="w-auto">
              <TabsList className="bg-muted/50">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  onClick={() => navigate("/")}
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="dashboard" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  onClick={() => navigate("/")}
                >
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="partnerhub" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  onClick={() => navigate("/partner-hub")}
                >
                  Partner Hub
                </TabsTrigger>
                <TabsTrigger 
                  value="leadgen" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  onClick={() => navigate("/lead-generator")}
                >
                  Lead Generator
                </TabsTrigger>
                <TabsTrigger 
                  value="ai" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  onClick={() => navigate("/")}
                >
                  AI Assistant
                </TabsTrigger>
                <TabsTrigger 
                  value="tokens" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  onClick={() => navigate("/")}
                >
                  Tokens
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Lead Generator</h1>
              <p className="text-muted-foreground">AI 기반 리드마그넷 생성으로 고객 정보를 수집하세요</p>
            </div>
          </div>
          
          <LeadMagnetGenerator />
        </div>
      </div>
    </div>
  );
};

export default LeadGenerator;