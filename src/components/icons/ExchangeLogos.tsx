interface ExchangeLogoProps {
  className?: string;
  size?: number;
}

export const BinanceLogo = ({ className = "", size = 32 }: ExchangeLogoProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    className={className}
    fill="none"
  >
    <rect width="32" height="32" rx="8" fill="#F3BA2F"/>
    <path 
      d="M16 6L20 10L16 14L12 10L16 6ZM6 16L10 12L14 16L10 20L6 16ZM22 16L26 12L30 16L26 20L22 16ZM16 22L20 18L24 22L20 26L16 22ZM16 18L20 14L24 18L20 22L16 18Z" 
      fill="white"
    />
  </svg>
);

export const OKXLogo = ({ className = "", size = 32 }: ExchangeLogoProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    className={className}
    fill="none"
  >
    <rect width="32" height="32" rx="8" fill="#000000"/>
    <path 
      d="M8 8H14V14H8V8ZM18 8H24V14H18V8ZM8 18H14V24H8V18ZM18 18H24V24H18V18Z" 
      fill="white"
    />
  </svg>
);

export const BybitLogo = ({ className = "", size = 32 }: ExchangeLogoProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    className={className}
    fill="none"
  >
    <rect width="32" height="32" rx="8" fill="#F7931A"/>
    <path 
      d="M16 6C10.5 6 6 10.5 6 16C6 21.5 10.5 26 16 26C21.5 26 26 21.5 26 16C26 10.5 21.5 6 16 6ZM20 14H18V12H14V20H18V18H20V16H18V14H20Z" 
      fill="white"
    />
  </svg>
);

export const GateLogo = ({ className = "", size = 32 }: ExchangeLogoProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    className={className}
    fill="none"
  >
    <rect width="32" height="32" rx="8" fill="#3F4BFF"/>
    <path 
      d="M16 6L24 12V20L16 26L8 20V12L16 6Z" 
      fill="white"
    />
    <path 
      d="M16 10L20 13V19L16 22L12 19V13L16 10Z" 
      fill="#3F4BFF"
    />
  </svg>
);

export const MEXCLogo = ({ className = "", size = 32 }: ExchangeLogoProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    className={className}
    fill="none"
  >
    <rect width="32" height="32" rx="8" fill="#00D4FF"/>
    <path 
      d="M8 24L16 8L24 24H20L16 16L12 24H8Z" 
      fill="white"
    />
  </svg>
);

export const KuCoinLogo = ({ className = "", size = 32 }: ExchangeLogoProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    className={className}
    fill="none"
  >
    <rect width="32" height="32" rx="8" fill="#24D366"/>
    <path 
      d="M16 6L10 12V20L16 26L22 20V12L16 6ZM16 10L18 12V20L16 22L14 20V12L16 10Z" 
      fill="white"
    />
  </svg>
);

// Export map for easy access
export const ExchangeLogos = {
  binance: BinanceLogo,
  okx: OKXLogo,
  bybit: BybitLogo,
  gate: GateLogo,
  mexc: MEXCLogo,
  kucoin: KuCoinLogo,
} as const;

export type ExchangeLogoKey = keyof typeof ExchangeLogos;