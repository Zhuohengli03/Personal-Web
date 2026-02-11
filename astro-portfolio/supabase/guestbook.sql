-- 留言表：在 Supabase Dashboard → SQL Editor 中执行此脚本
-- Table: guestbook_messages

create table if not exists public.guestbook_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  message text not null,
  created_at timestamptz not null default now()
);

-- 启用 RLS
alter table public.guestbook_messages enable row level security;

-- 表级权限：anon 需有 INSERT/SELECT 才能配合下面策略使用
grant insert, select on public.guestbook_messages to anon;

-- 匿名用户可插入（任何人可留言）
drop policy if exists "anon_insert_guestbook" on public.guestbook_messages;
create policy "anon_insert_guestbook"
  on public.guestbook_messages
  for insert
  to anon
  with check (true);

-- 匿名用户可查询（所有人可看留言列表）
drop policy if exists "anon_select_guestbook" on public.guestbook_messages;
create policy "anon_select_guestbook"
  on public.guestbook_messages
  for select
  to anon
  using (true);

-- 已登录用户（后台 /manage）可查询、删除
drop policy if exists "auth_select_guestbook" on public.guestbook_messages;
create policy "auth_select_guestbook"
  on public.guestbook_messages
  for select
  to authenticated
  using (true);

drop policy if exists "auth_delete_guestbook" on public.guestbook_messages;
create policy "auth_delete_guestbook"
  on public.guestbook_messages
  for delete
  to authenticated
  using (true);

comment on table public.guestbook_messages is '网站留言板';
