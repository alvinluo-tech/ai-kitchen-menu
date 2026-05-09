export type OrderStatus = "pending" | "accepted" | "completed" | "cancelled";

export type OrderItem = {
  id: string;
  order_id: string;
  dish_id: string;
  quantity: number;
  notes?: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  status: OrderStatus;
  customer_note?: string | null;
  accepted_by?: string | null;
  accepted_at?: string | null;
  created_at: string;
  updated_at: string;
  order_items?: (OrderItem & {
    dishes?: {
      id: string;
      name: string;
      slug: string;
      image_url?: string | null;
      description?: string;
    };
  })[];
  accepted_by_profile?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};
