Please do a system-wide UI/data consistency pass for Vylos.

Do not only patch visuals. Inspect the real data flow and make sure every dashboard/progress figure is calculated from actual user data.

1. Home/Dashboard health score audit
The Home page mostly looks fine, but I need you to verify that the financial health score is calculated correctly.

Check whether the health score uses real logged-in user data from:
- transactions
- income
- expenses
- budgets
- goals
- subscriptions/bills
- reminders if relevant
- savings/goal progress

Required:
- No hardcoded health score.
- No fake/demo values.
- Score must update when user adds/edits/deletes transactions, budgets, goals, bills, or subscriptions.
- Score must persist correctly after refresh.
- If there is not enough data, show a sensible empty/new-user state.

2. “At a glance” card calculations
On the Home page, check the section/card that says things like:
- “You can spend today”
- “You can survive for monthly bills”
- similar at-a-glance insights

These must be calculated correctly from real user data.

Required:
- Use current month data.
- Use real income, expenses, budgets, and upcoming bills.
- Do not use hardcoded demo numbers.
- Do not show misleading values if data is missing.
- Empty state should say something like “Add income and expenses to calculate this.”

Vital insights can stay, but make sure they are not using fake data unless clearly marked as general tips.

3. Remove duplicate page headings
Across multiple pages, the page title is repeated.

Examples:
- Calendar shows “Financial Calendar” at the top and then again below.
- Budget shows “Budget” and then “Budget” again.
- Transactions shows “Transactions” and then “Transactions” again.
- Same issue may exist in Goals, Reminders, Progress, Settings, etc.

Fix this globally:
- Each page should have one clean heading only.
- Keep the best-looking heading/subtitle layout.
- Remove repeated duplicate headings inside the same page.
- Do not remove useful subtitles.
- Make the structure consistent across all pages.

4. Settings subscription confusion
In Settings, when I click “Subscription” nothing happens.

But under Legal / Terms and Conditions, I see Subscription & Billing, which is wrong.
It looks like the Upgrade/Subscription section was placed under the wrong Settings area.

Fix Settings layout:
- Subscription / Billing should be its own clear settings section.
- Legal should only show Privacy Policy and Terms of Use.
- Do not place subscription/billing inside legal terms.
- Clicking Subscription must open the subscription/billing/upgrade view.

5. Upgrade / plan action buttons
Currently buttons like:
- Upgrade Now
- Go Advanced
- Contact Sales
- Change Plan

do nothing.

For now, since the billing system is not live, make these buttons open a clean “Coming Soon” modal.

Modal content:
Title: “Coming Soon”
Message: “Plan upgrades and billing will be available soon. Leave your email and we’ll notify you when this feature is ready.”
Fields:
- email input, default to logged-in user email if available
- optional message
Buttons:
- Notify Me
- Cancel

If feedback/waitlist table exists, save it there.
If not, provide SQL for a simple waitlist/billing_interest table:
- id uuid primary key default gen_random_uuid()
- user_id uuid references auth.users(id)
- email text not null
- message text nullable
- source text default 'billing_upgrade'
- created_at timestamptz default now()

Enable RLS:
- users can insert their own request
- users can view their own request if needed
- no public read access

6. Progress tab data accuracy
The Progress tab can stay visually as it is, but the values must be real.

Check:
- habits
- streaks
- track expenses
- stay under budget
- save money
- goals progress
- recent achievements

Required:
- No hardcoded habits/streaks.
- No hardcoded recent achievements.
- Track expenses should be based on actual transaction logging behaviour.
- Stay under budget should be based on budget limits vs actual spending.
- Save money should be based on income minus expenses and/or goal contributions.
- Goals progress should be based on real goal progress.
- Achievements should be generated from real milestones.

Examples:
- “Logged expenses 7 days in a row” only if user actually did.
- “Stayed under budget this month” only if actual spent <= allocated budget.
- “Goal reached” only if a goal is actually complete.
- “Saved R500 this month” only if calculated from real data.

If new users have no data:
- show an empty state
- do not show fake achievements

7. System-wide hardcoded/demo data search
Search the entire codebase for hardcoded:
- health score
- “you can spend today”
- survival/bills numbers
- progress streaks
- achievements
- fake transactions
- fake budgets
- fake goals
- fake subscription/billing responses
- repeated page titles
- mock/demo values

Remove or replace with real calculations.

8. Data calculation source of truth
Where possible, centralize calculations in helper/service functions instead of each component calculating differently.

Recommended:
- Dashboard summary helper
- Budget summary helper
- Progress summary helper
- Financial health score helper

Make sure:
- Dashboard, Budget, Calendar, Progress, and Advisor do not disagree on the same totals.
- Use transaction_date → date → created_at fallback.
- Use logged-in user data only.
- Use ZAR formatting.

9. Final tests
Test after changes:
- Add income
- Add expense
- Add budget
- Add goal
- Add goal contribution
- Add subscription/bill if supported
- Check dashboard health score updates
- Check at-a-glance updates
- Check budget updates
- Check progress updates
- Check achievements update
- Check duplicate headings are gone
- Check Settings subscription works
- Check Legal only contains legal items
- Check upgrade/change plan buttons show Coming Soon modal
- Refresh page and confirm data persists
- Run npm run build

10. Final output
Tell me:
- Whether health score was hardcoded or real
- What the health score now uses
- Whether at-a-glance was hardcoded or real
- Which duplicate headings were removed
- What was wrong with Settings subscription/legal routing
- How upgrade buttons behave now
- Whether Progress habits/streaks/achievements are real or still pending
- What files changed
- Whether npm run build passed