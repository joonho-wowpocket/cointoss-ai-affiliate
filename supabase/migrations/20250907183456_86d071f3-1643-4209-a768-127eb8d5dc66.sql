-- Create function to increment download count safely
CREATE OR REPLACE FUNCTION public.increment_download_count(magnet_id UUID)
RETURNS void
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.lead_magnets 
  SET download_count = download_count + 1 
  WHERE id = magnet_id;
$$;