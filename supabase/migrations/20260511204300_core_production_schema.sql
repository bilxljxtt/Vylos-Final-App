-- Vylos Production Ready Consolidated Schema
-- This script prepares the Supabase database for live deployment.
-- It ensures all tables, indexes, and RLS policies are correctly configured.

-- 1. CORE TABLES (IF NOT EXISTS)
-- user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  name text,
  email text,
  phone text,
  avatar_url text,
  theme text DEFAULT 'Light',
  language text DEFAULT 'English (US)',
  currency text DEFAULT 'South African Rand (R)',
  notifications jsonb DEFAULT '{"budgetAlerts": true, "billReminders": true, "securityAlerts": false}'::jsonb,
  monthly_income numeric DEFAULT 0,
  country text,
  age integer,
  household_size integer DEFAULT 1,
  risk_tolerance integer DEFAULT 65,
  total_assets numeric DEFAULT 0,
  total_liabilities numeric DEFAULT 0,
  trial_started_at TIMESTAMPTZ DEFAULT now(),
  subscription_plan TEXT DEFAULT 'starter',
  subscription_status TEXT DEFAULT 'trialing',
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMPTZ,
  terms_accepted BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMPTZ,
  terms_version TEXT,
  total_xp NUMERIC DEFAULT 0,
  current_rank TEXT DEFAULT 'Scout Analyst',
  xp_multiplier NUMERIC DEFAULT 1.0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  daily_consistency_score NUMERIC DEFAULT 0,
  last_consistency_date DATE,
  last_login_xp_date DATE,
  dismissed_notifications TEXT[] DEFAULT '{}'
);

-- transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  amount numeric NOT NULL,
  date text NOT NULL, -- legacy
  transaction_date text NOT NULL, -- normalized
  category text NOT NULL,
  type text NOT NULL,
  notes text,
  recurring BOOLEAN DEFAULT false,
  payment_status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- budgets
CREATE TABLE IF NOT EXISTS public.budgets (
  category text NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  spent numeric DEFAULT 0,
  "limit" numeric DEFAULT 0,
  type text NOT NULL DEFAULT 'limit',
  PRIMARY KEY (category, user_id)
);

-- goals
CREATE TABLE IF NOT EXISTS public.goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  target_amount numeric NOT NULL,
  current_amount numeric DEFAULT 0,
  deadline text NOT NULL,
  category text DEFAULT 'Savings',
  status text DEFAULT 'On Track',
  notes text,
  icon text DEFAULT '🎯',
  color text,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  amount numeric NOT NULL,
  category text NOT NULL,
  frequency text NOT NULL,
  next_due text NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- reminders
CREATE TABLE IF NOT EXISTS public.reminders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  amount numeric DEFAULT 0,
  due_date text NOT NULL,
  due_time text,
  category text DEFAULT 'Bills',
  priority text DEFAULT 'medium',
  recurring text DEFAULT 'none',
  status text DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL, -- 'threshold', 'goal', 'system', 'security', 'warning'
  read BOOLEAN DEFAULT false,
  stable_id TEXT, -- For duplicate prevention
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ai_conversations
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role text NOT NULL, -- 'user', 'assistant'
  content text NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- xp_events
CREATE TABLE IF NOT EXISTS public.xp_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  base_xp numeric DEFAULT 0,
  multiplier numeric DEFAULT 1.0,
  final_xp numeric DEFAULT 0,
  description text,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- feedback
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  rating integer,
  comment text,
  category text,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ENABLE RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES (Idempotent)
DO $$ 
BEGIN
    -- Profiles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can manage own profile') THEN
        CREATE POLICY "Users can manage own profile" ON public.user_profiles FOR ALL USING (auth.uid() = id);
    END IF;

    -- Transactions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users manage own transactions') THEN
        CREATE POLICY "Users manage own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Budgets
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'budgets' AND policyname = 'Users manage own budgets') THEN
        CREATE POLICY "Users manage own budgets" ON public.budgets FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Goals
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'goals' AND policyname = 'Users manage own goals') THEN
        CREATE POLICY "Users manage own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Subscriptions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users manage own subscriptions') THEN
        CREATE POLICY "Users manage own subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Reminders
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reminders' AND policyname = 'Users manage own reminders') THEN
        CREATE POLICY "Users manage own reminders" ON public.reminders FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Notifications
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users manage own notifications') THEN
        CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- AI Conversations
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_conversations' AND policyname = 'Users manage own ai_conversations') THEN
        CREATE POLICY "Users manage own ai_conversations" ON public.ai_conversations FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- XP Events
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'xp_events' AND policyname = 'Users manage own xp_events') THEN
        CREATE POLICY "Users manage own xp_events" ON public.xp_events FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Feedback
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND policyname = 'Users manage own feedback') THEN
        CREATE POLICY "Users manage own feedback" ON public.feedback FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_goals_user ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_reminders_user_date ON public.reminders(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_xp_events_user ON public.xp_events(user_id);

-- 5. PERMISSIONS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
