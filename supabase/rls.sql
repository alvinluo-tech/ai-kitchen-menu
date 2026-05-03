create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_dishes_updated_at
before update on public.dishes
for each row
execute function public.set_updated_at();

create or replace function public.is_chef()
returns boolean as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'chef'
  );
$$ language sql stable security definer;

alter table public.profiles enable row level security;
alter table public.dishes enable row level security;
alter table public.ingredients enable row level security;
alter table public.dish_ingredients enable row level security;
alter table public.dish_tags enable row level security;

create policy "Users can read profiles"
on public.profiles
for select
using (true);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Anyone can read available dishes"
on public.dishes
for select
using (is_available = true or public.is_chef());

create policy "Chef can insert dishes"
on public.dishes
for insert
with check (public.is_chef());

create policy "Chef can update dishes"
on public.dishes
for update
using (public.is_chef())
with check (public.is_chef());

create policy "Chef can delete dishes"
on public.dishes
for delete
using (public.is_chef());

create policy "Anyone can read ingredients"
on public.ingredients
for select
using (true);

create policy "Chef can insert ingredients"
on public.ingredients
for insert
with check (public.is_chef());

create policy "Chef can update ingredients"
on public.ingredients
for update
using (public.is_chef())
with check (public.is_chef());

create policy "Chef can delete ingredients"
on public.ingredients
for delete
using (public.is_chef());

create policy "Anyone can read dish ingredients"
on public.dish_ingredients
for select
using (true);

create policy "Chef can insert dish ingredients"
on public.dish_ingredients
for insert
with check (public.is_chef());

create policy "Chef can update dish ingredients"
on public.dish_ingredients
for update
using (public.is_chef())
with check (public.is_chef());

create policy "Chef can delete dish ingredients"
on public.dish_ingredients
for delete
using (public.is_chef());

create policy "Anyone can read dish tags"
on public.dish_tags
for select
using (true);

create policy "Chef can insert dish tags"
on public.dish_tags
for insert
with check (public.is_chef());

create policy "Chef can update dish tags"
on public.dish_tags
for update
using (public.is_chef())
with check (public.is_chef());

create policy "Chef can delete dish tags"
on public.dish_tags
for delete
using (public.is_chef());
