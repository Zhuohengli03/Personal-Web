-- 修复 401：允许匿名用户插入/更新/查询 analytics_sessions、插入 analytics_events（前端埋点）
-- 在 Supabase Dashboard → SQL Editor 中执行本文件，确认选对项目后点 Run

-- 1. 表级权限：anon 需要 INSERT、UPDATE、SELECT（POST 用 return=representation 时会再查一次刚插入的行）
grant select, insert, update on public.analytics_sessions to anon;
grant insert on public.analytics_events to anon;

-- 2. 确保 RLS 开启
alter table public.analytics_sessions enable row level security;
alter table public.analytics_events enable row level security;

-- 3. RLS 策略：anon 可插入/更新/查询会话（查询仅用于插入后返回新行）
drop policy if exists "anon_insert_sessions" on public.analytics_sessions;
create policy "anon_insert_sessions"
  on public.analytics_sessions for insert to anon with check (true);

drop policy if exists "anon_update_sessions" on public.analytics_sessions;
create policy "anon_update_sessions"
  on public.analytics_sessions for update to anon using (true);

drop policy if exists "anon_select_sessions" on public.analytics_sessions;
create policy "anon_select_sessions"
  on public.analytics_sessions for select to anon using (true);

drop policy if exists "anon_insert_events" on public.analytics_events;
create policy "anon_insert_events"
  on public.analytics_events for insert to anon with check (true);
