-- Fix security issue: Restrict exchanges table access to authenticated users only
-- This prevents competitors from accessing sensitive commission rates and business data

DROP POLICY IF EXISTS "Exchanges are viewable by everyone" ON public.exchanges;

-- Create new policy that only allows authenticated users to view exchanges
CREATE POLICY "Exchanges are viewable by authenticated users only" 
ON public.exchanges 
FOR SELECT 
TO authenticated
USING (true);