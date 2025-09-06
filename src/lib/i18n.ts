interface Messages {
  [key: string]: string | Messages;
}

interface Translations {
  [locale: string]: Messages;
}

const translations: Translations = {
  ko: {
    nav: {
      dashboard: "거래소 관리",
      partnerHub: "파트너 허브",
      exchanges: "거래소",
      links: "링크",
      uidRegistry: "UID 등록",
      approvals: "승인현황",
      customers: "고객",
      aiTeam: "AI 파트너팀",
      aiAssistants: "AI 어시스턴트",
      taskCenter: "작업 센터",
      pipelines: "파이프라인",
      presets: "프리셋",
      myLink: "마이링크",
      marketplace: "마켓플레이스",
      earnings: "수익",
      subtitle: "AI 파트너 허브",
      openMenu: "메뉴 열기",
      closeSidebar: "사이드바 닫기",
      expandSidebar: "사이드바 펼치기",
      collapseSidebar: "사이드바 접기"
    },
    common: {
      toggleTheme: "테마 전환",
      light: "라이트",
      dark: "다크",
      system: "시스템"
    }
  },
  ja: {
    nav: {
      dashboard: "ダッシュボード",
      partnerHub: "パートナーハブ",
      exchanges: "取引所",
      links: "リンク",
      uidRegistry: "UID登録",
      approvals: "承認状況",
      customers: "顧客",
      aiTeam: "AIパートナーチーム",
      aiAssistants: "AIアシスタント",
      taskCenter: "タスクセンター",
      pipelines: "パイプライン",
      presets: "プリセット",
      myLink: "マイリンク",
      marketplace: "マーケットプレイス",
      earnings: "収益",
      subtitle: "AIパートナーハブ",
      openMenu: "メニューを開く",
      closeSidebar: "サイドバーを閉じる",
      expandSidebar: "サイドバーを展開",
      collapseSidebar: "サイドバーを折りたたむ"
    },
    common: {
      toggleTheme: "テーマ切替",
      light: "ライト",
      dark: "ダーク",
      system: "システム"
    }
  },
  id: {
    nav: {
      dashboard: "Dasbor",
      partnerHub: "Hub Mitra",
      exchanges: "Bursa",
      links: "Tautan",
      uidRegistry: "Registrasi UID",
      approvals: "Persetujuan",
      customers: "Pelanggan",
      aiTeam: "Tim Mitra AI",
      aiAssistants: "Asisten AI",
      taskCenter: "Pusat Tugas",
      pipelines: "Pipeline",
      presets: "Preset",
      myLink: "Tautan Saya",
      marketplace: "Pasar",
      earnings: "Pendapatan",
      subtitle: "Hub Mitra AI",
      openMenu: "Buka Menu",
      closeSidebar: "Tutup Sidebar",
      expandSidebar: "Perluas Sidebar",
      collapseSidebar: "Lipat Sidebar"
    },
    common: {
      toggleTheme: "Ganti Tema",
      light: "Terang",
      dark: "Gelap",
      system: "Sistem"
    }
  },
  vi: {
    nav: {
      dashboard: "Bảng điều khiển",
      partnerHub: "Trung tâm đối tác",
      exchanges: "Sàn giao dịch",
      links: "Liên kết",
      uidRegistry: "Đăng ký UID",
      approvals: "Phê duyệt",
      customers: "Khách hàng",
      aiTeam: "Đội ngũ AI",
      aiAssistants: "Trợ lý AI",
      taskCenter: "Trung tâm tác vụ",
      pipelines: "Quy trình",
      presets: "Thiết lập sẵn",
      myLink: "Liên kết của tôi",
      marketplace: "Thị trường",
      earnings: "Thu nhập",
      subtitle: "Trung tâm đối tác AI",
      openMenu: "Mở menu",
      closeSidebar: "Đóng thanh bên",
      expandSidebar: "Mở rộng thanh bên",
      collapseSidebar: "Thu gọn thanh bên"
    },
    common: {
      toggleTheme: "Chuyển đổi chủ đề",
      light: "Sáng",
      dark: "Tối",
      system: "Hệ thống"
    }
  },
  en: {
    nav: {
      dashboard: "Exchange Management",
      partnerHub: "Partner Hub",
      exchanges: "Exchanges",
      links: "Links",
      uidRegistry: "UID Registry",
      approvals: "Approvals",
      customers: "Customers",
      aiTeam: "AI Partner Team",
      aiAssistants: "AI Assistants",
      taskCenter: "Task Center",
      pipelines: "Pipelines",
      presets: "Presets",
      myLink: "MyLink",
      marketplace: "Marketplace",
      earnings: "Earnings",
      subtitle: "AI Partner Hub",
      openMenu: "Open menu",
      closeSidebar: "Close sidebar",
      expandSidebar: "Expand sidebar",
      collapseSidebar: "Collapse sidebar"
    },
    common: {
      toggleTheme: "Toggle theme",
      light: "Light",
      dark: "Dark",
      system: "System"
    }
  }
};

export const SUPPORTED_LOCALES = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
] as const;

export type Locale = typeof SUPPORTED_LOCALES[number]['code'];

export function getNestedValue(obj: Messages, path: string): string {
  return path.split('.').reduce((current, key) => {
    return typeof current === 'object' && current !== null ? current[key] : current;
  }, obj) as string;
}

export function getTranslation(locale: Locale, namespace: string, key: string): string {
  const messages = translations[locale];
  if (!messages) return key;
  
  const namespaceMessages = messages[namespace] as Messages;
  if (!namespaceMessages) return key;
  
  return getNestedValue(namespaceMessages, key) || key;
}

export function getCurrentLocale(): Locale {
  const stored = localStorage.getItem('app-locale');
  if (stored && SUPPORTED_LOCALES.some(l => l.code === stored)) {
    return stored as Locale;
  }
  return 'ko'; // Default locale
}

export function setCurrentLocale(locale: Locale): void {
  localStorage.setItem('app-locale', locale);
}