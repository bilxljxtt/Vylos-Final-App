-- VYLOS GOALS & CONTRIBUTIONS STABILIZATION MIGRATION
-- Run this in your Supabase SQL Editor

-- 1. Fix Goals table schema (Add missing columns)
ALTER TABLE public.goals 
ADD COLUMN IF NOT EXISTS deadline TEXT,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Savings',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'On Track',
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '🎯',
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#00D8A5',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Ensure numeric types for amounts
ALTER TABLE public.goals ALTER COLUMN current_amount TYPE NUMERIC;
ALTER TABLE public.goals ALTER COLUMN target_amount TYPE NUMERIC;

-- 2. Create goal_contributions table
CREATE TABLE IF NOT EXISTS public.goal_contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL,
    date TEXT NOT NULL, -- YYYY-MM-DD
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own goal contributions') THEN
        CREATE POLICY "Users can manage their own goal contributions" ON public.goal_contributions
          FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 5. Automate Goal Updates (Trigger)
-- This ensures that goals.current_amount is always in sync with contributions

CREATE OR REPLACE FUNCTION public.sync_goal_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.goals 
        SET current_amount = current_amount + NEW.amount
        WHERE id = NEW.goal_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.goals 
        SET current_amount = current_amount - OLD.amount
        WHERE id = OLD.goal_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE public.goals 
        SET current_amount = current_amount - OLD.amount + NEW.amount
        WHERE id = NEW.goal_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_contribution_change ON public.goal_contributions;
CREATE TRIGGER on_contribution_change
AFTER INSERT OR UPDATE OR DELETE ON public.goal_contributions
FOR EACH ROW EXECUTE FUNCTION public.sync_goal_amount();

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_goal_contributions_goal ON public.goal_contributions(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_user ON public.goal_contributions(user_id);
