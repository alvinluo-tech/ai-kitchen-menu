-- Add status column to dishes table for draft/published workflow
-- 'draft': only visible to the chef who created it
-- 'published': visible to everyone (controlled by is_available as before)

alter table public.dishes
add column status text not null default 'published';

alter table public.dishes
add constraint dishes_status_check check (status in ('draft', 'published'));

create index dishes_status_idx on public.dishes(status);

-- Update RLS: allow chefs to see their own drafts, everyone sees published (is_available)
drop policy if exists "Anyone can read available dishes" on public.dishes;

create policy "Anyone can read published available dishes"
on public.dishes
for select
using (
  (status = 'published' and is_available = true)
  or public.is_chef()
);

-- Add a function to publish a draft (set status to published)
create or replace function public.publish_dish(dish_id uuid)
returns void as $$
begin
  update public.dishes
  set status = 'published'
  where id = dish_id
    and created_by = auth.uid()
    and status = 'draft';
end;
$$ language plpgsql security definer;

-- Add a function to unpublish a dish back to draft
create or replace function public.unpublish_dish(dish_id uuid)
returns void as $$
begin
  update public.dishes
  set status = 'draft'
  where id = dish_id
    and created_by = auth.uid()
    and status = 'published';
end;
$$ language plpgsql security definer;
