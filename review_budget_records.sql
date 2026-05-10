-- VYLOS BUDGET RECORD REVIEW
-- Run this in your Supabase SQL Editor to see which records are "Budget Top-ups"

SELECT 
    id, 
    user_id, 
    title, 
    category, 
    amount, 
    date, 
    transaction_date,
    created_at
FROM public.transactions
WHERE title ILIKE '%budget top-up%'
   OR title ILIKE '%budget allocation%'
   OR title ILIKE '%top-up%'
   OR title ILIKE '%allocation%'
ORDER BY date DESC;

-- DO NOT DELETE YET. Review the results first.
-- If you want to delete them later, the command would be:
-- DELETE FROM public.transactions WHERE title ILIKE '%budget top-up%' OR title ILIKE '%budget allocation%';
