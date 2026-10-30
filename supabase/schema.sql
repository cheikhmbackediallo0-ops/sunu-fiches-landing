-- SUÑU FICHES : tables de la base Supabase.
-- Peut être relancé sans risque (create ... if not exists / or replace).

-- ---------- Profils des enseignants ----------
-- Une ligne par compte, créée automatiquement à l'inscription.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  prenom text not null default '',
  nom text not null default '',
  telephone text,
  ecole text,
  ief text,
  plan text not null default 'essai' check (plan in ('essai', 'mensuel', 'annuel')),
  plan_expire_le timestamptz,
  est_admin boolean not null default false,
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

-- ---------- Fiches pédagogiques enregistrées ----------
create table if not exists public.fiches (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  titre text,
  cycle text,
  niveau text,
  params jsonb not null default '{}'::jsonb,
  html text,
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists fiches_user_date_idx on public.fiches (user_id, modifie_le desc);

-- ---------- Demandes d'abonnement (Wave / Orange Money / Free Money) ----------
create table if not exists public.demandes_abonnement (
  id bigint generated always as identity primary key,
  reference text not null unique,
  user_id uuid references auth.users (id) on delete set null default auth.uid(),
  nom text not null,
  telephone text not null,
  ecole text,
  ief text,
  formule text not null check (formule in ('monthly', 'yearly')),
  moyen_paiement text not null check (moyen_paiement in ('wave', 'om', 'free')),
  statut text not null default 'en_attente' check (statut in ('en_attente', 'validee', 'refusee')),
  cree_le timestamptz not null default now(),
  traite_le timestamptz
);
create index if not exists demandes_statut_idx on public.demandes_abonnement (statut, cree_le desc);

-- ---------- Mise à jour automatique de « modifie_le » ----------
create or replace function public.touch_modifie_le() returns trigger
language plpgsql as $$
begin
  new.modifie_le := now();
  return new;
end $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_modifie_le();
drop trigger if exists fiches_touch on public.fiches;
create trigger fiches_touch before update on public.fiches
  for each row execute function public.touch_modifie_le();

-- ---------- Profil créé à l'inscription ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, prenom, nom)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'prenom', ''),
    coalesce(new.raw_user_meta_data ->> 'nom', '')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Un enseignant ne peut pas changer lui-même son abonnement ni se rendre admin.
create or replace function public.protect_profile_fields() returns trigger
language plpgsql as $$
begin
  if auth.role() = 'authenticated' and not public.is_admin() then
    new.plan := old.plan;
    new.plan_expire_le := old.plan_expire_le;
    new.est_admin := old.est_admin;
    new.email := old.email;
  end if;
  return new;
end $$;

-- ---------- Administrateur ----------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select est_admin from public.profiles where id = auth.uid()), false);
$$;

drop trigger if exists profiles_protect on public.profiles;
create trigger profiles_protect before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- ---------- Sécurité : chacun ne voit que ses propres données ----------
alter table public.profiles enable row level security;
alter table public.fiches enable row level security;
alter table public.demandes_abonnement enable row level security;

drop policy if exists "profil: lecture" on public.profiles;
create policy "profil: lecture" on public.profiles for select
  using (id = auth.uid() or public.is_admin());
drop policy if exists "profil: modification" on public.profiles;
create policy "profil: modification" on public.profiles for update
  using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

drop policy if exists "fiches: lecture" on public.fiches;
create policy "fiches: lecture" on public.fiches for select using (user_id = auth.uid());
drop policy if exists "fiches: ajout" on public.fiches;
create policy "fiches: ajout" on public.fiches for insert with check (user_id = auth.uid());
drop policy if exists "fiches: modification" on public.fiches;
create policy "fiches: modification" on public.fiches for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "fiches: suppression" on public.fiches;
create policy "fiches: suppression" on public.fiches for delete using (user_id = auth.uid());

drop policy if exists "demandes: ajout" on public.demandes_abonnement;
create policy "demandes: ajout" on public.demandes_abonnement for insert to authenticated
  with check (user_id = auth.uid() and statut = 'en_attente');
drop policy if exists "demandes: lecture" on public.demandes_abonnement;
create policy "demandes: lecture" on public.demandes_abonnement for select
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists "demandes: traitement admin" on public.demandes_abonnement;
create policy "demandes: traitement admin" on public.demandes_abonnement for update
  using (public.is_admin()) with check (public.is_admin());

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.fiches to authenticated;
grant select, insert, update on public.demandes_abonnement to authenticated;
