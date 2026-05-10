-- VYLOS FINANCIAL REMINDERS SYSTEM MIGRATION
-- Run this in your Supabase SQL Editor

-- 1. Create or Update Reminders Table
-- We drop if exists to ensure the new schema is applied correctly, 
-- but in a real prod app we would use ALTER. Since this is pre-launch, DROP is safer for a clean start.
DROP TABLE IF EXISTS public.reminders;

CREATE TABLE public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Custom', -- Bill Payment, Budget Review, Goal Contribution, Subscription Renewal, Transaction Logging, Custom
    due_date DATE NOT NULL,
    due_time TIME,
    priority TEXT DEFAULT 'medium', -- low, medium, high
    recurring TEXT DEFAULT 'none', -- none, daily, weekly, monthly
    status TEXT DEFAULT 'pending', -- pending, completed, overdue
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Users can manage their own reminders" 
ON public.reminders 
FOR ALL 
USING (auth.uid() = user_id);

-- 4. Indexes for Performance
CREATE INDEX idx_reminders_user_status ON public.reminders(user_id, status);
CREATE INDEX idx_reminders_user_due_date ON public.reminders(user_id, due_date);

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_reminders_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_reminders_timestamp
BEFORE UPDATE ON public.reminders
FOR EACH ROW EXECUTE FUNCTION update_reminders_timestamp();
