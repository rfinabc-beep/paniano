-- Run this once in Supabase SQL Editor to add Vehicle Type + multi-stop route

alter table public.parcels
  add column if not exists vehicle_type text not null default 'Bike'
    check (vehicle_type in ('Bike', 'Car', 'Van', 'Truck')),
  add column if not exists stops jsonb not null default '[]'::jsonb;

-- update the public tracking function to also expose vehicle type + stops
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

-- update the guest booking RPC to accept vehicle type + stops
drop function if exists public.book_guest_parcel(text, text, text, text, text, text, text, numeric, numeric);

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
