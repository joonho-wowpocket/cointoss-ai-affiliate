-- Create vendors table for marketplace sellers
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name VARCHAR(120),
  logo_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on vendors
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create products table for marketplace items
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('signals', 'research', 'bot', 'education')),
  summary TEXT,
  description TEXT,
  delivery_cycle VARCHAR(20) CHECK (delivery_cycle IN ('realtime', 'daily', 'weekly', 'monthly')),
  price_usdt NUMERIC(18,6) NOT NULL,
  billing_period VARCHAR(20) DEFAULT 'monthly',
  cover_image TEXT,
  metrics JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'review' CHECK (status IN ('draft', 'review', 'published', 'paused', 'retired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  start_at TIMESTAMP WITH TIME ZONE,
  end_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'canceled')),
  tx_hash TEXT,
  amt_usdt NUMERIC(18,6),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create partner_mylink_products for MyLink integration
CREATE TABLE public.partner_mylink_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  label_override VARCHAR(120),
  theme JSONB DEFAULT '{}'::jsonb,
  position INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on partner_mylink_products
ALTER TABLE public.partner_mylink_products ENABLE ROW LEVEL SECURITY;

-- Create product_posts for content delivery
CREATE TABLE public.product_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  title VARCHAR(160),
  body TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  visibility VARCHAR(20) DEFAULT 'subscribers' CHECK (visibility IN ('subscribers', 'preview')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on product_posts
ALTER TABLE public.product_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendors
CREATE POLICY "Vendors are viewable by everyone" 
ON public.vendors FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own vendor profile" 
ON public.vendors FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendor profile" 
ON public.vendors FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for products
CREATE POLICY "Published products are viewable by everyone" 
ON public.products FOR SELECT 
USING (status = 'published' OR auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));

CREATE POLICY "Vendors can create their own products" 
ON public.products FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));

CREATE POLICY "Vendors can update their own products" 
ON public.products FOR UPDATE 
USING (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" 
ON public.subscriptions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
ON public.subscriptions FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for partner_mylink_products
CREATE POLICY "Partners can manage their own MyLink products" 
ON public.partner_mylink_products FOR ALL 
USING (auth.uid() = partner_id);

-- RLS Policies for product_posts
CREATE POLICY "Product posts are viewable by subscribers or if preview" 
ON public.product_posts FOR SELECT 
USING (
  visibility = 'preview' OR 
  auth.uid() IN (
    SELECT user_id FROM public.subscriptions 
    WHERE product_id = product_posts.product_id 
    AND status = 'active' 
    AND end_at > NOW()
  ) OR
  auth.uid() IN (
    SELECT user_id FROM public.vendors v 
    INNER JOIN public.products p ON v.id = p.vendor_id 
    WHERE p.id = product_posts.product_id
  )
);

CREATE POLICY "Vendors can create posts for their products" 
ON public.product_posts FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.vendors v 
    INNER JOIN public.products p ON v.id = p.vendor_id 
    WHERE p.id = product_id
  )
);

CREATE POLICY "Vendors can update posts for their products" 
ON public.product_posts FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.vendors v 
    INNER JOIN public.products p ON v.id = p.vendor_id 
    WHERE p.id = product_id
  )
);

-- Create indexes for better performance
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_subscriptions_user_status ON public.subscriptions(user_id, status);
CREATE INDEX idx_subscriptions_product_status ON public.subscriptions(product_id, status);
CREATE INDEX idx_product_posts_product_published ON public.product_posts(product_id, published_at DESC);