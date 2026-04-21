-- Vylos Final Production Migration
-- Run this in your Supabase SQL Editor

-- 1. Update User Profiles with Subscription & Trial info
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing';

-- 2. Create Notifications Table for extensible alert history
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'threshold', 'goal', 'system', 'security'
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create AI Conversations Table for persistent advisor chat
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL, -- 'user', 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own notifications') THEN
        CREATE POLICY "Users can manage their own notifications" ON public.notifications
          FOR ALL USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own ai chat') THEN
        CREATE POLICY "Users can manage their own ai chat" ON public.ai_conversations
          FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON public.ai_conversations(user_id);
