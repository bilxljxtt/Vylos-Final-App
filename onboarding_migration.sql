-- Add onboarding questionnaire fields to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS user_type TEXT,
ADD COLUMN IF NOT EXISTS main_reason TEXT,
ADD COLUMN IF NOT EXISTS money_confidence TEXT,
ADD COLUMN IF NOT EXISTS tracking_focus TEXT,
ADD COLUMN IF NOT EXISTS current_tracking_method TEXT,
ADD COLUMN IF NOT EXISTS financial_struggles TEXT,
ADD COLUMN IF NOT EXISTS monthly_income_range TEXT,
ADD COLUMN IF NOT EXISTS biggest_financial_goal TEXT,
ADD COLUMN IF NOT EXISTS review_frequency TEXT,
ADD COLUMN IF NOT EXISTS communication_preference TEXT;

-- Update comments for clarity
COMMENT ON COLUMN public.user_profiles.user_type IS 'Question 1: What best describes you?';
COMMENT ON COLUMN public.user_profiles.main_reason IS 'Question 2: Main reason for joining Vylos';
COMMENT ON COLUMN public.user_profiles.money_confidence IS 'Question 3: Financial management confidence';
COMMENT ON COLUMN public.user_profiles.tracking_focus IS 'Question 4: Type of financial activity to track first';
COMMENT ON COLUMN public.user_profiles.current_tracking_method IS 'Question 5: How they currently track money';
COMMENT ON COLUMN public.user_profiles.financial_struggles IS 'Question 6: Financial areas they struggle with the most';
COMMENT ON COLUMN public.user_profiles.monthly_income_range IS 'Question 7: Monthly income range';
COMMENT ON COLUMN public.user_profiles.biggest_financial_goal IS 'Question 8: Biggest financial goal right now';
COMMENT ON COLUMN public.user_profiles.review_frequency IS 'Question 9: Review frequency preference';
COMMENT ON COLUMN public.user_profiles.communication_preference IS 'Question 10: Notification/Marketing preferences';
