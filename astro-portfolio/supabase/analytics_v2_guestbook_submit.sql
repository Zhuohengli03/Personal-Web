-- 扩展事件类型：增加 guestbook_submit（用户提交留言时上报，便于单用户行为时间线完整）
-- 在 Supabase Dashboard → SQL Editor 中执行

alter table public.analytics_events
  drop constraint if exists analytics_events_event_type_check;

alter table public.analytics_events
  add constraint analytics_events_event_type_check
  check (event_type in ('page_view', 'click', 'page_leave', 'guestbook_submit'));

comment on column public.analytics_events.metadata is 'page_leave: duration_ms; click: target, link_to_guestbook; guestbook_submit: 可选';
