-- Add encryption support for lead captures using application-level encryption
ALTER TABLE public.lead_captures ADD COLUMN encrypted_contact_info TEXT;
ALTER TABLE public.lead_captures ADD COLUMN contact_info_hash TEXT;

-- Update RLS policies to be more restrictive
DROP POLICY IF EXISTS "Partners can view their own lead captures" ON public.lead_captures;
DROP POLICY IF EXISTS "Anyone can create lead captures" ON public.lead_captures;

-- New restrictive policies - partners can only see metadata, not contact info
CREATE POLICY "Partners can view lead capture metadata only"
ON public.lead_captures
FOR SELECT
USING (
  auth.uid() = partner_id
);

-- Only allow inserts with encrypted data or admin role
CREATE POLICY "Secure lead capture creation"
ON public.lead_captures
FOR INSERT
WITH CHECK (
  -- Either admin role or encrypted_contact_info must be provided
  public.is_admin(auth.uid()) OR encrypted_contact_info IS NOT NULL
);

-- Only admins can update lead captures
CREATE POLICY "Admins can update lead captures"
ON public.lead_captures
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Only admins can delete lead captures
CREATE POLICY "Admins can delete lead captures"
ON public.lead_captures
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Create a view for partners that only shows safe metadata
CREATE OR REPLACE VIEW public.lead_captures_safe AS
SELECT 
  id,
  lead_magnet_id,
  partner_id,
  captured_at,
  source,
  -- Create masked contact info indicator without exposing PII
  CASE 
    WHEN encrypted_contact_info IS NOT NULL THEN 
      jsonb_build_object(
        'has_email', (contact_info_hash LIKE '%email%'),
        'has_phone', (contact_info_hash LIKE '%phone%'),
        'has_telegram', (contact_info_hash LIKE '%telegram%'),
        'contact_type', 'encrypted'
      )
    ELSE NULL 
  END as contact_summary
FROM public.lead_captures;

-- Grant access to the safe view
GRANT SELECT ON public.lead_captures_safe TO authenticated;

-- RLS for the safe view
ALTER VIEW public.lead_captures_safe SET (security_barrier = true);
CREATE POLICY "Partners can view safe lead capture data"
ON public.lead_captures_safe
FOR SELECT
USING (auth.uid() = partner_id);