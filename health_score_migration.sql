-- 1. Create the user_health_scores table
CREATE TABLE IF NOT EXISTS public.user_health_scores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    score integer NOT NULL,
    status text NOT NULL,
    breakdown jsonb NOT NULL,
    calculated_at timestamptz DEFAULT now() NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- 2. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_health_scores_user_id ON public.user_health_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_health_scores_calculated_at ON public.user_health_scores(calculated_at);

-- 3. Enable Row Level Security
ALTER TABLE public.user_health_scores ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Users can read only their own health score
CREATE POLICY "Users can view their own health scores"
ON public.user_health_scores
FOR SELECT
USING (auth.uid() = user_id);

-- Only service role/admin backend logic can insert or update health scores
-- (No policies for INSERT/UPDATE/DELETE allows only the service_role key to bypass RLS)

-- 5. Add a comment for documentation
COMMENT ON TABLE public.user_health_scores IS 'Stores historical and current financial health scores for Vylos users.';
