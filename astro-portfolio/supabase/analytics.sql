-- 前端埋点：会话与事件
-- 在 Supabase Dashboard → SQL Editor 中执行（建议在 guestbook.sql 之后执行）
-- 与前端一致：path 无尾斜杠（根为 /）；page_leave 的 duration 在 metadata.duration_ms，仅统计可见时长且 ≥500ms 才上报。
-- 若之前执行过本文件但后台仍无数据，请再执行一次本文件（含下方 grant）或单独执行 analytics_fix_anon_insert.sql。

-- 会话表：每个访客会话一条，用于会话数、流量来源、留言转化率（前端 sessionStorage 存 id，服务端生成）
create table if not exists public.analytics_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  referrer text,
  landing_page text,
  user_agent text
);

-- 事件表：page_view / click / page_leave；page_leave 的 metadata.duration_ms 为可见停留毫秒数
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.analytics_sessions(id) on delete cascade,
  event_type text not null check (event_type in ('page_view', 'click', 'page_leave')),
  page_path text not null,
  created_at timestamptz not null default now(),
  metadata jsonb default '{}'
);

comment on table public.analytics_sessions is '前端埋点：访客会话';
comment on table public.analytics_events is '前端埋点：页面浏览、点击、离开（时长在 metadata.duration_ms）';
comment on column public.analytics_events.metadata is 'page_leave 时含 duration_ms（可见停留毫秒）；click 时含 target、link_to_guestbook 等';

-- 留言表增加 session_id，用于计算留言转化率
alter table public.guestbook_messages
  add column if not exists session_id uuid references public.analytics_sessions(id) on delete set null;

create index if not exists idx_analytics_events_session_id on public.analytics_events(session_id);
create index if not exists idx_analytics_events_created_at on public.analytics_events(created_at);
create index if not exists idx_analytics_events_type on public.analytics_events(event_type);
create index if not exists idx_analytics_events_page_path on public.analytics_events(page_path);
create index if not exists idx_analytics_events_type_created on public.analytics_events(event_type, created_at);
create index if not exists idx_guestbook_messages_session_id on public.guestbook_messages(session_id);

-- 表级权限：anon 才能插入/更新会话、插入事件（否则前端埋点 403/401）
grant usage on schema public to anon;
grant select, insert, update on public.analytics_sessions to anon;
grant insert on public.analytics_events to anon;

-- RLS：匿名可插入会话与事件；仅已登录用户可读（后台看数）
alter table public.analytics_sessions enable row level security;
alter table public.analytics_events enable row level security;

drop policy if exists "anon_insert_sessions" on public.analytics_sessions;
create policy "anon_insert_sessions"
  on public.analytics_sessions for insert to anon with check (true);

drop policy if exists "anon_update_sessions" on public.analytics_sessions;
create policy "anon_update_sessions"
  on public.analytics_sessions for update to anon using (true);

drop policy if exists "auth_select_sessions" on public.analytics_sessions;
create policy "auth_select_sessions"
  on public.analytics_sessions for select to authenticated using (true);

drop policy if exists "anon_insert_events" on public.analytics_events;
create policy "anon_insert_events"
  on public.analytics_events for insert to anon with check (true);

drop policy if exists "auth_select_events" on public.analytics_events;
create policy "auth_select_events"
  on public.analytics_events for select to authenticated using (true);

drop policy if exists "auth_delete_events" on public.analytics_events;
create policy "auth_delete_events"
  on public.analytics_events for delete to authenticated using (true);

drop policy if exists "auth_delete_sessions" on public.analytics_sessions;
create policy "auth_delete_sessions"
  on public.analytics_sessions for delete to authenticated using (true);
