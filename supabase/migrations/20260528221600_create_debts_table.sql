-- Create debts table for native tracking
CREATE TABLE IF NOT EXISTS public.debts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  monthly_repayment numeric NOT NULL DEFAULT 0,
  outstanding_balance numeric NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage their own debts
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'debts' AND policyname = 'Users manage own debts') THEN
        CREATE POLICY "Users manage own debts" ON public.debts FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Grant privileges
GRANT ALL ON public.debts TO authenticated;
