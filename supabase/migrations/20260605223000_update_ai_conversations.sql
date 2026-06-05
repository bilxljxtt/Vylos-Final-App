-- Migration to update ai_conversations table for metadata logging
-- Safely adds columns to track AI provider, latency, success, and error types.

ALTER TABLE public.ai_conversations ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE public.ai_conversations ADD COLUMN IF NOT EXISTS latency_ms INTEGER;
ALTER TABLE public.ai_conversations ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT TRUE;
ALTER TABLE public.ai_conversations ADD COLUMN IF NOT EXISTS error_type TEXT;

-- Create an index to support analyzing performance metrics per user/provider
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_provider ON public.ai_conversations(user_id, provider);
