-- Create exchanges table
CREATE TABLE public.exchanges (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    base_rate DECIMAL(5,4) NOT NULL DEFAULT 0.25,
    approved_rate DECIMAL(5,4),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
    logo_url TEXT,
    ref_param TEXT NOT NULL DEFAULT 'ref',
    base_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create partner_exchange_status table
CREATE TABLE public.partner_exchange_status (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    exchange_id TEXT NOT NULL REFERENCES public.exchanges(id),
    mode TEXT NOT NULL CHECK (mode IN ('basic', 'approved')),
    state TEXT NOT NULL CHECK (state IN ('NotApplied', 'Applied', 'Reviewing', 'Approved', 'Rejected')),
    ref_code TEXT,
    application_data JSONB,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, exchange_id, mode)
);

-- Create links table  
CREATE TABLE public.links (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    exchange_id TEXT NOT NULL REFERENCES public.exchanges(id),
    mode TEXT NOT NULL CHECK (mode IN ('basic', 'approved')),
    url TEXT NOT NULL,
    clicks INTEGER NOT NULL DEFAULT 0,
    conversions INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create uids table
CREATE TABLE public.uids (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    exchange_id TEXT NOT NULL REFERENCES public.exchanges(id),
    uid TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'NeedInfo')),
    memo TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(exchange_id, uid)
);

-- Create earnings table
CREATE TABLE public.earnings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    uid_id UUID REFERENCES public.uids(id),
    exchange_id TEXT NOT NULL REFERENCES public.exchanges(id),
    mode TEXT NOT NULL CHECK (mode IN ('basic', 'approved')),
    amount DECIMAL(15,8) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USDT',
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create settlements table
CREATE TABLE public.settlements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    amount DECIMAL(15,8) NOT NULL,
    network TEXT NOT NULL DEFAULT 'TRC20',
    address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Sent', 'Failed')),
    tx_hash TEXT,
    fee DECIMAL(15,8),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_exchange_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exchanges (public read)
CREATE POLICY "Exchanges are viewable by everyone" 
ON public.exchanges 
FOR SELECT 
USING (true);

-- RLS Policies for partner_exchange_status
CREATE POLICY "Users can view their own partner status" 
ON public.partner_exchange_status 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own partner status" 
ON public.partner_exchange_status 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own partner status" 
ON public.partner_exchange_status 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for links
CREATE POLICY "Users can view their own links" 
ON public.links 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own links" 
ON public.links 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own links" 
ON public.links 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for uids
CREATE POLICY "Users can view their own UIDs" 
ON public.uids 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own UIDs" 
ON public.uids 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own UIDs" 
ON public.uids 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for earnings
CREATE POLICY "Users can view their own earnings" 
ON public.earnings 
FOR SELECT 
USING (auth.uid() = user_id);

-- RLS Policies for settlements
CREATE POLICY "Users can view their own settlements" 
ON public.settlements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settlements" 
ON public.settlements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_exchanges_updated_at
BEFORE UPDATE ON public.exchanges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partner_exchange_status_updated_at
BEFORE UPDATE ON public.partner_exchange_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_links_updated_at
BEFORE UPDATE ON public.links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_uids_updated_at
BEFORE UPDATE ON public.uids
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settlements_updated_at
BEFORE UPDATE ON public.settlements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_partner_exchange_status_user_id ON public.partner_exchange_status(user_id);
CREATE INDEX idx_partner_exchange_status_exchange_id ON public.partner_exchange_status(exchange_id);
CREATE INDEX idx_links_user_id ON public.links(user_id);
CREATE INDEX idx_links_exchange_id ON public.links(exchange_id);
CREATE INDEX idx_uids_user_id ON public.uids(user_id);
CREATE INDEX idx_uids_exchange_id ON public.uids(exchange_id);
CREATE INDEX idx_uids_status ON public.uids(status);
CREATE INDEX idx_earnings_user_id ON public.earnings(user_id);
CREATE INDEX idx_earnings_date ON public.earnings(date);
CREATE INDEX idx_settlements_user_id ON public.settlements(user_id);
CREATE INDEX idx_settlements_status ON public.settlements(status);

-- Insert initial exchange data
INSERT INTO public.exchanges (id, name, base_rate, approved_rate, base_url, ref_param, logo_url) VALUES
('bybit', 'Bybit', 0.25, 0.85, 'https://www.bybit.com/register', 'ref', '🟡'),
('binance', 'Binance', 0.30, 0.85, 'https://accounts.binance.com/register', 'ref', '🔶'),
('okx', 'OKX', 0.25, 0.80, 'https://www.okx.com/join', 'ref', '⚫'),
('gate', 'Gate.io', 0.20, 0.75, 'https://www.gate.io/signup', 'ref', '🔵');