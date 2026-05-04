-- 扩展 profiles 表，添加厨师声音设置字段
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS voice_clone_enabled boolean not null default false,
ADD COLUMN IF NOT EXISTS chef_voice_id text,
ADD COLUMN IF NOT EXISTS chef_voice_name text,
ADD COLUMN IF NOT EXISTS chef_voice_authorized boolean not null default false;

-- 菜品语音音频缓存表
CREATE TABLE IF NOT EXISTS public.speech_audio_cache (
  id uuid primary key default gen_random_uuid(),
  dish_id uuid not null references public.dishes(id) on delete cascade,
  voice_mode text not null default 'default',
  voice_id text,
  generated_text text not null,
  text_hash text not null,
  audio_url text not null,
  model text,
  created_at timestamp with time zone not null default now(),

  unique (dish_id, voice_mode, voice_id, text_hash)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_speech_audio_cache_dish_id ON public.speech_audio_cache(dish_id);
CREATE INDEX IF NOT EXISTS idx_speech_audio_cache_lookup ON public.speech_audio_cache(dish_id, voice_mode, voice_id, text_hash);

-- RLS 策略
ALTER TABLE public.speech_audio_cache ENABLE ROW LEVEL SECURITY;

-- 任何人可以读取缓存的音频
CREATE POLICY "Anyone can read cached speech audio"
ON public.speech_audio_cache
FOR SELECT
USING (true);

-- Chef 可以插入缓存
CREATE POLICY "Chef can insert speech audio cache"
ON public.speech_audio_cache
FOR INSERT
WITH CHECK (true);

-- Chef 可以删除自己菜品的缓存
CREATE POLICY "Chef can delete own dish speech cache"
ON public.speech_audio_cache
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.dishes
    WHERE dishes.id = speech_audio_cache.dish_id
    AND dishes.created_by = auth.uid()
  )
);
