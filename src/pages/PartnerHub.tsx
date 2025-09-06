import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Exchanges } from "@/components/partner-hub/Exchanges";
import { UIDRegistry } from "@/components/partner-hub/UIDRegistry";
import { Approvals } from "@/components/partner-hub/Approvals";
import { Customers } from "@/components/partner-hub/Customers";

const PartnerHub = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loading } = useAuth();
  const activeTab = searchParams.get('tab') || 'exchanges';

  // Auth guard - redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth/signup?next=' + encodeURIComponent('/partner-hub'));
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const handleTabChange = (value: string) => {
    // Performance optimization: avoid unnecessary re-renders
    if (value === activeTab) return;
    
    navigate(`/partner-hub?tab=${value}`, { replace: true });
    
    // Track tab change event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'tab_change', {
        event_category: 'partner_hub',
        event_label: value,
        value: 1
      });
    }
    
    // Custom event for other analytics systems
    window.dispatchEvent(new CustomEvent('partnerHub.tab_change', { 
      detail: { tab_name: value } 
    }));
  };

  // Track page view
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        event_category: 'partner_hub',
        event_label: activeTab,
        value: 1
      });
    }
    
    // Custom event for other analytics systems
    window.dispatchEvent(new CustomEvent('partnerHub.page_view', { 
      detail: { tab_name: activeTab } 
    }));
  }, [activeTab]);

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Partner Hub</h1>
              <p className="text-muted-foreground mt-2">거래소 연동 관리 및 수익 최적화</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="sticky top-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-30 shadow-sm">
          <div className="container mx-auto px-6">
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList 
                className="h-12 w-full min-w-max justify-start bg-transparent p-0 gap-6 sm:gap-8"
                onKeyDown={(e) => {
                  const tabs = ['exchanges', 'uid', 'approvals', 'customers'];
                  const currentIndex = tabs.indexOf(activeTab);
                  
                  if (e.key === 'ArrowLeft' && currentIndex > 0) {
                    e.preventDefault();
                    handleTabChange(tabs[currentIndex - 1]);
                  } else if (e.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
                    e.preventDefault();
                    handleTabChange(tabs[currentIndex + 1]);
                  }
                }}
              >
                <TabsTrigger 
                  value="exchanges"
                  className="relative h-12 px-4 sm:px-0 py-0 bg-transparent border-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none font-medium text-muted-foreground data-[state=active]:text-foreground hover:text-foreground transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 after:scale-x-0 data-[state=active]:after:scale-x-100 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  거래소 관리
                </TabsTrigger>
                <TabsTrigger 
                  value="uid"
                  className="relative h-12 px-4 sm:px-0 py-0 bg-transparent border-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none font-medium text-muted-foreground data-[state=active]:text-foreground hover:text-foreground transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 after:scale-x-0 data-[state=active]:after:scale-x-100 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  UID 등록
                </TabsTrigger>
                <TabsTrigger 
                  value="approvals"
                  className="relative h-12 px-4 sm:px-0 py-0 bg-transparent border-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none font-medium text-muted-foreground data-[state=active]:text-foreground hover:text-foreground transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 after:scale-x-0 data-[state=active]:after:scale-x-100 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  승인 현황
                </TabsTrigger>
                <TabsTrigger 
                  value="customers"
                  className="relative h-12 px-4 sm:px-0 py-0 bg-transparent border-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none font-medium text-muted-foreground data-[state=active]:text-foreground hover:text-foreground transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 after:scale-x-0 data-[state=active]:after:scale-x-100 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  내 파트너/고객
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="container mx-auto px-6 py-8">
          <TabsContent value="exchanges" className="mt-0 space-y-6 focus:outline-none" tabIndex={-1}>
            <Exchanges />
          </TabsContent>
          
          <TabsContent value="uid" className="mt-0 space-y-6 focus:outline-none" tabIndex={-1}>
            <UIDRegistry />
          </TabsContent>
          
          <TabsContent value="approvals" className="mt-0 space-y-6 focus:outline-none" tabIndex={-1}>
            <Approvals />
          </TabsContent>
          
          <TabsContent value="customers" className="mt-0 space-y-6 focus:outline-none" tabIndex={-1}>
            <Customers />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default PartnerHub;