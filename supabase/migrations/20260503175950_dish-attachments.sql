-- 创建菜品附件表
CREATE TABLE IF NOT EXISTS public.dish_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id UUID NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  image_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX idx_dish_attachments_dish_id ON public.dish_attachments(dish_id);

-- RLS 策略
ALTER TABLE public.dish_attachments ENABLE ROW LEVEL SECURITY;

-- 任何人可以读取公开附件
CREATE POLICY "Anyone can read public attachments"
ON public.dish_attachments
FOR SELECT
USING (is_public = true);

-- Chef 可以读取自己菜品的所有附件
CREATE POLICY "Chef can read own dish attachments"
ON public.dish_attachments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.dishes
    WHERE dishes.id = dish_attachments.dish_id
    AND dishes.created_by = auth.uid()
  )
);

-- Chef 可以插入附件
CREATE POLICY "Chef can insert attachments"
ON public.dish_attachments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.dishes
    WHERE dishes.id = dish_attachments.dish_id
    AND dishes.created_by = auth.uid()
  )
);

-- Chef 可以更新附件
CREATE POLICY "Chef can update attachments"
ON public.dish_attachments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.dishes
    WHERE dishes.id = dish_attachments.dish_id
    AND dishes.created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.dishes
    WHERE dishes.id = dish_attachments.dish_id
    AND dishes.created_by = auth.uid()
  )
);

-- Chef 可以删除附件
CREATE POLICY "Chef can delete attachments"
ON public.dish_attachments
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.dishes
    WHERE dishes.id = dish_attachments.dish_id
    AND dishes.created_by = auth.uid()
  )
);
