-- Performance Optimization Indexes Migration
-- This script prepares the Vylos Supabase database for production-grade scaling.
-- It uses PL/pgSQL to check for table existence before creating indexes, preventing 42P01 errors.

DO $$
BEGIN
    -- 1. Transactions Indexing (user_id + date/category/type filters)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'transactions' AND schemaname = 'public') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_transactions_user_date_legacy ON public.transactions(user_id, date DESC)';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON public.transactions(user_id, type)';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON public.transactions(user_id, category)';
    END IF;

    -- 2. Goals Indexing (user_id + created_at/deadline sorting & checks)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'goals' AND schemaname = 'public') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_goals_user_created_at ON public.goals(user_id, created_at DESC)';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_goals_user_deadline ON public.goals(user_id, deadline)';
    END IF;

    -- 3. Reminders Indexing (user_id + status/due_date filters)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'reminders' AND schemaname = 'public') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_reminders_user_status ON public.reminders(user_id, status)';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_reminders_user_date ON public.reminders(user_id, due_date ASC)';
    END IF;

    -- 4. Reminder Completions composite monthly tracking index
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'reminder_completions' AND schemaname = 'public') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_reminder_completions_user_rem ON public.reminder_completions(user_id, reminder_id, year, month)';
    END IF;

    -- 5. Subscriptions user lookup index
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'subscriptions' AND schemaname = 'public') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id)';
    END IF;

    -- 6. Debts user lookup index
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'debts' AND schemaname = 'public') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_debts_user ON public.debts(user_id)';
    END IF;

    -- 7. Notifications user and creation ordering index
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notifications' AND schemaname = 'public') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at ON public.notifications(user_id, created_at DESC)';
    END IF;

    -- 8. AI Conversations user and chat order index
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'ai_conversations' AND schemaname = 'public') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_created ON public.ai_conversations(user_id, created_at DESC)';
    END IF;

    -- 9. AI Monthly Usage user and month tracking index
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'ai_usage' AND schemaname = 'public') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ai_usage' AND column_name = 'billing_month') THEN
            EXECUTE 'CREATE INDEX IF NOT EXISTS idx_ai_usage_user_month ON public.ai_usage(user_id, billing_month)';
        END IF;
    END IF;

    -- 10. AI Daily Usage user and date tracking index
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'ai_daily_usage' AND schemaname = 'public') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_ai_daily_usage_user_date ON public.ai_daily_usage(user_id, usage_date)';
    END IF;

    -- 11. User Health Scores user and calculation order index
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_health_scores' AND schemaname = 'public') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_user_health_scores_user_calc ON public.user_health_scores(user_id, calculated_at DESC)';
    END IF;

    -- 12. Feedback user lookup index
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'feedback' AND schemaname = 'public') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_feedback_user ON public.feedback(user_id)';
    END IF;

    -- 13. Merchant pattern rules lookup indexes
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'merchant_rules' AND schemaname = 'public') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_merchant_rules_user ON public.merchant_rules(user_id)';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'merchant_category_rules' AND schemaname = 'public') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_merchant_category_rules_user ON public.merchant_category_rules(user_id)';
    END IF;

    -- 14. Goal Contributions lookup index
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'goal_contributions' AND schemaname = 'public') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_goal_contributions_user_goal ON public.goal_contributions(user_id, goal_id)';
    END IF;
END $$;
