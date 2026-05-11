-- Run in Supabase SQL Editor (Dashboard → SQL → New query).
-- Creates collections + products with RLS: public read, authenticated write.

create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  description text default '',
  tile_label text,
  browse_products_url text,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text default '',
  images jsonb not null default '[]'::jsonb,
  variants jsonb not null default '[{"label":"30ml"},{"label":"50ml"}]'::jsonb,
  price numeric(12,2) not null,
  sale_price numeric(12,2),
  price_30ml numeric(12,2) not null,
  category text not null default 'Unisex',
  collection_id uuid references collections(id) on delete set null,
  is_best_seller boolean not null default false,
  notes jsonb not null default '{"top":"","heart":"","base":""}'::jsonb,
  specs jsonb not null default '{}'::jsonb,
  ingredients jsonb not null default '[]'::jsonb,
  status text not null default 'published' check (status in ('draft','published')),
  stock_quantity integer,
  low_stock_threshold integer not null default 5,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists products_collection_id_idx on products(collection_id);

alter table collections enable row level security;
alter table products enable row level security;

drop policy if exists "collections_select_public" on collections;
create policy "collections_select_public"
  on collections for select using (true);

drop policy if exists "collections_write_authenticated" on collections;
create policy "collections_write_authenticated"
  on collections for all to authenticated using (true) with check (true);

drop policy if exists "products_select_public" on products;
create policy "products_select_public"
  on products for select using (true);

drop policy if exists "products_write_authenticated" on products;
create policy "products_write_authenticated"
  on products for all to authenticated using (true) with check (true);

-- ----------------------------------------------------------------------------
-- Orders (checkout + CRM). Guest checkout inserts pending rows; admin manages all.
-- ----------------------------------------------------------------------------
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

-- Sequential display order numbers (001, 002, …). Matches migration 006_orders_sequential_number.sql.
create sequence if not exists orders_display_seq;

create or replace function public.orders_assign_display_number()
returns trigger
language plpgsql
as $$
begin
  new.order_number := lpad(nextval('orders_display_seq')::text, 3, '0');
  return new;
end;
$$;

drop trigger if exists orders_assign_display_number on orders;
create trigger orders_assign_display_number
  before insert on orders
  for each row
  execute function public.orders_assign_display_number();

select setval(
  'orders_display_seq',
  coalesce(
    (select max(order_number::bigint) from orders where order_number ~ '^[0-9]+$'),
    0
  )
);

-- Starter collections (safe to re-run)
insert into collections (name, slug)
values
  ('Mens', 'mens'),
  ('Womens', 'womens'),
  ('Unisex', 'unisex'),
  ('Featured', 'featured')
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Existing databases: run once if products already existed without these columns
-- ----------------------------------------------------------------------------
alter table products add column if not exists status text not null default 'published';
alter table products add column if not exists stock_quantity integer;
alter table products add column if not exists low_stock_threshold integer not null default 5;

do $$
begin
  alter table products add constraint products_status_check check (status in ('draft','published'));
exception
  when duplicate_object then null;
end $$;

alter table collections add column if not exists image_url text;
alter table collections add column if not exists description text default '';
alter table collections add column if not exists tile_label text;
alter table collections add column if not exists browse_products_url text;
alter table collections add column if not exists sort_order integer not null default 0;

-- ----------------------------------------------------------------------------
-- Storage: collection cover images (Dashboard → Storage → create bucket, or run below)
-- Bucket must exist before uploads from the CRM will succeed.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('collection-covers', 'collection-covers', true)
on conflict (id) do nothing;

drop policy if exists "collection_covers_select_public" on storage.objects;
create policy "collection_covers_select_public"
  on storage.objects for select using (bucket_id = 'collection-covers');

drop policy if exists "collection_covers_insert_authenticated" on storage.objects;
create policy "collection_covers_insert_authenticated"
  on storage.objects for insert to authenticated with check (bucket_id = 'collection-covers');

drop policy if exists "collection_covers_update_authenticated" on storage.objects;
create policy "collection_covers_update_authenticated"
  on storage.objects for update to authenticated using (bucket_id = 'collection-covers') with check (bucket_id = 'collection-covers');

drop policy if exists "collection_covers_delete_authenticated" on storage.objects;
create policy "collection_covers_delete_authenticated"
  on storage.objects for delete to authenticated using (bucket_id = 'collection-covers');

-- Product gallery images (CRM uploads)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_select_public" on storage.objects;
create policy "product_images_select_public"
  on storage.objects for select using (bucket_id = 'product-images');

drop policy if exists "product_images_insert_authenticated" on storage.objects;
create policy "product_images_insert_authenticated"
  on storage.objects for insert to authenticated with check (bucket_id = 'product-images');

drop policy if exists "product_images_update_authenticated" on storage.objects;
create policy "product_images_update_authenticated"
  on storage.objects for update to authenticated using (bucket_id = 'product-images') with check (bucket_id = 'product-images');

drop policy if exists "product_images_delete_authenticated" on storage.objects;
create policy "product_images_delete_authenticated"
  on storage.objects for delete to authenticated using (bucket_id = 'product-images');

-- ----------------------------------------------------------------------------
-- Order tracking (guest RPC — same as migrations/007_order_tracking_rpc.sql)
-- ----------------------------------------------------------------------------
create or replace function public.get_order_for_tracking(p_order_number text, p_email text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r orders%rowtype;
  norm_num text;
  norm_email text;
begin
  norm_email := lower(trim(coalesce(p_email, '')));
  if norm_email = '' then
    return null;
  end if;

  norm_num := trim(replace(coalesce(p_order_number, ''), '#', ''));
  norm_num := regexp_replace(norm_num, '\s+', '', 'g');
  if norm_num = '' then
    return null;
  end if;

  if norm_num ~ '^[0-9]+$' then
    begin
      norm_num := lpad((norm_num::bigint)::text, 3, '0');
    exception
      when others then
        null;
    end;
  end if;

  select *
  into r
  from orders o
  where o.order_number = norm_num
    and lower(trim(o.email)) = norm_email
    and o.status is distinct from 'draft'
  limit 1;

  if not found then
    return null;
  end if;

  return json_build_object(
    'id', r.id,
    'order_number', r.order_number,
    'status', r.status,
    'fulfillment_status', r.fulfillment_status,
    'delivery_status', r.delivery_status,
    'delivery_method', r.delivery_method,
    'payment_method', r.payment_method,
    'line_items', r.line_items,
    'subtotal', r.subtotal,
    'shipping_total', r.shipping_total,
    'total', r.total,
    'currency', r.currency,
    'created_at', r.created_at,
    'updated_at', r.updated_at,
    'first_name', r.first_name,
    'last_name', r.last_name,
    'email', r.email,
    'phone', r.phone,
    'address_line', r.address_line,
    'city', r.city,
    'postal_code', r.postal_code
  );
end;
$$;

comment on function public.get_order_for_tracking(text, text) is
  'Returns order JSON when order_number and email match (guest-safe); null otherwise.';

revoke all on function public.get_order_for_tracking(text, text) from public;
grant execute on function public.get_order_for_tracking(text, text) to anon, authenticated;
