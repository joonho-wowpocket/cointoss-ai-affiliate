-- Create applications table for referral applications
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exchange_id TEXT NOT NULL,
  uid TEXT NOT NULL,
  ref_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'review_pending' CHECK (status IN ('review_pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID
);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own applications"
ON public.applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own applications"
ON public.applications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
ON public.applications
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create unique constraint to prevent duplicate applications
CREATE UNIQUE INDEX applications_user_exchange_active_idx 
ON public.applications (user_id, exchange_id) 
WHERE status IN ('review_pending', 'approved');