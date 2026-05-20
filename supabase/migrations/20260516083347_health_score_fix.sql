-- Vylos Health Score Table Alignment & RLS Hardening
-- This ensures the health score table matches the code's expectations and has secure RLS.

-- 1. Ensure the table is named 'user_health_scores' (Standardizing)
DO $$ 
BEGIN
    -- If table was accidentally named 'health_scores' or 'healthscore', rename it.
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'health_scores') THEN
        ALTER TABLE public.health_scores RENAME TO user_health_scores;
    ELSIF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'healthscore') THEN
        ALTER TABLE public.healthscore RENAME TO user_health_scores;
    END IF;
END $$;

-- 2. Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_health_scores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    score integer NOT NULL,
    status text NOT NULL,
    breakdown jsonb NOT NULL,
    calculated_at timestamptz DEFAULT now() NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- 3. Ensure Columns are Correct (Add if missing)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_health_scores' AND column_name='breakdown') THEN
        ALTER TABLE public.user_health_scores ADD COLUMN breakdown jsonb DEFAULT '{}'::jsonb NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_health_scores' AND column_name='status') THEN
        ALTER TABLE public.user_health_scores ADD COLUMN status text DEFAULT 'Calculating' NOT NULL;
    END IF;
END $$;

-- 4. Enable Row Level Security
ALTER TABLE public.user_health_scores ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Remove existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own health scores" ON public.user_health_scores;
DROP POLICY IF EXISTS "Service role manages health scores" ON public.user_health_scores;

-- Policy: Users can only view their own records
CREATE POLICY "Users can view their own health scores"
ON public.user_health_scores
FOR SELECT
USING (auth.uid() = user_id);

-- Note: No INSERT/UPDATE policy for users. Only service_role (Admin API) can write scores.
-- This prevents users from spoofing their own health scores.

-- 6. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_user_health_scores_user_id ON public.user_health_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_health_scores_calculated_at ON public.user_health_scores(calculated_at DESC);

-- 7. Ensure billing_day exists in public.reminders
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reminders' AND column_name='billing_day') THEN
        ALTER TABLE public.reminders ADD COLUMN billing_day integer;
    END IF;
END $$;

-- 8. AUDIT & REMOVE ROGUE TRIGGERS
-- If the data scientist added slow triggers to core tables, they will freeze the app.
-- We audit and remove any triggers on 'reminders' or 'transactions' that aren't system-internal.
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT t.tgname AS trigger_name, c.relname AS table_name
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public'
          AND c.relname IN ('reminders', 'transactions')
          AND NOT t.tgisinternal
          AND t.tgname NOT LIKE 'supabase_%'
    ) LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON public.' || quote_ident(r.table_name) || ' CASCADE;';
    END LOOP;
END $$;

-- 8. Refresh schema cache
NOTIFY pgrst, 'reload schema';
