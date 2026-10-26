create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  type text not null check (type in ('income','expense')),
  amount bigint not null check (amount > 0 and amount <= 1000000000),
  description text not null check (char_length(trim(description)) between 1 and 100),
  category text not null check (category in ('Makan & minum','Transportasi','Belanja','Kos & tagihan','Kuliah','Hiburan','Lainnya')),
  date date not null,
  created_at timestamptz not null default now()
);
create index transactions_owner_date on public.transactions (user_id,date desc);
alter table public.transactions enable row level security;
create policy "owner_select" on public.transactions for select to authenticated using ((select auth.uid()) = user_id);
create policy "owner_insert" on public.transactions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "owner_update" on public.transactions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "owner_delete" on public.transactions for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.transactions from anon;
grant select,insert,update,delete on public.transactions to authenticated;
create table public.budgets (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category text not null check (category in ('Makan & minum','Transportasi','Belanja','Kos & tagihan','Kuliah','Hiburan','Lainnya')),
  amount bigint not null check (amount > 0 and amount <= 1000000000),
  primary key (user_id,category)
);
alter table public.budgets enable row level security;
create policy "owner_select" on public.budgets for select to authenticated using ((select auth.uid()) = user_id);
create policy "owner_insert" on public.budgets for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "owner_update" on public.budgets for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "owner_delete" on public.budgets for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.budgets from anon;
grant select,insert,update,delete on public.budgets to authenticated;
