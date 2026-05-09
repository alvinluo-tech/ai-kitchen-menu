-- Performance indexes for frequently queried columns

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_accepted_by ON public.orders(accepted_by);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Order items table indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_dish_id ON public.order_items(dish_id);

-- Dishes table indexes
CREATE INDEX IF NOT EXISTS idx_dishes_created_by ON public.dishes(created_by);
CREATE INDEX IF NOT EXISTS idx_dishes_created_at ON public.dishes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dishes_is_available ON public.dishes(is_available) WHERE is_available = true;

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Dish ingredients table indexes (for reverse lookups)
CREATE INDEX IF NOT EXISTS idx_dish_ingredients_ingredient_id ON public.dish_ingredients(ingredient_id);

-- Composite index for common dish query pattern
CREATE INDEX IF NOT EXISTS idx_dishes_available_created ON public.dishes(is_available, created_at DESC) WHERE is_available = true;
