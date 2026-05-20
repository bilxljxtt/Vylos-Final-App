-- Vylos Receipt Upload System Migration
-- Creates receipt_upload_sessions and receipts tables and adds security RLS policies.

-- ====================================================================
-- 1. CREATE TABLES
-- ====================================================================

-- 1.1 receipt_upload_sessions
CREATE TABLE IF NOT EXISTS public.receipt_upload_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    uploaded_receipt_id UUID, -- Will link to public.receipts(id) after upload completes
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT check_session_status CHECK (status IN ('pending', 'uploaded', 'expired', 'cancelled'))
);

-- 1.2 receipts
CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    upload_session_id UUID REFERENCES public.receipt_upload_sessions(id) ON DELETE SET NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    source TEXT DEFAULT 'manual_upload' NOT NULL,
    status TEXT DEFAULT 'uploaded' NOT NULL,
    merchant_name TEXT,
    amount NUMERIC,
    receipt_date DATE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Ensure default value is 'manual_upload' if table already exists
ALTER TABLE public.receipts ALTER COLUMN source SET DEFAULT 'manual_upload';

-- Complete the relationship from session to receipt (idempotent constraint check)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_uploaded_receipt' 
        AND table_name = 'receipt_upload_sessions'
    ) THEN
        ALTER TABLE public.receipt_upload_sessions 
        ADD CONSTRAINT fk_uploaded_receipt 
        FOREIGN KEY (uploaded_receipt_id) REFERENCES public.receipts(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ====================================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================================
ALTER TABLE public.receipt_upload_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- 3. DEFINE RLS POLICIES FOR USERS (auth.uid() = user_id)
-- ====================================================================

-- 3.1 receipt_upload_sessions Policies
DROP POLICY IF EXISTS "Users can manage own upload sessions" ON public.receipt_upload_sessions;
CREATE POLICY "Users can manage own upload sessions" ON public.receipt_upload_sessions
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3.2 receipts Policies
DROP POLICY IF EXISTS "Users can manage own receipts" ON public.receipts;
CREATE POLICY "Users can manage own receipts" ON public.receipts
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ====================================================================
-- 4. PERFORMANCE-OPTIMIZATION INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_receipt_sessions_user ON public.receipt_upload_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_receipt_sessions_token ON public.receipt_upload_sessions(token);
CREATE INDEX IF NOT EXISTS idx_receipt_sessions_status ON public.receipt_upload_sessions(status);
CREATE INDEX IF NOT EXISTS idx_receipts_user ON public.receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_transaction ON public.receipts(transaction_id);
CREATE INDEX IF NOT EXISTS idx_receipts_session ON public.receipts(upload_session_id);

-- ====================================================================
-- 5. PERMISSIONS & CACHE RELOAD
-- ====================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
NOTIFY pgrst, 'reload schema';

-- ====================================================================
-- 6. STORAGE BUCKET CONFIGURATION
-- ====================================================================

-- 6.1 Create private bucket 'receipts' with PDF and image support
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'receipts', 
    'receipts', 
    false, -- Private bucket
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];


-- 6.3 Allow authenticated users to view their own receipts
DROP POLICY IF EXISTS "Users can view own receipts in storage" ON storage.objects;
CREATE POLICY "Users can view own receipts in storage" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'receipts' 
        AND name LIKE 'receipts/' || auth.uid()::text || '/%'
    );

-- 6.4 Allow authenticated users to delete their own receipts
DROP POLICY IF EXISTS "Users can delete own receipts in storage" ON storage.objects;
CREATE POLICY "Users can delete own receipts in storage" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'receipts' 
        AND name LIKE 'receipts/' || auth.uid()::text || '/%'
    );

-- 6.5 Allow authenticated users to upload their own receipts directly
DROP POLICY IF EXISTS "Users can upload own receipts" ON storage.objects;
CREATE POLICY "Users can upload own receipts" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'receipts' 
        AND name LIKE 'receipts/' || auth.uid()::text || '/%'
    );
