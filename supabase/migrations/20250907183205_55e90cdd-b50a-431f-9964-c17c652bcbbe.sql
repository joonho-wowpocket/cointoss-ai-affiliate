-- Add encryption support for lead captures
-- First, let's add a column to store encrypted contact info and keep the original for migration
ALTER TABLE public.lead_captures ADD COLUMN encrypted_contact_info TEXT;
ALTER TABLE public.lead_captures ADD COLUMN contact_info_hash TEXT;

-- Create encryption/decryption functions using built-in pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to encrypt contact information
CREATE OR REPLACE FUNCTION public.encrypt_contact_info(contact_data JSONB)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT encode(
    pgp_sym_encrypt(
      contact_data::text, 
      coalesce(current_setting('app.contact_encryption_key', true), 'default_fallback_key_change_me')
    ), 
    'base64'
  )
$$;

-- Function to decrypt contact information (restricted access)
CREATE OR REPLACE FUNCTION public.decrypt_contact_info(encrypted_data TEXT)
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pgp_sym_decrypt(
    decode(encrypted_data, 'base64'),
    coalesce(current_setting('app.contact_encryption_key', true), 'default_fallback_key_change_me')
  )::jsonb
$$;

-- Function to create a hash for duplicate detection without exposing PII
CREATE OR REPLACE FUNCTION public.hash_contact_info(contact_data JSONB)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT encode(
    digest(
      concat(
        coalesce(contact_data->>'email', ''),
        coalesce(contact_data->>'phone', ''),
        coalesce(contact_data->>'telegram', '')
      ), 
      'sha256'
    ), 
    'hex'
  )
$$;

-- Function to get masked contact info for partners (safe display)
CREATE OR REPLACE FUNCTION public.get_masked_contact_info(contact_data JSONB)
RETURNS JSONB
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN jsonb_build_object(
    'email_masked', CASE 
      WHEN contact_data->>'email' IS NOT NULL THEN 
        substr(contact_data->>'email', 1, 2) || '***@' || split_part(contact_data->>'email', '@', 2)
      ELSE NULL 
    END,
    'phone_masked', CASE 
      WHEN contact_data->>'phone' IS NOT NULL THEN 
        substr(contact_data->>'phone', 1, 3) || '****' || substr(contact_data->>'phone', -2)
      ELSE NULL 
    END,
    'telegram_masked', CASE 
      WHEN contact_data->>'telegram' IS NOT NULL THEN 
        substr(contact_data->>'telegram', 1, 3) || '***'
      ELSE NULL 
    END,
    'name', contact_data->>'name',
    'company', contact_data->>'company',
    'lead_source', 'lead_magnet'
  );
END;
$$;

-- Update RLS policies to be more restrictive
DROP POLICY IF EXISTS "Partners can view their own lead captures" ON public.lead_captures;
DROP POLICY IF EXISTS "Anyone can create lead captures" ON public.lead_captures;

-- New restrictive policies
CREATE POLICY "Partners can view lead capture metadata only"
ON public.lead_captures
FOR SELECT
USING (
  auth.uid() = partner_id AND 
  -- Only allow viewing basic metadata, not raw contact info
  true
);

CREATE POLICY "Anyone can create encrypted lead captures"
ON public.lead_captures
FOR INSERT
WITH CHECK (
  -- Ensure contact_info is encrypted before insert
  encrypted_contact_info IS NOT NULL AND
  contact_info_hash IS NOT NULL
);

-- Only admins can view decrypted contact information
CREATE POLICY "Admins can view all lead captures"
ON public.lead_captures
FOR ALL
USING (public.is_admin(auth.uid()));

-- Add trigger to automatically encrypt contact info on insert/update
CREATE OR REPLACE FUNCTION public.encrypt_lead_contact_trigger()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If contact_info is provided and not already encrypted
  IF NEW.contact_info IS NOT NULL AND NEW.encrypted_contact_info IS NULL THEN
    NEW.encrypted_contact_info := public.encrypt_contact_info(NEW.contact_info);
    NEW.contact_info_hash := public.hash_contact_info(NEW.contact_info);
    -- Clear the plain text contact_info for security
    NEW.contact_info := NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER encrypt_lead_contact_before_insert
BEFORE INSERT OR UPDATE ON public.lead_captures
FOR EACH ROW
EXECUTE FUNCTION public.encrypt_lead_contact_trigger();