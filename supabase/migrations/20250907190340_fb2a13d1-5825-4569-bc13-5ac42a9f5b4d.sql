-- Update partner_exchange_status table to ensure proper UID tracking
ALTER TABLE public.partner_exchange_status 
ADD COLUMN IF NOT EXISTS partner_uid TEXT,
ADD COLUMN IF NOT EXISTS approval_notes TEXT,
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Update customer_uid_registrations to add more tracking fields
ALTER TABLE public.customer_uid_registrations
ADD COLUMN IF NOT EXISTS partner_notes TEXT,
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,4) DEFAULT 0.25;

-- Create enum for UID validation status
DO $$ BEGIN
    CREATE TYPE public.uid_validation_status AS ENUM ('pending', 'valid', 'invalid', 'duplicate');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add validation status to UID tables
ALTER TABLE public.uids 
ADD COLUMN IF NOT EXISTS validation_status public.uid_validation_status DEFAULT 'pending';

ALTER TABLE public.customer_uid_registrations
ADD COLUMN IF NOT EXISTS validation_status public.uid_validation_status DEFAULT 'pending';

-- Create function to validate UID format and check for duplicates
CREATE OR REPLACE FUNCTION public.validate_and_register_uid(
    p_user_id UUID,
    p_exchange_id TEXT,
    p_uid TEXT,
    p_uid_type TEXT DEFAULT 'customer'
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result JSON;
    v_is_valid BOOLEAN;
    v_is_duplicate BOOLEAN;
    v_status TEXT;
BEGIN
    -- Validate UID format using existing function
    v_is_valid := validate_uid_format(p_uid, p_exchange_id);
    
    -- Check for duplicates across both partner and customer UIDs
    SELECT COUNT(*) > 0 INTO v_is_duplicate
    FROM (
        SELECT uid FROM partner_exchange_status 
        WHERE partner_uid = p_uid AND exchange_id = p_exchange_id
        UNION ALL
        SELECT customer_uid FROM customer_uid_registrations 
        WHERE customer_uid = p_uid AND exchange_id = p_exchange_id
    ) duplicates;
    
    -- Determine validation status
    IF NOT v_is_valid THEN
        v_status := 'invalid';
    ELSIF v_is_duplicate THEN
        v_status := 'duplicate';
    ELSE
        v_status := 'valid';
    END IF;
    
    -- Return validation result
    v_result := json_build_object(
        'valid', v_is_valid AND NOT v_is_duplicate,
        'validation_status', v_status,
        'message', 
        CASE 
            WHEN NOT v_is_valid THEN 'Invalid UID format for ' || p_exchange_id
            WHEN v_is_duplicate THEN 'UID already registered'
            ELSE 'UID validation successful'
        END
    );
    
    RETURN v_result;
END;
$$;

-- Create function to get partner UID statistics
CREATE OR REPLACE FUNCTION public.get_partner_uid_stats(p_user_id UUID)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT json_build_object(
        'total_exchanges', COUNT(*),
        'approved_exchanges', COUNT(*) FILTER (WHERE state = 'Approved'),
        'pending_exchanges', COUNT(*) FILTER (WHERE state = 'Applied'),
        'basic_exchanges', COUNT(*) FILTER (WHERE state = 'NotApplied'),
        'total_customers', (
            SELECT COUNT(*) FROM customer_uid_registrations 
            WHERE partner_id = p_user_id AND status = 'approved'
        ),
        'monthly_earnings', COALESCE((
            SELECT SUM(amount) FROM earnings 
            WHERE user_id = p_user_id 
            AND date >= date_trunc('month', CURRENT_DATE)
        ), 0)
    )
    FROM partner_exchange_status
    WHERE user_id = p_user_id;
$$;