-- Public bucket + policies for CRM product image uploads (run once).

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
