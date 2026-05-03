create policy "Anyone can view dish images"
on storage.objects
for select
using (bucket_id = 'dish-images');

create policy "Chef can upload dish images"
on storage.objects
for insert
with check (
  bucket_id = 'dish-images'
  and public.is_chef()
);

create policy "Chef can update dish images"
on storage.objects
for update
using (
  bucket_id = 'dish-images'
  and public.is_chef()
)
with check (
  bucket_id = 'dish-images'
  and public.is_chef()
);

create policy "Chef can delete dish images"
on storage.objects
for delete
using (
  bucket_id = 'dish-images'
  and public.is_chef()
);
