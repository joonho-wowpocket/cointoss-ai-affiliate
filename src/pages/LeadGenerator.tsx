import { LeadMagnetGenerator } from "@/components/LeadMagnetGenerator";

const LeadGenerator = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lead Generator</h1>
          <p className="text-muted-foreground">AI 기반 리드마그넷 생성으로 고객 정보를 수집하세요</p>
        </div>
      </div>
      
      <LeadMagnetGenerator />
    </div>
  );
};

export default LeadGenerator;