export type ProductCategory = 'signals' | 'research' | 'bot' | 'education';
export type ProductStatus = 'draft' | 'review' | 'published' | 'paused' | 'retired';
export type DeliveryCycle = 'realtime' | 'daily' | 'weekly' | 'monthly';
export type SubscriptionStatus = 'pending' | 'active' | 'expired' | 'canceled';
export type PostVisibility = 'subscribers' | 'preview';

export interface Vendor {
  id: string;
  user_id: string;
  display_name: string;
  logo_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  title: string;
  slug: string;
  category: ProductCategory;
  summary?: string;
  description?: string;
  delivery_cycle?: DeliveryCycle;
  price_usdt: number;
  billing_period: string;
  cover_image?: string;
  metrics: Record<string, any>;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
  vendor?: Vendor;
}

export interface Subscription {
  id: string;
  user_id: string;
  product_id: string;
  start_at?: string;
  end_at?: string;
  status: SubscriptionStatus;
  tx_hash?: string;
  amt_usdt?: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface PartnerMyLinkProduct {
  id: string;
  partner_id: string;
  product_id: string;
  label_override?: string;
  theme: Record<string, any>;
  position: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface ProductPost {
  id: string;
  product_id: string;
  title?: string;
  body?: string;
  attachments: Array<{ url: string; type: string; name?: string }>;
  published_at: string;
  visibility: PostVisibility;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceFilters {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  deliveryCycle?: DeliveryCycle;
  search?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
}

export interface USDTPaymentInfo {
  address: string;
  amount: number;
  memo?: string;
  qrCode?: string;
}