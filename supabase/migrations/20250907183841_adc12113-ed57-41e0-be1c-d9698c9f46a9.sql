-- Create customer UID registrations table
CREATE TABLE public.customer_uid_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    customer_uid TEXT NOT NULL,
    exchange_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    exchange_confirmation_hash TEXT,
    registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Ensure unique customer UID per exchange
    UNIQUE(customer_uid, exchange_id)
);

-- Enable RLS
ALTER TABLE public.customer_uid_registrations ENABLE ROW LEVEL SECURITY;

-- RLS policies for customer UID registrations
CREATE POLICY "Partners can view their own customer UID registrations"
ON public.customer_uid_registrations
FOR SELECT
USING (auth.uid() = partner_id);

CREATE POLICY "Partners can create customer UID registrations"
ON public.customer_uid_registrations
FOR INSERT
WITH CHECK (auth.uid() = partner_id);

CREATE POLICY "Partners can update their own customer UID registrations"
ON public.customer_uid_registrations
FOR UPDATE
USING (auth.uid() = partner_id);

CREATE POLICY "Admins can manage all customer UID registrations"
ON public.customer_uid_registrations
FOR ALL
USING (public.is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_customer_uid_registrations_updated_at
BEFORE UPDATE ON public.customer_uid_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to validate UID format by exchange
CREATE OR REPLACE FUNCTION public.validate_uid_format(uid TEXT, exchange TEXT)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Exchange-specific UID validation
  CASE exchange
    WHEN 'binance' THEN
      -- Binance UIDs are typically 8-12 digits
      RETURN uid ~ '^[0-9]{8,12}$';
    WHEN 'bybit' THEN
      -- Bybit UIDs are typically 5-12 digits
      RETURN uid ~ '^[0-9]{5,12}$';
    WHEN 'okx' THEN
      -- OKX UIDs can be alphanumeric
      RETURN uid ~ '^[A-Za-z0-9]{6,20}$';
    WHEN 'gate' THEN
      -- Gate.io UIDs are typically numeric
      RETURN uid ~ '^[0-9]{6,15}$';
    ELSE
      -- Default validation for unknown exchanges
      RETURN uid ~ '^[A-Za-z0-9_-]{3,32}$';
  END CASE;
END;
$$;

-- Create view for customer UID statistics
CREATE OR REPLACE VIEW public.customer_uid_stats AS
SELECT 
  partner_id,
  exchange_id,
  COUNT(*) as total_registrations,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
  MAX(registered_at) as last_registration
FROM public.customer_uid_registrations
GROUP BY partner_id, exchange_id;

-- Grant access to the stats view
GRANT SELECT ON public.customer_uid_stats TO authenticated;

-- Update earnings table to link with customer UIDs
ALTER TABLE public.earnings ADD COLUMN IF NOT EXISTS customer_uid_registration_id UUID REFERENCES public.customer_uid_registrations(id);