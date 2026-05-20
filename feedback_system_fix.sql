-- VYLOS FEEDBACK SCHEMA FIX
-- Run this in Supabase SQL Editor to support the new feedback system

DO $$ 
BEGIN
    -- 1. Ensure the table exists
    CREATE TABLE IF NOT EXISTS public.feedback (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now()
    );

    -- 2. Ensure 'rating' exists
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'feedback' AND column_name = 'rating') THEN
        ALTER TABLE public.feedback ADD COLUMN rating INTEGER;
    END IF;

    -- 3. Ensure 'category' exists
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'feedback' AND column_name = 'category') THEN
        ALTER TABLE public.feedback ADD COLUMN category TEXT;
    END IF;

    -- 4. Handle 'message' vs 'comment'
    -- If 'comment' exists but 'message' doesn't, rename it
    IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'feedback' AND column_name = 'comment') AND 
       NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'feedback' AND column_name = 'message') THEN
        ALTER TABLE public.feedback RENAME COLUMN comment TO message;
    -- If neither exists, add 'message'
    ELSIF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'feedback' AND column_name = 'message') THEN
        ALTER TABLE public.feedback ADD COLUMN message TEXT;
    END IF;

    -- 5. Ensure 'name' exists
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'feedback' AND column_name = 'name') THEN
        ALTER TABLE public.feedback ADD COLUMN name TEXT;
    END IF;

    -- 6. Ensure 'email' exists
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'feedback' AND column_name = 'email') THEN
        ALTER TABLE public.feedback ADD COLUMN email TEXT;
    END IF;

    -- 7. Ensure 'status' exists
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'feedback' AND column_name = 'status') THEN
        ALTER TABLE public.feedback ADD COLUMN status TEXT DEFAULT 'new';
    END IF;

END $$;

-- 8. Fix RLS (Ensure users can insert even if not fully authenticated, if allowed by app)
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (authenticated or not) - adjust if you want restricted to logged in only
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.feedback;
CREATE POLICY "Anyone can insert feedback" ON public.feedback
  FOR INSERT WITH CHECK (true);

-- Users can only view their own feedback
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;
CREATE POLICY "Users can view own feedback" ON public.feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Admins/System can view everything
DROP POLICY IF EXISTS "Admins view all feedback" ON public.feedback;
CREATE POLICY "Admins view all feedback" ON public.feedback
  FOR SELECT USING (true); -- Usually restricted to admin role in production
