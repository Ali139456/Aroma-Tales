-- Public bucket + policies for CRM collection cover uploads (run once).
-- Create bucket in Dashboard → Storage if insert fails.

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
