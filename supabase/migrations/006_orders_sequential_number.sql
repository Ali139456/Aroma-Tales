-- Sequential display order numbers (001, 002, …) assigned on insert.
-- Replaces any legacy client-generated AT-* values for existing rows.

create sequence if not exists orders_display_seq;

-- Stable numbering by creation time (then id).
with ranked as (
  select id, row_number() over (order by created_at asc, id asc) as rn
  from orders
)
update orders o
set order_number = lpad(ranked.rn::text, 3, '0')
from ranked
where o.id = ranked.id;

select setval(
  'orders_display_seq',
  coalesce(
    (select max(order_number::bigint) from orders where order_number ~ '^[0-9]+$'),
    0
  )
);

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
