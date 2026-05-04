-- 添加 audio_sample 字段用于存储厨师声音样本（base64）
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS audio_sample text;
