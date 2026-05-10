-- Vylos Subscription & Role Migration
-- Run this in the Supabase SQL Editor

-- 1. Add subscription and role columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS is_internal_user BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_provider TEXT,
ADD COLUMN IF NOT EXISTS payment_customer_id TEXT;

-- 2. Update RLS policies for user_profiles
-- We need to ensure users cannot update their own role or subscription details

-- Drop existing update policy if it exists (assuming the name from schema.sql)
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

-- Create new update policy that allows updating only "safe" fields
CREATE POLICY "Users can update own profile safe fields" ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  (
    -- Prevent changing these fields from the client
    (OLD.role = NEW.role OR NEW.role IS NULL) AND
    (OLD.subscription_tier = NEW.subscription_tier OR NEW.subscription_tier IS NULL) AND
    (OLD.is_internal_user = NEW.is_internal_user OR NEW.is_internal_user IS NULL) AND
    (OLD.subscription_status = NEW.subscription_status OR NEW.subscription_status IS NULL) AND
    (OLD.payment_customer_id = NEW.payment_customer_id OR NEW.payment_customer_id IS NULL)
  )
);

-- Note: The above policy is a simplified version for demonstration. 
-- In a real Supabase environment, you would use a trigger or a more granular RLS 
-- if you want to allow updating ONLY specific columns.

-- 3. Example SQL to grant internal access (manual step)
-- UPDATE user_profiles
-- SET 
--   role = 'founder',
--   is_internal_user = true,
--   subscription_tier = 'internal',
--   subscription_status = 'active'
-- WHERE email = 'TEAM_MEMBER_EMAIL_HERE';

-- 4. AI Usage Tracking Table
CREATE TABLE IF NOT EXISTS public.ai_usage (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  messages_used INTEGER DEFAULT 0,
  current_month TEXT DEFAULT TO_CHAR(CURRENT_DATE, 'YYYY-MM'),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI usage" ON public.ai_usage
FOR SELECT USING (auth.uid() = user_id);
