-- run this inside your Supabase SQL editor

create table public.user_profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  email text,
  phone text,
  avatar_url text,
  theme text default 'Light',
  language text default 'English (US)',
  currency text default 'South African Rand (R)',
  notifications jsonb default '{"budgetAlerts": true, "billReminders": true, "securityAlerts": false}'::jsonb,
  monthly_income numeric default 0,
  country text,
  age integer,
  household_size integer default 1,
  risk_tolerance integer default 65,
  total_assets numeric default 0,
  total_liabilities numeric default 0
);

create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  amount numeric not null,
  date text not null,
  category text not null,
  type text not null
);

create table public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  target_amount numeric not null,
  current_amount numeric default 0,
  created_at text not null
);

create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  amount numeric not null,
  category text not null,
  frequency text not null,
  next_due text not null
);

create table public.budgets (
  category text not null,
  user_id uuid references auth.users on delete cascade not null,
  spent numeric default 0,
  "limit" numeric default 0,
  type text not null,
  primary key (category, user_id)
);

-- Turn on RLS
alter table public.user_profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;
alter table public.subscriptions enable row level security;
alter table public.budgets enable row level security;

-- Policies for Authenticated Users
create policy "Users can view own profile" on public.user_profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.user_profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.user_profiles for update using (auth.uid() = id);

create policy "Users manage own transactions" on public.transactions for all using (auth.uid() = user_id);
create policy "Users manage own goals" on public.goals for all using (auth.uid() = user_id);
create policy "Users manage own subscriptions" on public.subscriptions for all using (auth.uid() = user_id);
create policy "Users manage own budgets" on public.budgets for all using (auth.uid() = user_id);
