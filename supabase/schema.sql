-- Ejecuta este archivo en Supabase: SQL Editor > New query.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'client' check (role in ('admin', 'client')),
  created_at timestamptz not null default now()
);

create table if not exists public.app_data (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  data jsonb not null default '{"people":[],"debts":[],"settings":{"activeUserId":null}}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.app_data enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;

create or replace function public.create_profile()
returns trigger language plpgsql security definer set search_path = public
as $$ begin insert into public.profiles (id, email) values (new.id, new.email); return new; end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.create_profile();

create policy "profile own or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "data own or admin read" on public.app_data for select using (user_id = auth.uid() or public.is_admin());
create policy "client writes own data" on public.app_data for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.set_user_role(target_user_id uuid, new_role text)
returns void language plpgsql security definer set search_path = public
as $$ begin
  if not public.is_admin() then raise exception 'No autorizado'; end if;
  if new_role not in ('admin', 'client') then raise exception 'Rol inválido'; end if;
  update public.profiles set role = new_role where id = target_user_id;
end; $$;

revoke all on function public.set_user_role(uuid, text) from public;
grant execute on function public.set_user_role(uuid, text) to authenticated;

-- Después de crear tu primera cuenta, ejecútalo una sola vez para hacerla administradora:
-- update public.profiles set role = 'admin' where email = 'tu-correo@ejemplo.com';
