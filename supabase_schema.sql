create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  can_view_catalog boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.car_catalog (
  id integer primary key,
  name text not null,
  price text,
  zero100 text,
  zero200 text,
  zero300 text,
  zeroMax text,
  topSpeed text,
  lap text,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, can_view_catalog)
  values (
    new.id,
    lower(new.email),
    case when lower(new.email) = 'hfdfdfgdgdgde123@gmail.com' then 'admin' else 'user' end,
    case when lower(new.email) = 'hfdfdfgdgdgde123@gmail.com' then true else false end
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.has_catalog_access()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and (role = 'admin' or can_view_catalog = true)
  );
$$;

alter table public.profiles enable row level security;
alter table public.car_catalog enable row level security;

drop policy if exists "profiles_self_or_admin_read" on public.profiles;
create policy "profiles_self_or_admin_read"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "admin_manage_profiles" on public.profiles;
create policy "admin_manage_profiles"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "catalog_access_read" on public.car_catalog;
create policy "catalog_access_read"
  on public.car_catalog for select
  using (is_published = true and public.has_catalog_access());

drop policy if exists "admin_manage_catalog" on public.car_catalog;
create policy "admin_manage_catalog"
  on public.car_catalog for all
  using (public.is_admin())
  with check (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.car_catalog to authenticated;
grant select, update on public.profiles to authenticated;