-- Wine Database: Datenbank-Struktur für Supabase
-- Jede Zeile gehört genau einem Konto (user_id). Row Level Security sorgt dafür,
-- dass jede Person ausschließlich ihre eigenen Daten sieht und ändert.
-- Kann gefahrlos mehrfach ausgeführt werden.

-- ===== Weingüter (je Konto) – inkl. Kapselfarbe =====
create table if not exists public.producers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  cap_color text,                       -- z. B. #9CCBEA; leer = dunkel
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- ===== Weine (Stammdaten je Konto) =====
create table if not exists public.wines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  producer_id uuid references public.producers(id) on delete set null,
  name text not null,
  grape text,                           -- Rebsorte (bestimmt das Regalfach)
  wine_type text not null default 'Weißwein'
    check (wine_type in ('Weißwein','Rotwein','Rosé','Champagner','Schaumwein','Süßwein')),
  style text,                           -- trocken, feinherb, halbtrocken, fruchtig, süß …
  region text,
  vintage int check (vintage is null or vintage between 1900 and 2100),
  description text,                     -- Beschreibung (z. B. vom Händler übernommen)
  my_note text,                         -- eigene Notiz zum Wein allgemein
  label_path text,                      -- Etikett im Speicher "labels": <user_id>/<datei>
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists wines_user_idx on public.wines(user_id);
create index if not exists wines_producer_idx on public.wines(producer_id);

-- ===== Käufe (Zugang in den Keller) =====
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  wine_id uuid not null references public.wines(id) on delete cascade,
  purchased_on date,
  merchant text,
  qty int not null check (qty > 0),
  price numeric(8,2) check (price is null or price >= 0),   -- je Flasche
  created_at timestamptz not null default now()
);
create index if not exists purchases_wine_idx on public.purchases(wine_id);
create index if not exists purchases_user_idx on public.purchases(user_id);

-- ===== Getrunken (Abgang + Erinnerung) =====
create table if not exists public.drinks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  wine_id uuid not null references public.wines(id) on delete cascade,
  drunk_on date,
  qty int not null default 1 check (qty > 0),
  note text,                            -- eigene Notiz
  buy_again text check (buy_again is null or buy_again in ('ja','nein','evtl')),
  occasion text,                        -- Anlass
  created_at timestamptz not null default now()
);
create index if not exists drinks_wine_idx on public.drinks(wine_id);
create index if not exists drinks_user_idx on public.drinks(user_id, drunk_on);

-- ===== Wunschliste =====
create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  producer text,
  name text not null,
  grape text,
  wine_type text,
  region text,
  vintage int,
  idea_source text,                     -- woher die Idee kommt
  merchant text,
  price numeric(8,2),
  url text,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists wishlist_user_idx on public.wishlist(user_id);

-- ===== updated_at automatisch pflegen =====
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists wines_touch on public.wines;
create trigger wines_touch before update on public.wines
  for each row execute function public.touch_updated_at();

-- ===== Zugriffsregeln: jede Person nur ihre eigenen Zeilen =====
do $$
declare t text;
begin
  foreach t in array array['producers','wines','purchases','drinks','wishlist'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists own_rows on public.%I', t);
    execute format('create policy own_rows on public.%I for all to authenticated
                    using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
  end loop;
end $$;

-- Querverweise nur auf eigene Datensätze zulassen
create or replace function public.check_owner()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_table_name in ('purchases','drinks') then
    if not exists (select 1 from public.wines w where w.id = new.wine_id and w.user_id = new.user_id) then
      raise exception 'Wein gehört nicht zu diesem Konto';
    end if;
  elsif tg_table_name = 'wines' and new.producer_id is not null then
    if not exists (select 1 from public.producers p where p.id = new.producer_id and p.user_id = new.user_id) then
      raise exception 'Weingut gehört nicht zu diesem Konto';
    end if;
  end if;
  return new;
end $$;
revoke execute on function public.check_owner() from public, anon, authenticated;
drop trigger if exists purchases_owner on public.purchases;
create trigger purchases_owner before insert or update on public.purchases for each row execute function public.check_owner();
drop trigger if exists drinks_owner on public.drinks;
create trigger drinks_owner before insert or update on public.drinks for each row execute function public.check_owner();
drop trigger if exists wines_owner on public.wines;
create trigger wines_owner before insert or update on public.wines for each row execute function public.check_owner();

-- ===== Etiketten-Speicher (privat, je Konto ein Ordner) =====
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('labels', 'labels', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists labels_own_select on storage.objects;
create policy labels_own_select on storage.objects for select to authenticated
  using (bucket_id = 'labels' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists labels_own_insert on storage.objects;
create policy labels_own_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'labels' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists labels_own_update on storage.objects;
create policy labels_own_update on storage.objects for update to authenticated
  using (bucket_id = 'labels' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists labels_own_delete on storage.objects;
create policy labels_own_delete on storage.objects for delete to authenticated
  using (bucket_id = 'labels' and (storage.foldername(name))[1] = (select auth.uid())::text);
