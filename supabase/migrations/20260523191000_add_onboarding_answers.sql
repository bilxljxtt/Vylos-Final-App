-- Add onboarding_answers column to user_profiles table to store questionnaire details
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS onboarding_answers jsonb DEFAULT '{}'::jsonb;
