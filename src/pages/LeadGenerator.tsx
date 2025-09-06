import { LeadMagnetGenerator } from "@/components/LeadMagnetGenerator";

const LeadGenerator = () => {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">리드 생성기</h1>
            <p className="text-muted-foreground">AI로 전문적인 리드 마그넷을 생성하여 잠재 고객의 연락처를 수집하세요</p>
          </div>
        </div>
        
        <LeadMagnetGenerator />
      </div>
    </div>
  );
};

export default LeadGenerator;