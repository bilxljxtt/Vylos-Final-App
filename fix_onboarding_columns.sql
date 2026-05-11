-- Run this in your Supabase SQL Editor to fix the missing onboarding columns

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS "userType" TEXT,
ADD COLUMN IF NOT EXISTS "reason_for_using_vylos" TEXT,
ADD COLUMN IF NOT EXISTS "moneyConfidence" TEXT,
ADD COLUMN IF NOT EXISTS "first_tracking_focus" TEXT,
ADD COLUMN IF NOT EXISTS "currentTrackingMethod" TEXT,
ADD COLUMN IF NOT EXISTS "biggest_money_challenge" TEXT,
ADD COLUMN IF NOT EXISTS "monthly_income_range" TEXT,
ADD COLUMN IF NOT EXISTS "main_money_goal" TEXT,
ADD COLUMN IF NOT EXISTS "review_frequency" TEXT,
ADD COLUMN IF NOT EXISTS "communication_preference" TEXT;
