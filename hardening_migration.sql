-- Vylos Security & Performance Hardening Migration
-- This script refines RLS policies and adds missing performance indexes.

-- 1. REFINED RLS POLICIES
-- Feedback: Users should only be able to Insert and View their own, not Delete/Update once submitted.
DROP POLICY IF EXISTS "Users manage own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can submit feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;

CREATE POLICY "Users can submit feedback" 
ON public.feedback FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback" 
ON public.feedback FOR SELECT 
USING (auth.uid() = user_id);

-- Notifications: Ensure read-only for message content, but allow updating 'read' status.
-- (Supabase RLS 'FOR ALL' covers this, but we could be more specific if needed)

-- 2. PERFORMANCE INDEXES (Missing from initial consolidated schema)
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON public.transactions(amount);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON public.reminders(status);
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_due ON public.subscriptions(next_due);

-- 3. DATA INTEGRITY CONSTRAINTS
-- Ensure numeric values aren't inexplicably NULL
ALTER TABLE public.transactions ALTER COLUMN amount SET NOT NULL;
ALTER TABLE public.user_profiles ALTER COLUMN monthly_income SET NOT NULL;
ALTER TABLE public.goals ALTER COLUMN target_amount SET NOT NULL;
ALTER TABLE public.goals ALTER COLUMN current_amount SET NOT NULL;

-- 4. VIEW FOR AGGREGATED ANALYTICS (Optional but good for performance)
-- Note: This requires the user to have enough data to be useful.
CREATE OR REPLACE VIEW public.user_spending_summary AS
SELECT 
    user_id,
    category,
    SUM(ABS(amount)) as total_spent,
    COUNT(*) as transaction_count,
    DATE_TRUNC('month', transaction_date::date) as month
FROM public.transactions
WHERE amount < 0
GROUP BY user_id, category, DATE_TRUNC('month', transaction_date::date);

-- Grant access to the view
GRANT SELECT ON public.user_spending_summary TO authenticated;
