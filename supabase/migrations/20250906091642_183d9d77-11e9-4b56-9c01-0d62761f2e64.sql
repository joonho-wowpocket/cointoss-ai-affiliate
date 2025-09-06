-- Create lead magnets table
CREATE TABLE public.lead_magnets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    topic TEXT NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('pdf_report', 'checklist', 'quiz', 'workbook', 'infographic')),
    target_audience TEXT NOT NULL,
    lead_goal TEXT NOT NULL CHECK (lead_goal IN ('email', 'telegram', 'phone', 'form')),
    depth TEXT NOT NULL CHECK (depth IN ('lite', 'standard', 'pro')),
    locale TEXT NOT NULL DEFAULT 'ko',
    content_json JSONB NOT NULL,
    brand_settings JSONB NOT NULL,
    compliance_settings JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    download_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lead_magnets ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own lead magnets" 
ON public.lead_magnets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lead magnets" 
ON public.lead_magnets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lead magnets" 
ON public.lead_magnets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lead magnets" 
ON public.lead_magnets 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create lead captures table for tracking leads
CREATE TABLE public.lead_captures (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_magnet_id UUID NOT NULL REFERENCES public.lead_magnets(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL,
    contact_info JSONB NOT NULL,
    captured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    source TEXT,
    ip_address INET,
    user_agent TEXT
);

-- Enable RLS for lead captures
ALTER TABLE public.lead_captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view their own lead captures" 
ON public.lead_captures 
FOR SELECT 
USING (auth.uid() = partner_id);

CREATE POLICY "Anyone can create lead captures" 
ON public.lead_captures 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lead_magnets_updated_at
BEFORE UPDATE ON public.lead_magnets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_lead_magnets_user_id ON public.lead_magnets(user_id);
CREATE INDEX idx_lead_magnets_status ON public.lead_magnets(status);
CREATE INDEX idx_lead_captures_lead_magnet_id ON public.lead_captures(lead_magnet_id);
CREATE INDEX idx_lead_captures_partner_id ON public.lead_captures(partner_id);