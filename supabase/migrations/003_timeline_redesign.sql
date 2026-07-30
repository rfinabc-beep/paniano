-- Run this once in Supabase SQL Editor to power the new tracking timeline design
-- (adds default notes on status change + logs rider assignment automatically)

create or replace function public.log_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.status_history (parcel_id, status, note)
    values (new.id, new.status, 'Order placed.');
  elsif new.status is distinct from old.status then
    insert into public.status_history (parcel_id, status, note)
    values (
      new.id,
      new.status,
      case new.status
        when 'picked_up' then 'Parcel picked up by rider.'
        when 'in_transit' then 'Parcel is in transit.'
        when 'delivered' then 'Parcel delivered.'
        when 'cancelled' then 'Booking cancelled.'
        else null
      end
    );
  end if;
  return new;
end;
$$;

create or replace function public.log_rider_assignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rider_name text;
begin
  if new.rider_id is not null and new.rider_id is distinct from old.rider_id then
    select full_name into rider_name from public.profiles where id = new.rider_id;
    insert into public.status_history (parcel_id, status, note)
    values (new.id, new.status, 'Assigned to ' || coalesce(rider_name, 'a rider') || ' for pickup.');
  end if;
  return new;
end;
$$;

drop trigger if exists parcels_log_rider_assignment on public.parcels;
create trigger parcels_log_rider_assignment
  after update on public.parcels
  for each row execute function public.log_rider_assignment();
