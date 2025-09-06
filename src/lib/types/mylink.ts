export type Lang = 'ko' | 'en' | 'ja' | 'id' | 'vi';
export type LinkMode = 'basic' | 'approved';

export interface MyLinkPage {
  id: string;
  partnerId: string;
  slug: string;              // cointoss.page/{slug}
  title: string;
  bio: string;
  avatarUrl?: string;
  theme: { 
    mode: 'light' | 'dark'; 
    primary: string; 
    accent?: string; 
  };
  locale: Lang;
  sections: Section[];
  published: boolean;
  publishedAt?: string;
  seo?: { 
    title?: string; 
    description?: string; 
    ogImageUrl?: string; 
  };
  createdAt: string;
  updatedAt: string;
}

export type Section =
  | { type: 'hero'; show: boolean; badges?: string[] }
  | {
      type: 'exchanges'; 
      show: boolean;
      items: Array<{
        exchangeId: string;
        chosenMode: LinkMode;          // 'basic' or 'approved'
        buttonLabel?: string;          // e.g., "Start on Bybit"
      }>;
    }
  | {
      type: 'products'; 
      show: boolean;
      items: Array<{
        productId: string;             // from Marketplace catalog
        highlight?: string;            // short benefit line
        ctaLabel?: string;             // "Buy Now", "Request Access"
      }>;
    }
  | {
      type: 'lead'; 
      show: boolean;
      capture: { 
        kind: 'email' | 'telegram' | 'none'; 
        title?: string; 
        note?: string; 
      };
      magnetId?: string;               // optional: lead magnet link/connect
    }
  | {
      type: 'social'; 
      show: boolean;
      links: Array<{ 
        kind: 'telegram' | 'youtube' | 'x' | 'discord' | 'email' | 'site'; 
        url: string; 
      }>;
    }
  | { 
      type: 'wallet'; 
      show: boolean; 
      showCtossBalance?: boolean; 
    };

export interface MyLinkTemplate {
  id: string;
  name: string;
  description: string;
  theme: MyLinkPage['theme'];
  sections: Section[];
}

export interface MyLinkAnalytics {
  views: number;
  exchangeClicks: Record<string, number>;
  productClicks: Record<string, number>;
  leadSubmissions: number;
  socialClicks: Record<string, number>;
  walletConnections: number;
}