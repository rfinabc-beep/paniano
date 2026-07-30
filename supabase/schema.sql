-- ============================================================
-- পথ কুরিয়ার — Supabase schema
-- Run this once in Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'rider', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- helper function to check admin role without triggering RLS recursion
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create policy "profiles: user can view own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "profiles: user can update own" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

create policy "profiles: user can insert own" on public.profiles
  for insert with check (auth.uid() = id);

-- auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    'customer'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- parcels ----------
create table if not exists public.parcels (
  id uuid primary key default gen_random_uuid(),
  tracking_id text unique not null default '',
  customer_id uuid not null references public.profiles (id) on delete cascade,
  sender_name text not null,
  sender_phone text not null,
  pickup_address text not null,
  receiver_name text not null,
  receiver_phone text not null,
  delivery_address text not null,
  parcel_type text not null default 'Document',
  weight_kg numeric,
  price numeric not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'picked_up', 'in_transit', 'delivered', 'cancelled')),
  rider_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.parcels enable row level security;

-- generate a short readable tracking id like PT7F3K9QAB
create or replace function public.generate_tracking_id()
returns trigger
language plpgsql
as $$
begin
  if new.tracking_id is null or new.tracking_id = '' then
    new.tracking_id := 'PT' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
  end if;
  return new;
end;
$$;

drop trigger if exists set_tracking_id on public.parcels;
create trigger set_tracking_id
  before insert on public.parcels
  for each row execute function public.generate_tracking_id();

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists parcels_touch_updated_at on public.parcels;
create trigger parcels_touch_updated_at
  before update on public.parcels
  for each row execute function public.touch_updated_at();

create policy "parcels: customer can view own" on public.parcels
  for select using (
    auth.uid() = customer_id
    or auth.uid() = rider_id
    or public.is_admin()
  );

create policy "parcels: customer can insert own" on public.parcels
  for insert with check (auth.uid() = customer_id);

create policy "parcels: rider/admin can update" on public.parcels
  for update using (
    auth.uid() = rider_id
    or public.is_admin()
  );

-- ---------- status_history ----------
create table if not exists public.status_history (
  id uuid primary key default gen_random_uuid(),
  parcel_id uuid not null references public.parcels (id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.status_history enable row level security;

create policy "status_history: related users can view" on public.status_history
  for select using (
    exists (
      select 1 from public.parcels p
      where p.id = status_history.parcel_id
        and (p.customer_id = auth.uid() or p.rider_id = auth.uid() or public.is_admin())
    )
  );

-- automatically log every status change with a default note
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

drop trigger if exists parcels_log_status_insert on public.parcels;
create trigger parcels_log_status_insert
  after insert on public.parcels
  for each row execute function public.log_status_change();

drop trigger if exists parcels_log_status_update on public.parcels;
create trigger parcels_log_status_update
  after update on public.parcels
  for each row execute function public.log_status_change();

-- automatically log rider assignment
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

-- ---------- public tracking (no login required) ----------
create or replace function public.track_parcel(p_tracking_id text)
returns table (
  tracking_id text,
  status text,
  parcel_type text,
  pickup_address text,
  delivery_address text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select tracking_id, status, parcel_type, pickup_address, delivery_address, created_at, updated_at
  from public.parcels
  where tracking_id = p_tracking_id;
$$;

create or replace function public.track_parcel_history(p_tracking_id text)
returns table (
  id uuid,
  parcel_id uuid,
  status text,
  note text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select h.id, h.parcel_id, h.status, h.note, h.created_at
  from public.status_history h
  join public.parcels p on p.id = h.parcel_id
  where p.tracking_id = p_tracking_id
  order by h.created_at asc;
$$;

grant execute on function public.track_parcel(text) to anon, authenticated;
grant execute on function public.track_parcel_history(text) to anon, authenticated;

-- ---------- promote a user to rider or admin (run manually as needed) ----------
-- update public.profiles set role = 'rider' where id = '<user-uuid>';
-- update public.profiles set role = 'admin' where id = '<user-uuid>';

-- ---------- allow admins to add custom timeline notes ----------
create policy "status_history: admin can insert notes" on public.status_history
  for insert with check (public.is_admin());
