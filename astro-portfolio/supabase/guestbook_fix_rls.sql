-- 修复 403 / "new row violates row-level security policy"
-- 在 Supabase Dashboard → SQL Editor 中执行本文件（确认选对项目）

-- 1. Schema 与表级权限
grant usage on schema public to anon;
grant insert, select on public.guestbook_messages to anon;
grant insert, select, delete on public.guestbook_messages to authenticated;

-- 2. 删除该表上所有现有 RLS 策略
drop policy if exists "anon_insert_guestbook" on public.guestbook_messages;
drop policy if exists "anon_select_guestbook" on public.guestbook_messages;
drop policy if exists "auth_insert_guestbook" on public.guestbook_messages;
drop policy if exists "auth_select_guestbook" on public.guestbook_messages;
drop policy if exists "auth_delete_guestbook" on public.guestbook_messages;

-- 3. 匿名用户：可插入、可查询（留言板公开）
create policy "anon_insert_guestbook"
  on public.guestbook_messages for insert to anon with check (true);

create policy "anon_select_guestbook"
  on public.guestbook_messages for select to anon using (true);

-- 4. 已登录用户：可插入、可查询、可删除（登录后留言或后台管理）
create policy "auth_insert_guestbook"
  on public.guestbook_messages for insert to authenticated with check (true);

create policy "auth_select_guestbook"
  on public.guestbook_messages for select to authenticated using (true);

create policy "auth_delete_guestbook"
  on public.guestbook_messages for delete to authenticated using (true);

-- 执行后若仍 403，可在 SQL Editor 运行下面确认策略已存在：
-- select policyname, cmd, roles from pg_policies where tablename = 'guestbook_messages';
