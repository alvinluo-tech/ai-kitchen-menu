create extension if not exists "pgcrypto";

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

create index dishes_slug_idx on public.dishes(slug);
create index dishes_available_idx on public.dishes(is_available);
create index dishes_spice_level_idx on public.dishes(spice_level);
create index dishes_cooking_time_idx on public.dishes(cooking_time_minutes);
create index dish_tags_tag_idx on public.dish_tags(tag);
create index ingredients_name_idx on public.ingredients(name);
