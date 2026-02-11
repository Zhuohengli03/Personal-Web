-- 会话汇总视图：每个用户会话一行，带 PV/点击/时长等聚合，便于查看「一个用户一条」而非几十条事件
-- 在 Supabase Dashboard → SQL Editor 中执行

create or replace view public.analytics_sessions_with_stats as
select
  s.id,
  s.created_at,
  s.updated_at,
  s.referrer,
  s.landing_page,
  s.user_agent,
  count(e.id) filter (where e.event_type = 'page_view')   as page_views,
  count(e.id) filter (where e.event_type = 'click')       as clicks,
  count(e.id) filter (where e.event_type = 'page_leave')  as page_leaves,
  count(e.id) filter (where e.event_type = 'guestbook_submit') as guestbook_submits,
  coalesce(sum((e.metadata->>'duration_ms')::bigint) filter (where e.event_type = 'page_leave'), 0) as total_duration_ms
from public.analytics_sessions s
left join public.analytics_events e on e.session_id = s.id
group by s.id, s.created_at, s.updated_at, s.referrer, s.landing_page, s.user_agent;

comment on view public.analytics_sessions_with_stats is '会话汇总：每会话一行，含 PV/点击/离开次数/留言次数/总停留毫秒';

-- 已登录用户可读（与 analytics_sessions 一致）
grant select on public.analytics_sessions_with_stats to authenticated;

-- 一行一用户：每会话一行，events 列为该会话全部行为的 JSON 数组（按时间序）
create or replace view public.analytics_sessions_one_row as
select
  s.id,
  s.created_at,
  s.updated_at,
  s.referrer,
  s.landing_page,
  s.user_agent,
  (
    select jsonb_agg(
      jsonb_build_object(
        'event_type', e.event_type,
        'page_path', e.page_path,
        'created_at', e.created_at,
        'metadata', coalesce(e.metadata, '{}'::jsonb)
      ) order by e.created_at
    )
    from public.analytics_events e
    where e.session_id = s.id
  ) as events
from public.analytics_sessions s;

comment on view public.analytics_sessions_one_row is '一行一用户：每会话一行，events 为该会话全部行为（page_view/click/page_leave/guestbook_submit）的 JSON 数组';
grant select on public.analytics_sessions_one_row to authenticated;
