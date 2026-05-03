export type DishAttachment = {
  id: string;
  dish_id: string;
  title: string | null;
  content: string | null;
  image_urls: string[];
  is_public: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};
