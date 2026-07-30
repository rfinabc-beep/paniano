-- Run this once in Supabase SQL Editor to fix guest booking

create or replace function public.book_guest_parcel(
  p_sender_name text,
  p_sender_phone text,
  p_pickup_address text,
  p_receiver_name text,
  p_receiver_phone text,
  p_delivery_address text,
  p_parcel_type text,
  p_weight_kg numeric,
  p_price numeric
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
    parcel_type, weight_kg, price
  )
  values (
    null, p_sender_name, p_sender_phone, p_pickup_address,
    p_receiver_name, p_receiver_phone, p_delivery_address,
    p_parcel_type, p_weight_kg, p_price
  )
  returning tracking_id into new_tracking_id;

  return new_tracking_id;
end;
$$;

grant execute on function public.book_guest_parcel(text, text, text, text, text, text, text, numeric, numeric)
  to anon, authenticated;
