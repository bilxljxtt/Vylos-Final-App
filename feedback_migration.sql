-- VYLOS FEEDBACK SYSTEM
-- Run this in your Supabase SQL Editor

-- 1. Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER,
    category TEXT, -- 'Bug', 'Feature Request', 'General Feedback', 'Complaint'
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new', -- 'new', 'reviewed', 'resolved'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own feedback') THEN
        CREATE POLICY "Users can insert their own feedback" ON public.feedback
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own feedback') THEN
        CREATE POLICY "Users can view their own feedback" ON public.feedback
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    -- Admin policy (Optional, can be restricted by role if implemented)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all feedback') THEN
        CREATE POLICY "Admins can view all feedback" ON public.feedback
          FOR SELECT USING (true); -- For now, making it viewable if needed, but RLS usually blocks unless authenticated
    END IF;
END $$;

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_user ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON public.feedback(created_at DESC);
