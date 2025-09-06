import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthGate } from "@/lib/auth/withAuthGate";
import { Exchanges } from "@/components/partner-hub/Exchanges";
import { UIDRegistry } from "@/components/partner-hub/UIDRegistry";
import { Approvals } from "@/components/partner-hub/Approvals";
import { Customers } from "@/components/partner-hub/Customers";

const PartnerHub = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { guardLink } = useAuthGate();
  const activeTab = searchParams.get('tab') || 'exchanges';

  // Auth guard - redirect if not authenticated
  useEffect(() => {
    if (!guardLink('/partner-hub')) {
      navigate('/auth/signup?next=' + encodeURIComponent('/partner-hub'));
    }
  }, [navigate, guardLink]);

  const handleTabChange = (value: string) => {
    navigate(`/partner-hub?tab=${value}`, { replace: true });
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Partner Hub</h1>
            <p className="text-muted-foreground">거래소 연동 관리 및 수익 최적화</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="sticky top-14 bg-background border-b z-30 w-full justify-start rounded-none h-12 p-0">
            <TabsTrigger 
              value="exchanges" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              거래소 관리
            </TabsTrigger>
            <TabsTrigger 
              value="uid" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              UID 등록
            </TabsTrigger>
            <TabsTrigger 
              value="approvals" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              승인 현황
            </TabsTrigger>
            <TabsTrigger 
              value="customers" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              내 파트너/고객
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exchanges" className="mt-6">
            <Exchanges />
          </TabsContent>
          
          <TabsContent value="uid" className="mt-6">
            <UIDRegistry />
          </TabsContent>
          
          <TabsContent value="approvals" className="mt-6">
            <Approvals />
          </TabsContent>
          
          <TabsContent value="customers" className="mt-6">
            <Customers />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PartnerHub;