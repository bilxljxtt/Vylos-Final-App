-- Add XP and Gamification fields to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS total_xp NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_rank TEXT DEFAULT 'Scout Analyst',
ADD COLUMN IF NOT EXISTS xp_multiplier NUMERIC DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_consistency_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_consistency_date DATE,
ADD COLUMN IF NOT EXISTS last_login_xp_date DATE,
ADD COLUMN IF NOT EXISTS xp_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create XP events table for tracking history
CREATE TABLE IF NOT EXISTS public.xp_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  base_xp NUMERIC NOT NULL DEFAULT 0,
  multiplier NUMERIC NOT NULL DEFAULT 1.0,
  final_xp NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create streak bonus events table
CREATE TABLE IF NOT EXISTS public.streak_bonus_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_milestone INTEGER NOT NULL,
  xp_awarded NUMERIC NOT NULL DEFAULT 0,
  multiplier_increase NUMERIC DEFAULT 0,
  awarded_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for public.xp_events
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own XP events" ON public.xp_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own XP events" ON public.xp_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS for public.streak_bonus_events
ALTER TABLE public.streak_bonus_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own streak bonus events" ON public.streak_bonus_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own streak bonus events" ON public.streak_bonus_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update comments for clarity
COMMENT ON TABLE public.xp_events IS 'History of XP earned by users';
COMMENT ON TABLE public.streak_bonus_events IS 'History of streak milestones and bonuses awarded';
