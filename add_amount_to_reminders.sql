-- VYLOS SCHEMA UPDATE: ADD AMOUNT TO REMINDERS
-- Run this in your Supabase SQL Editor

ALTER TABLE public.reminders
ADD COLUMN IF NOT EXISTS amount NUMERIC;

-- Refresh schema cache after adding columns
NOTIFY pgrst, 'reload schema';
