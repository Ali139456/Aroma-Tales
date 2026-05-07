-- Draft vs published + inventory columns for existing projects

alter table products add column if not exists status text not null default 'published';
alter table products add column if not exists stock_quantity integer;
alter table products add column if not exists low_stock_threshold integer not null default 5;

do $$
begin
  alter table products add constraint products_status_check check (status in ('draft','published'));
exception
  when duplicate_object then null;
end $$;
