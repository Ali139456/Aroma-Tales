-- Orders + collection merchandising fields

alter table collections add column if not exists description text default '';
alter table collections add column if not exists tile_label text;
alter table collections add column if not exists browse_products_url text;
alter table collections add column if not exists sort_order integer not null default 0;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  status text not null default 'pending'
    check (status in ('draft','pending','confirmed','cancelled')),
  fulfillment_status text not null default 'unfulfilled'
    check (fulfillment_status in ('unfulfilled','fulfilled','partial')),
  delivery_status text not null default 'pending'
    check (delivery_status in ('pending','processing','shipped','delivered','cancelled')),
  delivery_method text not null default 'standard',
  payment_method text not null default 'cod',
  email text not null default '',
  first_name text not null default '',
  last_name text not null default '',
  phone text not null default '',
  address_line text not null default '',
  city text not null default '',
  postal_code text not null default '',
  line_items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  shipping_total numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency text not null default 'PKR',
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_email_idx on orders (email);

alter table orders enable row level security;

drop policy if exists "orders_select_authenticated" on orders;
create policy "orders_select_authenticated"
  on orders for select to authenticated using (true);

drop policy if exists "orders_update_authenticated" on orders;
create policy "orders_update_authenticated"
  on orders for update to authenticated using (true) with check (true);

drop policy if exists "orders_delete_authenticated" on orders;
create policy "orders_delete_authenticated"
  on orders for delete to authenticated using (true);

drop policy if exists "orders_insert_anon_checkout" on orders;
create policy "orders_insert_anon_checkout"
  on orders for insert to anon
  with check (status = 'pending' and fulfillment_status = 'unfulfilled');

drop policy if exists "orders_insert_auth_checkout_or_draft" on orders;
create policy "orders_insert_auth_checkout_or_draft"
  on orders for insert to authenticated
  with check (
    (status = 'pending' and fulfillment_status = 'unfulfilled')
    or status = 'draft'
  );
