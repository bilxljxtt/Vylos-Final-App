-- Add Terms and Conditions fields to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS terms_version TEXT DEFAULT 'v1.0',
ADD COLUMN IF NOT EXISTS terms_last_updated TEXT;

-- Update existing profiles to ensure fields exist (though ADD COLUMN IF NOT EXISTS handles it)
COMMENT ON COLUMN public.user_profiles.terms_accepted IS 'Whether the user has accepted the platform terms and conditions';
COMMENT ON COLUMN public.user_profiles.terms_accepted_at IS 'The timestamp when the user accepted the terms';
COMMENT ON COLUMN public.user_profiles.terms_version IS 'The version of the terms that was accepted';
COMMENT ON COLUMN public.user_profiles.terms_last_updated IS 'The date when the terms were last updated';
