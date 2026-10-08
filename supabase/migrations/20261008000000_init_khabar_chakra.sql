-- Khabar Chakra (খাবার চক্র) — Initial Database Migration
-- Version: 1.1 · Conforming to BACKEND SCHEMA.md and AGENTS.md v1.1

-- 1. Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";
create extension if not exists "postgis";

-- 2. Enumerations
create type account_type as enum ('member', 'business', 'ngo');
create type diet_type as enum ('veg', 'non_veg', 'egg', 'vegan');
create type storage_method as enum ('room', 'fridge', 'freezer');
create type food_category as enum (
  'packaged', 'vegetables', 'fruits', 'meat_fish_egg',
  'dairy', 'grains_pulses', 'bread_bakery', 'cooked_food',
  'beverages', 'other'
);
create type fssai_status as enum ('verified', 'missing', 'unregulated', 'exempt');
create type fresh_band as enum ('fresh', 'consume_soon', 'expiring', 'expired');
create type item_status as enum ('active', 'closed');
create type item_outcome as enum (
  'consumed', 'cooked', 'shared', 'donated',
  'composted', 'recycled', 'discarded'
);
create type listing_kind as enum ('donate', 'share', 'swap', 'event_surplus');
create type listing_status as enum (
  'draft', 'scheduled', 'active', 'reserved',
  'claimed', 'completed', 'expired', 'cancelled'
);
create type location_visibility as enum ('exact', 'approximate');
create type contact_visibility as enum ('instant', 'on_approval');
create type org_kind as enum ('ngo', 'caterer', 'banquet_hall', 'authority');
create type verification_status as enum (
  'pending_review', 'first_approved', 'active_verified', 'rejected', 'suspended'
);

-- 3. Time Helper Function
create or replace function app_now()
returns timestamptz
language sql
stable
as $$
  select now();
$$;

-- 4. Profiles Table (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  phone text,
  account_type account_type not null default 'member',
  city text default 'Asansol',
  locale text not null default 'en',
  adult_confirmed_at timestamptz,
  is_suspended boolean not null default false,
  created_at timestamptz not null default app_now(),
  updated_at timestamptz not null default app_now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- 5. Admin Users Table (D10: 4 admins, identity only in DB)
create table if not exists public.admin_users (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  granted_at timestamptz not null default app_now(),
  granted_by uuid references public.profiles(id)
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  );
$$;

create policy "Admins can view admin_users"
  on public.admin_users for select
  to authenticated
  using (is_admin());

-- 6. Food Items (Inventory) Table
create table if not exists public.food_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  category food_category not null,
  diet_type diet_type not null,
  quantity_value numeric not null check (quantity_value > 0),
  quantity_unit text not null,
  purchase_date date not null default current_date,
  cooked_at timestamptz,
  expiry_date timestamptz not null,
  storage storage_method not null default 'room',
  fssai_status fssai_status not null default 'exempt',
  fssai_license_no text,
  is_flagged boolean not null default false,
  status item_status not null default 'active',
  outcome item_outcome,
  closed_at timestamptz,
  created_at timestamptz not null default app_now(),
  updated_at timestamptz not null default app_now()
);

alter table public.food_items enable row level security;

create policy "Users can view own food items"
  on public.food_items for select
  to authenticated
  using (auth.uid() = owner_id or is_admin());

create policy "Users can insert own food items"
  on public.food_items for insert
  to authenticated
  with check (auth.uid() = owner_id);

create policy "Users can update own food items"
  on public.food_items for update
  to authenticated
  using (auth.uid() = owner_id);

-- 7. Organizations & Verification Table (D9 & D21)
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  org_type org_kind not null,
  reg_number text not null,
  fssai_license text,
  contact_person text not null,
  contact_phone text not null,
  operating_city text not null default 'Asansol',
  status verification_status not null default 'pending_review',
  first_admin_id uuid references public.profiles(id),
  first_approved_at timestamptz,
  second_admin_id uuid references public.profiles(id),
  second_approved_at timestamptz,
  created_at timestamptz not null default app_now(),
  updated_at timestamptz not null default app_now()
);

alter table public.organizations enable row level security;

