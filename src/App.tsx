import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HeaderNav } from "@/components/nav/HeaderNav";
import { AppFooter } from "@/components/layout/AppFooter";
import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/contexts/I18nContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import LeadGenerator from "./pages/LeadGenerator";
import PartnerHub from "./pages/PartnerHub";
import Dashboard from "./pages/Dashboard";
import Earnings from "./pages/Earnings";
import AIAssistants from "./pages/AIAssistants";
import MyLink from "./pages/MyLink";
import Marketplace from "./pages/Marketplace";
import TranslationManagerPage from "./pages/TranslationManager";
import SignUp from "./pages/auth/SignUp";
import Login from "./pages/auth/Login";
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
        <AuthProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex min-h-screen flex-col">
              <HeaderNav />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/lead-generator" element={<LeadGenerator />} />
                  <Route path="/partner-hub" element={<PartnerHub />} />
                  <Route path="/partner-hub/*" element={<PartnerHub />} />
                  <Route path="/ai-assistants" element={<AIAssistants />} />
                  <Route path="/mylink" element={<MyLink />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/earnings" element={<Earnings />} />
                  <Route path="/translation-manager" element={<TranslationManagerPage />} />
                  <Route path="/auth/signup" element={<SignUp />} />
                  <Route path="/auth/login" element={<Login />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <AppFooter />
            </div>
          </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
