import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
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
              <header className="h-12 flex items-center border-b bg-card/50 backdrop-blur-lg">
                <SidebarTrigger className="ml-4" />
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
