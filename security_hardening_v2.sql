-- VYLOS SECURITY HARDENING MIGRATION V2
-- Run this in your Supabase SQL Editor to secure user_profiles, ai_usage, notifications and scheduler_logs.

-- ====================================================================
-- 1. SECURE USER PROFILES (RLS & TRiggers)
-- ====================================================================
DROP POLICY IF EXISTS "Users can manage own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile safe fields" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can select own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- RLS Policies
CREATE POLICY "Users can select own profile" 
    ON public.user_profiles FOR SELECT 
    TO authenticated 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.user_profiles FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile row" 
    ON public.user_profiles FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Trigger for sensitive column write-protection
CREATE OR REPLACE FUNCTION public.check_user_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only restrict changes if executed by a normal authenticated/anon user session
    IF current_setting('role', true) IN ('authenticated', 'anon') THEN
        IF (NEW.role IS DISTINCT FROM OLD.role) OR
           (NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier) OR
           (NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan) OR
           (NEW.is_internal_user IS DISTINCT FROM OLD.is_internal_user) OR
           (NEW.subscription_status IS DISTINCT FROM OLD.subscription_status) OR
           (NEW.payment_customer_id IS DISTINCT FROM OLD.payment_customer_id) OR
           (NEW.trial_started_at IS DISTINCT FROM OLD.trial_started_at) OR
           (NEW.subscription_started_at IS DISTINCT FROM OLD.subscription_started_at) OR
           (NEW.subscription_expires_at IS DISTINCT FROM OLD.subscription_expires_at) OR
           (NEW.trial_ends_at IS DISTINCT FROM OLD.trial_ends_at) THEN
            RAISE EXCEPTION 'Access Denied: You cannot modify sensitive profile fields.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_user_profile_changes ON public.user_profiles;
CREATE TRIGGER trg_check_user_profile_changes
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_user_profile_changes();


-- ====================================================================
-- 2. SECURE AI USAGE TABLES (SELECT-ONLY FOR USERS)
-- ====================================================================
DROP POLICY IF EXISTS "Users can view own AI usage" ON public.ai_usage;
DROP POLICY IF EXISTS "Users can view their own daily AI usage" ON public.ai_daily_usage;
DROP POLICY IF EXISTS "Users can insert their own daily AI usage" ON public.ai_daily_usage;
DROP POLICY IF EXISTS "Users can update their own daily AI usage" ON public.ai_daily_usage;

CREATE POLICY "Users can view own AI usage" 
    ON public.ai_usage FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own daily AI usage" 
    ON public.ai_daily_usage FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);


-- ====================================================================
-- 3. SECURE NOTIFICATIONS (RLS & TRIGGERS)
-- ====================================================================
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users manage own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own non-system notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notification read state" ON public.notifications;

-- RLS Policies
CREATE POLICY "Users can view own notifications" 
    ON public.notifications FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" 
    ON public.notifications FOR DELETE 
    TO authenticated 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own non-system notifications" 
    ON public.notifications FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id AND type <> 'system');

CREATE POLICY "Users can update own notifications" 
    ON public.notifications FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- Trigger to prevent users from altering notification content
CREATE OR REPLACE FUNCTION public.check_notification_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF current_setting('role', true) IN ('authenticated', 'anon') THEN
        IF (NEW.title IS DISTINCT FROM OLD.title) OR
           (NEW.message IS DISTINCT FROM OLD.message) OR
           (NEW.type IS DISTINCT FROM OLD.type) OR
           (NEW.user_id IS DISTINCT FROM OLD.user_id) THEN
            RAISE EXCEPTION 'Access Denied: You cannot modify notification content.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_notification_changes ON public.notifications;
CREATE TRIGGER trg_check_notification_changes
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.check_notification_changes();


-- ====================================================================
-- 4. SECURE SCHEDULER LOGS
-- ====================================================================
ALTER TABLE IF EXISTS public.scheduler_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view scheduler logs" ON public.scheduler_logs;

CREATE POLICY "Admins can view scheduler logs" 
    ON public.scheduler_logs FOR SELECT 
    TO authenticated 
    USING (
      (auth.jwt() ->> 'email') LIKE '%@vylos.app'
      OR EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'founder')
      )
    );

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
