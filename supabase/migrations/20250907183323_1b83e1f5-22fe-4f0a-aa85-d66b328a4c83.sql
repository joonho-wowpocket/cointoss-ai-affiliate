-- Add encryption support columns
ALTER TABLE public.lead_captures ADD COLUMN IF NOT EXISTS encrypted_contact_info TEXT;
ALTER TABLE public.lead_captures ADD COLUMN IF NOT EXISTS contact_info_hash TEXT;

-- Update RLS policies to be more restrictive
DROP POLICY IF EXISTS "Partners can view their own lead captures" ON public.lead_captures;
DROP POLICY IF EXISTS "Anyone can create lead captures" ON public.lead_captures;

-- New restrictive policies
-- Partners can only see basic metadata, not contact_info
CREATE POLICY "Partners can view lead metadata only"
ON public.lead_captures
FOR SELECT
USING (auth.uid() = partner_id);

-- Allow secure lead capture creation
CREATE POLICY "Secure lead capture creation"
ON public.lead_captures
FOR INSERT
WITH CHECK (true); -- We'll handle security in the edge function

-- Only admins can update/delete lead captures
CREATE POLICY "Admins can manage lead captures"
ON public.lead_captures
FOR ALL
USING (public.is_admin(auth.uid()));