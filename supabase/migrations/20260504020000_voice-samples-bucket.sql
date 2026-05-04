-- 创建 voice-samples 存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-samples', 'voice-samples', true)
ON CONFLICT (id) DO NOTHING;

-- 存储策略：任何人可以查看
DO $$ BEGIN
  CREATE POLICY "Anyone can view voice samples"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'voice-samples');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 存储策略：厨师可以上传
DO $$ BEGIN
  CREATE POLICY "Chef can upload voice samples"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'voice-samples'
    AND public.is_chef()
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 存储策略：厨师可以更新自己的文件
DO $$ BEGIN
  CREATE POLICY "Chef can update voice samples"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'voice-samples'
    AND public.is_chef()
  )
  WITH CHECK (
    bucket_id = 'voice-samples'
    AND public.is_chef()
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 存储策略：厨师可以删除自己的文件
DO $$ BEGIN
  CREATE POLICY "Chef can delete voice samples"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'voice-samples'
    AND public.is_chef()
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
