-- ============================================================
-- Klantenkaart: contactgeschiedenis en bestelgeschiedenis
-- Run dit in de SQL Editor, net als de vorige bestanden
-- ============================================================

create table if not exists customer_contacts (
  contact_id bigint generated always as identity primary key,
  customer_id uuid not null references customers(id) on delete cascade,
  datum date not null default current_date,
  soort text check (soort in ('telefoon','bezoek','e-mail','overig')) default 'telefoon',
  besproken text,
  te_bespreken text,
  door text,
  created_at timestamptz default now()
);

create table if not exists orders (
  order_id bigint generated always as identity primary key,
  customer_id uuid not null references customers(id) on delete cascade,
  datum date not null default current_date,
  artikel text,
  hoeveelheid text,
  opmerking text,
  door text,
  created_at timestamptz default now()
);

alter table customer_contacts enable row level security;
alter table orders enable row level security;

-- Zelfde toegangspatroon als de master customers-tabel:
-- admin en sales (Kasia) mogen lezen en schrijven, field (Normen) heeft geen toegang.

drop policy if exists "contacts admin sales" on customer_contacts;
create policy "contacts admin sales" on customer_contacts for all
  using (get_my_role() in ('admin','sales'))
  with check (get_my_role() in ('admin','sales'));

drop policy if exists "orders admin sales" on orders;
create policy "orders admin sales" on orders for all
  using (get_my_role() in ('admin','sales'))
  with check (get_my_role() in ('admin','sales'));
