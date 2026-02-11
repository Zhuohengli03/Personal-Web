-- 【可选】合并为一张表：会话 + 行为都在 analytics_sessions 里，一行一用户
-- 执行前请备份。执行后需改前端：不再写 analytics_events，改为 PATCH 追加到 sessions.events。
-- 在 Supabase Dashboard → SQL Editor 中执行

-- 1. 给会话表增加 events 列（该会话全部行为的 JSON 数组）
alter table public.analytics_sessions
  add column if not exists events jsonb default '[]'::jsonb;

comment on column public.analytics_sessions.events is '该会话全部行为，按时间序：[{event_type, page_path, created_at, metadata}, ...]';

-- 2. 把现有 analytics_events 按 session_id 聚合并写回 sessions.events（仅当前已有数据，之后由前端维护）
update public.analytics_sessions s
set events = (
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'event_type', e.event_type,
      'page_path', e.page_path,
      'created_at', e.created_at,
      'metadata', coalesce(e.metadata, '{}'::jsonb)
    ) order by e.created_at
  ), '[]'::jsonb)
  from public.analytics_events e
  where e.session_id = s.id
);

-- 3. 之后若确定不再需要事件表，可手动执行（谨慎）：
-- drop view if exists public.analytics_sessions_one_row;
-- drop view if exists public.analytics_sessions_with_stats;
-- drop table if exists public.analytics_events;
-- 并修改前端：创建会话仍 INSERT analytics_sessions；每条事件改为 PATCH analytics_sessions 的 events 列（array_append 或 RPC）。
