-- 若已执行过 guestbook.sql，只需在 SQL Editor 中执行本文件，为后台 /manage 开放已登录用户的查询与删除

create policy "auth_select_guestbook"
  on public.guestbook_messages
  for select
  to authenticated
  using (true);

create policy "auth_delete_guestbook"
  on public.guestbook_messages
  for delete
  to authenticated
  using (true);
