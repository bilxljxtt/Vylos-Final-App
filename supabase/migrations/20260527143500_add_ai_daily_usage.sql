-- Create ai_daily_usage table to enforce daily limits
CREATE TABLE IF NOT EXISTS public.ai_daily_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, usage_date)
);

-- Enable RLS and policies
ALTER TABLE public.ai_daily_usage ENABLE ROW LEVEL SECURITY;

-- Remove policies if they already exist
DROP POLICY IF EXISTS "Users can view their own daily AI usage" ON public.ai_daily_usage;
DROP POLICY IF EXISTS "Users can insert their own daily AI usage" ON public.ai_daily_usage;
DROP POLICY IF EXISTS "Users can update their own daily AI usage" ON public.ai_daily_usage;

-- Create policies
CREATE POLICY "Users can view their own daily AI usage"
    ON public.ai_daily_usage FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily AI usage"
    ON public.ai_daily_usage FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily AI usage"
    ON public.ai_daily_usage FOR UPDATE
    USING (auth.uid() = user_id);
