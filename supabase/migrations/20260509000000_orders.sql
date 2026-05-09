-- Orders and order_items tables for the ordering system
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
  customer_note TEXT,
  accepted_by UUID REFERENCES public.profiles(id),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  dish_id UUID NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add order_count column to dishes
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS order_count INTEGER NOT NULL DEFAULT 0;

-- RLS: anyone can create orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can view orders" ON public.orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Chefs can update orders" ON public.orders FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'chef'));

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create order_items" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can view order_items" ON public.order_items FOR SELECT TO anon, authenticated USING (true);

-- Updated_at trigger for orders
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment order_count on dishes
CREATE OR REPLACE FUNCTION public.increment_order_count(dish_id UUID, increment_by INTEGER DEFAULT 1)
RETURNS void AS $$
BEGIN
  UPDATE public.dishes
  SET order_count = order_count + increment_by
  WHERE id = dish_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
