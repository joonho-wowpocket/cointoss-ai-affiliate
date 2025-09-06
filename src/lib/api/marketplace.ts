import { supabase } from '@/integrations/supabase/client';
import { Product, Subscription, MarketplaceFilters, PartnerMyLinkProduct, ProductPost } from '@/lib/types/marketplace';

export const marketplaceApi = {
  // Get products with filters
  async getProducts(filters: MarketplaceFilters = {}) {
    let query = supabase
      .from('products')
      .select(`
        *,
        vendor:vendors(*)
      `)
      .eq('status', 'published');

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.minPrice) {
      query = query.gte('price_usdt', filters.minPrice);
    }

    if (filters.maxPrice) {
      query = query.lte('price_usdt', filters.maxPrice);
    }

    if (filters.deliveryCycle) {
      query = query.eq('delivery_cycle', filters.deliveryCycle);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,summary.ilike.%${filters.search}%`);
    }

    // Apply sorting
    switch (filters.sort) {
      case 'price_asc':
        query = query.order('price_usdt', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price_usdt', { ascending: false });
        break;
      case 'popular':
        // TODO: Add popularity metric based on subscriptions
        query = query.order('created_at', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Product[];
  },

  // Get single product by slug
  async getProduct(slug: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        vendor:vendors(*)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) throw error;
    return data as Product;
  },

  // Get user's subscriptions
  async getMySubscriptions() {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        product:products(
          *,
          vendor:vendors(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Subscription[];
  },

  // Create subscription (USDT payment)
  async createSubscription(productId: string, txHash?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        product_id: productId,
        tx_hash: txHash,
        status: txHash ? 'pending' : 'pending' // Admin will verify
      })
      .select()
      .single();

    if (error) throw error;
    return data as Subscription;
  },

  // Get product posts (subscriber content)
  async getProductPosts(productId: string) {
    const { data, error } = await supabase
      .from('product_posts')
      .select('*')
      .eq('product_id', productId)
      .order('published_at', { ascending: false });

    if (error) throw error;
    return data as ProductPost[];
  },

  // Check if user has active subscription to product
  async hasActiveSubscription(productId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('product_id', productId)
      .eq('status', 'active')
      .gt('end_at', new Date().toISOString())
      .limit(1);

    if (error) throw error;
    return data.length > 0;
  },

  // MyLink integration
  async getMyLinkProducts() {
    const { data, error } = await supabase
      .from('partner_mylink_products')
      .select(`
        *,
        product:products(
          *,
          vendor:vendors(*)
        )
      `)
      .order('position');

    if (error) throw error;
    return data as PartnerMyLinkProduct[];
  },

  async addToMyLink(productId: string, labelOverride?: string, theme?: Record<string, any>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('partner_mylink_products')
      .insert({
        partner_id: user.id,
        product_id: productId,
        label_override: labelOverride,
        theme: theme || {},
        position: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data as PartnerMyLinkProduct;
  },

  async removeFromMyLink(id: string) {
    const { error } = await supabase
      .from('partner_mylink_products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateMyLinkProduct(id: string, updates: Partial<PartnerMyLinkProduct>) {
    const { data, error } = await supabase
      .from('partner_mylink_products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as PartnerMyLinkProduct;
  }
};