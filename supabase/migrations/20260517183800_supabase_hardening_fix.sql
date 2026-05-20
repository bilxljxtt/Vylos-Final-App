-- Vylos Supabase Hardening & Consolidation Migration
-- This script ensures all table structures are fully synchronized and locked down.
-- Run this in your Supabase SQL Editor.

-- ====================================================================
-- 1. CONSOLIDATED SCHEMAS & MISSING TABLES
-- ====================================================================

-- merchant_rules (completely missing manual keywords matching table)
CREATE TABLE IF NOT EXISTS public.merchant_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    merchant_keyword TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- goal_contributions (missing from standard migration directory)
CREATE TABLE IF NOT EXISTS public.goal_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL,
    date TEXT NOT NULL, -- YYYY-MM-DD
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- reminder_completions (missing from standard migration directory)
CREATE TABLE IF NOT EXISTS public.reminder_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reminder_id UUID REFERENCES public.reminders(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL, -- 1-12
    completed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(reminder_id, year, month)
);

-- streak_bonus_events (missing from standard migration directory)
CREATE TABLE IF NOT EXISTS public.streak_bonus_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    streak_milestone INTEGER NOT NULL,
    xp_awarded NUMERIC NOT NULL DEFAULT 0,
    multiplier_increase NUMERIC DEFAULT 0,
    awarded_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- import_batches (missing from standard migration directory)
CREATE TABLE IF NOT EXISTS public.import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    total_rows INTEGER DEFAULT 0,
    processed_rows INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- merchant_category_rules (missing from standard migration directory)
CREATE TABLE IF NOT EXISTS public.merchant_category_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    merchant_pattern TEXT NOT NULL,
    category TEXT NOT NULL,
    confidence_score DOUBLE PRECISION DEFAULT 1.0,
    usage_count INTEGER DEFAULT 1,
    last_used TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, merchant_pattern)
);

-- ====================================================================
-- 2. DYNAMIC GOAL CONTRIBUTIONS TRIGGER
-- ====================================================================
CREATE OR REPLACE FUNCTION public.sync_goal_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.goals 
        SET current_amount = COALESCE(current_amount, 0) + NEW.amount
        WHERE id = NEW.goal_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.goals 
        SET current_amount = COALESCE(current_amount, 0) - OLD.amount
        WHERE id = OLD.goal_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE public.goals 
        SET current_amount = COALESCE(current_amount, 0) - OLD.amount + NEW.amount
        WHERE id = NEW.goal_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_contribution_change ON public.goal_contributions;
CREATE TRIGGER on_contribution_change
AFTER INSERT OR UPDATE OR DELETE ON public.goal_contributions
FOR EACH ROW EXECUTE FUNCTION public.sync_goal_amount();

-- ====================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================================
ALTER TABLE public.merchant_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_bonus_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_category_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- 4. HARDENING RLS POLICIES & FIXING LEAKS
-- ====================================================================

-- 4.1 Fix Feedback privacy breach (Drop rogue Admin View All policy)
DROP POLICY IF EXISTS "Admins view all feedback" ON public.feedback;

DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.feedback;
CREATE POLICY "Anyone can insert feedback" ON public.feedback
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;
CREATE POLICY "Users can view own feedback" ON public.feedback
  FOR SELECT USING (auth.uid() = user_id);

-- 4.2 merchant_rules Policies
DROP POLICY IF EXISTS "Users manage own merchant_rules" ON public.merchant_rules;
CREATE POLICY "Users manage own merchant_rules" ON public.merchant_rules
  FOR ALL USING (auth.uid() = user_id);

-- 4.3 goal_contributions Policies
DROP POLICY IF EXISTS "Users manage own goal contributions" ON public.goal_contributions;
CREATE POLICY "Users manage own goal contributions" ON public.goal_contributions
  FOR ALL USING (auth.uid() = user_id);

-- 4.4 reminder_completions Policies
DROP POLICY IF EXISTS "Users manage own reminder completions" ON public.reminder_completions;
CREATE POLICY "Users manage own reminder completions" ON public.reminder_completions
  FOR ALL USING (auth.uid() = user_id);

-- 4.5 streak_bonus_events Policies
DROP POLICY IF EXISTS "Users view own streak bonus events" ON public.streak_bonus_events;
CREATE POLICY "Users view own streak bonus events" ON public.streak_bonus_events
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own streak bonus events" ON public.streak_bonus_events;
CREATE POLICY "Users insert own streak bonus events" ON public.streak_bonus_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4.6 import_batches Policies
DROP POLICY IF EXISTS "Users manage own import batches" ON public.import_batches;
CREATE POLICY "Users manage own import batches" ON public.import_batches
  FOR ALL USING (auth.uid() = user_id);

-- 4.7 merchant_category_rules Policies
DROP POLICY IF EXISTS "Users manage own merchant category rules" ON public.merchant_category_rules;
CREATE POLICY "Users manage own merchant category rules" ON public.merchant_category_rules
  FOR ALL USING (auth.uid() = user_id);

-- ====================================================================
-- 5. PERFORMANCE INDEXES & AUDITING TIMESTAMPS
-- ====================================================================

-- Safely add created_at tracking for budgets auditing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='budgets' AND column_name='created_at') THEN
        ALTER TABLE public.budgets ADD COLUMN created_at TIMESTAMPTZ DEFAULT now() NOT NULL;
    END IF;
END $$;

-- Core performance-optimization indexes for foreign keys & date ordering
CREATE INDEX IF NOT EXISTS idx_budgets_user ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON public.ai_conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_merchant_rules_user ON public.merchant_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_user ON public.goal_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_goal ON public.goal_contributions(goal_id);
CREATE INDEX IF NOT EXISTS idx_reminder_completions_user ON public.reminder_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_completions_composite ON public.reminder_completions(reminder_id, year, month);
CREATE INDEX IF NOT EXISTS idx_streak_bonus_events_user ON public.streak_bonus_events(user_id);
CREATE INDEX IF NOT EXISTS idx_import_batches_user ON public.import_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_merchant_category_rules_user ON public.merchant_category_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_merchant_category_rules_pattern ON public.merchant_category_rules(user_id, merchant_pattern);

-- ====================================================================
-- 6. PERMISSIONS & SCHEMA CACHE RELOAD
-- ====================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
NOTIFY pgrst, 'reload schema';
