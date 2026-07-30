-- Run this once in Supabase SQL Editor to show receiver details on the tracking page

drop function if exists public.track_parcel(text);

create or replace function public.track_parcel(p_tracking_id text)
returns table (
  tracking_id text,
  status text,
  parcel_type text,
  pickup_address text,
  delivery_address text,
  vehicle_type text,
  stops jsonb,
  receiver_name text,
  receiver_phone text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select tracking_id, status, parcel_type, pickup_address, delivery_address,
         vehicle_type, stops, receiver_name, receiver_phone, created_at, updated_at
  from public.parcels
  where tracking_id = p_tracking_id;
$$;

grant execute on function public.track_parcel(text) to anon, authenticated;
