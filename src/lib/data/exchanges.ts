import { ExchangeLogoKey } from "@/components/icons/ExchangeLogos";

export interface Exchange {
  name: string;
  logoKey: ExchangeLogoKey;
  brandColor: string;
}

export const exchanges: Exchange[] = [
  { 
    name: "Binance", 
    logoKey: "binance",
    brandColor: "#F3BA2F"
  },
  { 
    name: "OKX", 
    logoKey: "okx",
    brandColor: "#000000"
  },
  { 
    name: "Bybit", 
    logoKey: "bybit",
    brandColor: "#F7931A"
  },
  { 
    name: "Gate.io", 
    logoKey: "gate",
    brandColor: "#3F4BFF"
  },
  { 
    name: "MEXC", 
    logoKey: "mexc",
    brandColor: "#00D4FF"
  },
  { 
    name: "KuCoin", 
    logoKey: "kucoin",
    brandColor: "#24D366"
  }
];