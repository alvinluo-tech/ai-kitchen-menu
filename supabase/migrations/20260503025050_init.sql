-- ============================================
-- AI 私厨电子菜单 - 数据库初始化
-- ============================================

-- 1. 创建扩展
create extension if not exists "pgcrypto";

-- 2. 创建表
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role text not null default 'guest',
  created_at timestamp with time zone not null default now(),
  constraint profiles_role_check check (role in ('chef', 'guest'))
);

create table public.dishes (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text not null,
  story text,
  image_url text,
  cuisine text,
  spice_level int not null default 0,
  difficulty text not null default 'easy',
  cooking_time_minutes int,
  servings int,
  is_available boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint dishes_spice_level_check check (spice_level >= 0 and spice_level <= 5),
  constraint dishes_difficulty_check check (difficulty in ('easy', 'medium', 'hard'))
);

create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text,
  created_at timestamp with time zone not null default now()
);

create table public.dish_ingredients (
  id uuid primary key default gen_random_uuid(),
  dish_id uuid not null references public.dishes(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  amount text,
  is_required boolean not null default true,
  unique (dish_id, ingredient_id)
);

create table public.dish_tags (
  id uuid primary key default gen_random_uuid(),
  dish_id uuid not null references public.dishes(id) on delete cascade,
  tag text not null,
  unique (dish_id, tag)
);

-- 3. 索引
create index dishes_slug_idx on public.dishes(slug);
create index dishes_available_idx on public.dishes(is_available);
create index dishes_spice_level_idx on public.dishes(spice_level);
create index dishes_cooking_time_idx on public.dishes(cooking_time_minutes);
create index dish_tags_tag_idx on public.dish_tags(tag);
create index ingredients_name_idx on public.ingredients(name);

-- 4. 更新时间触发器
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

-- 5. 判断是否为厨师用户
create or replace function public.is_chef()
returns boolean as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'chef'
  );
$$ language sql stable security definer;

-- 6. 新用户 profile 自动创建
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    null,
    'guest'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============================================
-- RLS 权限
-- ============================================

alter table public.profiles enable row level security;
alter table public.dishes enable row level security;
alter table public.ingredients enable row level security;
alter table public.dish_ingredients enable row level security;
alter table public.dish_tags enable row level security;

-- profiles
create policy "Users can read profiles"
on public.profiles for select using (true);

create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- dishes
create policy "Anyone can read available dishes"
on public.dishes for select
using (is_available = true or public.is_chef());

create policy "Chef can insert dishes"
on public.dishes for insert
with check (public.is_chef());

create policy "Chef can update dishes"
on public.dishes for update
using (public.is_chef())
with check (public.is_chef());

create policy "Chef can delete dishes"
on public.dishes for delete
using (public.is_chef());

-- ingredients
create policy "Anyone can read ingredients"
on public.ingredients for select using (true);

create policy "Chef can insert ingredients"
on public.ingredients for insert
with check (public.is_chef());

create policy "Chef can update ingredients"
on public.ingredients for update
using (public.is_chef())
with check (public.is_chef());

create policy "Chef can delete ingredients"
on public.ingredients for delete
using (public.is_chef());

-- dish_ingredients
create policy "Anyone can read dish ingredients"
on public.dish_ingredients for select using (true);

create policy "Chef can insert dish ingredients"
on public.dish_ingredients for insert
with check (public.is_chef());

create policy "Chef can update dish ingredients"
on public.dish_ingredients for update
using (public.is_chef())
with check (public.is_chef());

create policy "Chef can delete dish ingredients"
on public.dish_ingredients for delete
using (public.is_chef());

-- dish_tags
create policy "Anyone can read dish tags"
on public.dish_tags for select using (true);

create policy "Chef can insert dish tags"
on public.dish_tags for insert
with check (public.is_chef());

create policy "Chef can update dish tags"
on public.dish_tags for update
using (public.is_chef())
with check (public.is_chef());

create policy "Chef can delete dish tags"
on public.dish_tags for delete
using (public.is_chef());

-- ============================================
-- Storage Policies
-- ============================================

create policy "Anyone can view dish images"
on storage.objects for select
using (bucket_id = 'dish-images');

create policy "Chef can upload dish images"
on storage.objects for insert
with check (
  bucket_id = 'dish-images'
  and public.is_chef()
);

create policy "Chef can update dish images"
on storage.objects for update
using (
  bucket_id = 'dish-images'
  and public.is_chef()
)
with check (
  bucket_id = 'dish-images'
  and public.is_chef()
);

create policy "Chef can delete dish images"
on storage.objects for delete
using (
  bucket_id = 'dish-images'
  and public.is_chef()
);
