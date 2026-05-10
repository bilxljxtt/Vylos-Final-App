-- Goals and Contributions Schema
-- Run this in Supabase SQL Editor

-- Create goal_contributions table if not exists
CREATE TABLE IF NOT EXISTS public.goal_contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own goal contributions') THEN
        CREATE POLICY "Users can manage their own goal contributions" ON public.goal_contributions
          FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_goal_contributions_user ON public.goal_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_goal ON public.goal_contributions(goal_id);

-- Ensure current_amount in goals is numeric
-- (Already numeric in schema.sql but good to be sure)
ALTER TABLE public.goals ALTER COLUMN current_amount TYPE NUMERIC;
ALTER TABLE public.goals ALTER COLUMN target_amount TYPE NUMERIC;
