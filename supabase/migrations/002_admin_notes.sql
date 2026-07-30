-- Run this once in Supabase SQL Editor to enable custom delivery-timeline notes
create policy "status_history: admin can insert notes" on public.status_history
  for insert with check (public.is_admin());
