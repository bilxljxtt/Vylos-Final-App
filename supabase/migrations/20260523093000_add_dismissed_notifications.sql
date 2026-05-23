-- Migration: Add dismissed_notifications column to user_profiles
-- This ensures notifications can be dismissed and tracked correctly per user.

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS dismissed_notifications TEXT[] DEFAULT '{}';
