-- SQL Migration Script for Vylos Smart Transaction Import
-- Run this in your Supabase SQL Editor

-- 1. Create Import Batches Table
CREATE TABLE IF NOT EXISTS import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Merchant/Category Learning Rules Table
CREATE TABLE IF NOT EXISTS merchant_category_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  merchant_pattern TEXT NOT NULL,
  category TEXT NOT NULL,
  confidence_score FLOAT DEFAULT 1.0,
  usage_count INTEGER DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, merchant_pattern)
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_category_rules ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own batches') THEN
        CREATE POLICY "Users can manage their own batches" ON import_batches
          FOR ALL USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own rules') THEN
        CREATE POLICY "Users can manage their own rules" ON merchant_category_rules
          FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 5. Add Index for performance
CREATE INDEX IF NOT EXISTS idx_import_batches_user ON import_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_merchant_rules_user_pattern ON merchant_category_rules(user_id, merchant_pattern);
