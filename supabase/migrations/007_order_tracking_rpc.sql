-- Guest order tracking: returns one order as JSON when order_number + email match.
-- Excludes draft rows. Uses SECURITY DEFINER so anon can execute without broad orders SELECT.

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
