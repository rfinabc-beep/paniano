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

-- ---------- statuses (admin-manageable) ----------
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

-- ---------- parcels ----------
create table if not exists public.parcels (
  id uuid primary key default gen_random_uuid(),
  tracking_id text unique not null default '',
  customer_id uuid references public.profiles (id) on delete cascade,
  sender_name text not null,
  sender_phone text not null,
  pickup_address text not null,
  receiver_name text not null,
  receiver_phone text not null,
  delivery_address text not null,
  parcel_type text not null default 'Document',
  weight_kg numeric,
  price numeric not null default 0,
  status text not null default 'pending' references public.statuses (key),
  vehicle_type text not null default 'Bike'
    check (vehicle_type in ('Bike', 'Car', 'Van', 'Truck')),
  stops jsonb not null default '[]'::jsonb,
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

create policy "parcels: guest can insert" on public.parcels
  for insert with check (customer_id is null);

-- secure RPC for guest (no-account) bookings, avoids RLS read-back issues
create or replace function public.book_guest_parcel(
  p_sender_name text,
  p_sender_phone text,
  p_pickup_address text,
  p_receiver_name text,
  p_receiver_phone text,
  p_delivery_address text,
  p_parcel_type text,
  p_weight_kg numeric,
  p_price numeric,
  p_vehicle_type text default 'Bike',
  p_stops jsonb default '[]'::jsonb
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_tracking_id text;
begin
  insert into public.parcels (
    customer_id, sender_name, sender_phone, pickup_address,
    receiver_name, receiver_phone, delivery_address,
    parcel_type, weight_kg, price, vehicle_type, stops
  )
  values (
    null, p_sender_name, p_sender_phone, p_pickup_address,
    p_receiver_name, p_receiver_phone, p_delivery_address,
    p_parcel_type, p_weight_kg, p_price, p_vehicle_type, p_stops
  )
  returning tracking_id into new_tracking_id;

  return new_tracking_id;
end;
$$;

grant execute on function public.book_guest_parcel(
  text, text, text, text, text, text, text, numeric, numeric, text, jsonb
) to anon, authenticated;

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

-- automatically log every status change with a default note (from statuses table)
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
  vehicle_type text,
  stops jsonb,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select tracking_id, status, parcel_type, pickup_address, delivery_address,
         vehicle_type, stops, created_at, updated_at
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
