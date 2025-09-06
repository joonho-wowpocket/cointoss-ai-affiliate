import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";
import Index from "./pages/Index";
import LeadGenerator from "./pages/LeadGenerator";
import PartnerHub from "./pages/PartnerHub";
import Earnings from "./pages/Earnings";
import AIAssistants from "./pages/AIAssistants";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <main className="flex-1">
              <header className="h-14 flex items-center justify-between border-b bg-card/50 backdrop-blur-lg px-4">
                <div className="flex items-center space-x-3">
                  <SidebarTrigger />
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <Coins className="w-5 h-5 text-primary-foreground font-bold" />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      CoinToss
                    </h1>
                    <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                      MVP
                    </Badge>
                  </div>
                </div>
                <UserProfileDropdown />
              </header>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/lead-generator" element={<LeadGenerator />} />
                <Route path="/partner-hub" element={<PartnerHub />} />
                <Route path="/ai-assistants" element={<AIAssistants />} />
                <Route path="/earnings" element={<Earnings />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
