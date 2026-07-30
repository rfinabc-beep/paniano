-- Run this once in Supabase SQL Editor to make statuses admin-manageable

create table if not exists public.statuses (
  key text primary key,
  label text not null,
  sort_order integer not null default 0,
  in_stepper boolean not null default true,
  is_exception boolean not null default false,
  default_note text,
  created_at timestamptz not null default now()
);

alter table public.statuses enable row level security;

create policy "statuses: anyone can view" on public.statuses
  for select using (true);

create policy "statuses: admin can manage" on public.statuses
  for all using (public.is_admin()) with check (public.is_admin());

insert into public.statuses (key, label, sort_order, in_stepper, is_exception, default_note) values
  ('pending', 'Booked', 1, true, false, 'Order placed.'),
  ('picked_up', 'Picked up', 2, true, false, 'Parcel picked up by rider.'),
  ('in_transit', 'In transit', 3, true, false, 'Parcel is in transit.'),
  ('delivered', 'Delivered', 4, true, false, 'Parcel delivered.'),
  ('cancelled', 'Cancelled', 5, false, true, 'Booking cancelled.')
on conflict (key) do nothing;

-- remove the old fixed enum check, replace with a foreign key to the new table
alter table public.parcels drop constraint if exists parcels_status_check;
alter table public.parcels drop constraint if exists parcels_status_fkey;
alter table public.parcels
  add constraint parcels_status_fkey foreign key (status) references public.statuses (key);

-- update status-change logging to pull the note/label from the statuses table
create or replace function public.log_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_note text;
  v_label text;
begin
  if tg_op = 'INSERT' then
    select default_note, label into v_note, v_label from public.statuses where key = new.status;
    insert into public.status_history (parcel_id, status, note)
    values (new.id, new.status, coalesce(v_note, 'Order placed.'));
  elsif new.status is distinct from old.status then
    select default_note, label into v_note, v_label from public.statuses where key = new.status;
    insert into public.status_history (parcel_id, status, note)
    values (new.id, new.status, coalesce(v_note, 'Status changed to ' || coalesce(v_label, new.status) || '.'));
  end if;
  return new;
end;
$$;
