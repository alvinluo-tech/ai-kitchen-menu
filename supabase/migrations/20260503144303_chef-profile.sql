-- 扩展 profiles 表，添加厨师资料字段
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS specialties text[],
ADD COLUMN IF NOT EXISTS years_of_cooking int,
ADD COLUMN IF NOT EXISTS show_on_showcase boolean not null default false,
ADD COLUMN IF NOT EXISTS social_link text;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_profiles_showcase ON public.profiles(show_on_showcase) WHERE show_on_showcase = true;