create policy "Public can view approved organizations"
  on public.organizations for select
  to authenticated
  using (status = 'active_verified' or auth.uid() = owner_id or is_admin());

create policy "Users can register an organization"
  on public.organizations for insert
  to authenticated
  with check (auth.uid() = owner_id);

create policy "Admins can update organizations"
  on public.organizations for update
  to authenticated
  using (is_admin());

-- 8. Listings Table (D1, D3, D4, D5, D8, D12)
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.profiles(id) on delete cascade,
  org_id uuid references public.organizations(id),
  title text not null,
  description text,
  category food_category not null,
  diet_type diet_type not null,
  kind listing_kind not null default 'donate',
  quantity_value numeric not null check (quantity_value > 0),
  quantity_unit text not null,
  photos text[] not null check (array_length(photos, 1) between 1 and 4), -- D4: 1-4 photos
  address_text text not null,
  city text not null default 'Asansol',
  pin_code text not null default '713301',
  location geography(point, 4326) not null, -- D1: Static pin
  location_privacy location_visibility not null default 'approximate',
  contact_visibility contact_visibility not null default 'instant',
  window_hours numeric not null check (window_hours > 0 and window_hours <= 48), -- D3: Hard 48h ceiling
  starts_at timestamptz not null default app_now(),
  expires_at timestamptz not null,
  pickup_code text not null, -- D5: 6-digit code
  is_emergency boolean not null default false,
  status listing_status not null default 'active',
  claimed_by uuid references public.profiles(id),
  claimed_at timestamptz,
  created_at timestamptz not null default app_now(),
  updated_at timestamptz not null default app_now(),

  -- Decision D8: Raw meat, fish, and eggs can NEVER be listed
  constraint no_raw_meat_sharing check (category != 'meat_fish_egg')
);

alter table public.listings enable row level security;

create policy "Active listings are viewable by all authenticated users"
  on public.listings for select
  to authenticated
  using (true);

create policy "Users can insert own listings"
  on public.listings for insert
  to authenticated
  with check (auth.uid() = donor_id);

create policy "Donors can update own listings"
  on public.listings for update
  to authenticated
  using (auth.uid() = donor_id or is_admin());

-- 9. Contact Reveal Log & RPC (D2 & BACKEND SCHEMA §8.3)
create table if not exists public.contact_reveals (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  revealed_at timestamptz not null default app_now(),
  unique (listing_id, user_id)
);

alter table public.contact_reveals enable row level security;

create policy "Users can view own contact reveals"
  on public.contact_reveals for select
  to authenticated
  using (auth.uid() = user_id or is_admin());

create or replace function public.reveal_contact(p_listing_id uuid)
returns table (donor_name text, donor_phone text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_listing public.listings%rowtype;
  v_donor public.profiles%rowtype;
begin
  -- Validate authenticated user
  if auth.uid() is null then
    raise exception 'Unauthorized: Must be logged in';
  end if;

  select * into v_listing from public.listings where id = p_listing_id;
  if not found then
    raise exception 'Listing not found';
  end if;

  -- Ensure listing is active and within window (D2)
  if v_listing.status != 'active' or app_now() > v_listing.expires_at then
    raise exception 'Listing is no longer active';
  end if;

  -- Log reveal
  insert into public.contact_reveals (listing_id, user_id, revealed_at)
  values (p_listing_id, auth.uid(), app_now())
  on conflict (listing_id, user_id) do nothing;

  select * into v_donor from public.profiles where id = v_listing.donor_id;

  return query
  select v_donor.display_name, coalesce(v_donor.phone, 'Contact via app');
end;
$$;

revoke execute on function public.reveal_contact(uuid) from public, anon;
grant execute on function public.reveal_contact(uuid) to authenticated;

-- 10. Contact Form Inbox (D6: Messages to Admin Inbox)
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  topic text not null,
  message text not null,
  status text not null default 'unread',
  created_at timestamptz not null default app_now()
);

alter table public.contact_messages enable row level security;

create policy "Anyone can insert contact message"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

create policy "Admins can view contact messages"
  on public.contact_messages for select
  to authenticated
  using (is_admin());
