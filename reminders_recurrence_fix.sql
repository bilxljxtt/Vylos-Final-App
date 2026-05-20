-- VYLOS RECURRING REMINDERS FIX
-- Run this in your Supabase SQL Editor

-- 1. Add billing_day to reminders table
ALTER TABLE public.reminders 
ADD COLUMN IF NOT EXISTS billing_day INTEGER;

-- 2. Create reminder_completions table
-- This allows tracking payment status per monthly occurrence without duplicating the reminder itself.
CREATE TABLE IF NOT EXISTS public.reminder_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reminder_id UUID REFERENCES public.reminders(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL, -- 1-12
    completed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(reminder_id, year, month)
);

-- 3. Enable RLS
ALTER TABLE public.reminder_completions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'reminder_completions' AND policyname = 'Users can manage their own reminder completions'
    ) THEN
        CREATE POLICY "Users can manage their own reminder completions" 
        ON public.reminder_completions 
        FOR ALL 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- 5. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_reminder_completions_composite ON public.reminder_completions(reminder_id, year, month);
CREATE INDEX IF NOT EXISTS idx_reminder_completions_user ON public.reminder_completions(user_id);

-- 6. Refresh schema cache
NOTIFY pgrst, 'reload schema';
