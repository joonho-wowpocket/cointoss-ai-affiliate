export interface AIAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  capabilities: string[];
  tasks: string[];
  status: 'active' | 'inactive';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string | object;
  type: 'text' | 'chart' | 'card' | 'alert' | 'image';
  timestamp: Date;
  agentId: string;
  threadId?: string;
}

export interface AITask {
  id: string;
  agentId: string;
  name: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  input: any;
  output?: any;
  createdAt: Date;
  completedAt?: Date;
}

export interface AIPipeline {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  steps: AITask[];
  createdAt: Date;
}

export const aiAgents: AIAgent[] = [
  {
    id: "CREA",
    name: "크레아 (Crea)",
    role: "콘텐츠 매니저",
    description: "마케팅 콘텐츠 자동 생성 및 발행 자동화",
    avatar: "/avatars/crea-hero.png",
    status: "active",
    tasks: ["generate_social_post", "schedule_post", "transform_signal_to_content"],
    capabilities: ["SNS 포스트", "카드뉴스", "비디오 스크립트", "텔레그램/유튜브 콘텐츠"]
  },
  {
    id: "DANNY",
    name: "대니 (Danny)",
    role: "데이터 분석가",
    description: "고객 세그멘테이션 및 활동 분석",
    avatar: "/avatars/danny-hero.png",
    status: "active",
    tasks: ["find_dormant", "segment_customers", "suggest_reactivation"],
    capabilities: ["VIP 고객 식별", "휴면 고객 감지", "재활성화 캠페인", "보존 인사이트"]
  },
  {
    id: "RAY",
    name: "레이 (Ray)",
    role: "경영 어시스턴트",
    description: "개인 비서 및 AI 팀 오케스트레이터",
    avatar: "/avatars/ray-hero.png",
    status: "active",
    tasks: ["create_pipeline", "summarize_daily", "dispatch_tasks"],
    capabilities: ["일정 관리", "마감일 리마인드", "워크플로우 트리거", "AI 결과 요약"]
  },
  {
    id: "LEO",
    name: "레오 (Leo)",
    role: "전략 어드바이저",
    description: "시장 및 리스크 전략가",
    avatar: "/avatars/leo-hero.png",
    status: "active",
    tasks: ["market_pulse", "risk_brief", "exchange_priority"],
    capabilities: ["시장 펄스 리포트", "기회/리스크 알림", "거래소 우선순위", "전략 인사이트"]
  },
  {
    id: "ALPHA",
    name: "알파 (Alpha)",
    role: "기회 탐색가",
    description: "성장 기회 발굴 및 모니터링",
    avatar: "/avatars/alpha-hero.png",
    status: "active",
    tasks: ["scan_opportunities", "rank_airdrops", "event_alert"],
    capabilities: ["신규 코인 모니터링", "에어드랍 기회", "이벤트 알림", "ROI 우선순위"]
  },
  {
    id: "GUARDIAN",
    name: "가디언 (Guardian)",
    role: "컴플라이언스 오피서",
    description: "리스크 및 규정 준수 게이트키퍼",
    avatar: "/avatars/guardian-hero.png",
    status: "active",
    tasks: ["review_content", "score_compliance", "fix_risky_phrases"],
    capabilities: ["콘텐츠 검토", "규정 준수 검증", "리스크 스코어링", "법적 검토"]
  }
];