-- Run this once in Supabase SQL Editor to allow bookings without an account

alter table public.parcels alter column customer_id drop not null;

create policy "parcels: guest can insert" on public.parcels
  for insert with check (customer_id is null);
