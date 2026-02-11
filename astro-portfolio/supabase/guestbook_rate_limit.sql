-- 留言板防刷：同一 session_id 在 60 秒内只能插入一条
-- 在 Supabase Dashboard → SQL Editor 中执行（依赖 guestbook 表已有 session_id 列，见 analytics.sql）

create or replace function public.guestbook_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count int;
begin
  if NEW.session_id is not null then
    select count(*) into recent_count
    from public.guestbook_messages
    where session_id = NEW.session_id
      and created_at > (now() - interval '60 seconds');
    if recent_count > 0 then
      raise exception 'RATE_LIMIT: at most one message per session per 60 seconds'
        using errcode = 'P0001';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists guestbook_rate_limit_trigger on public.guestbook_messages;
create trigger guestbook_rate_limit_trigger
  before insert on public.guestbook_messages
  for each row
  execute function public.guestbook_rate_limit();

comment on function public.guestbook_rate_limit() is '留言防刷：同一 session 60 秒内仅允许一条';
