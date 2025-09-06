import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HeaderNav } from "@/components/nav/HeaderNav";
import { AppFooter } from "@/components/layout/AppFooter";
import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/contexts/I18nContext";
import Index from "./pages/Index";
import LeadGenerator from "./pages/LeadGenerator";
import PartnerHub from "./pages/PartnerHub";
import Earnings from "./pages/Earnings";
import AIAssistants from "./pages/AIAssistants";
import TranslationManagerPage from "./pages/TranslationManager";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex min-h-screen flex-col">
              <HeaderNav />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/lead-generator" element={<LeadGenerator />} />
                  <Route path="/partner-hub" element={<PartnerHub />} />
                  <Route path="/ai-assistants" element={<AIAssistants />} />
                  <Route path="/earnings" element={<Earnings />} />
                  <Route path="/translation-manager" element={<TranslationManagerPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <AppFooter />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </I18nProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
