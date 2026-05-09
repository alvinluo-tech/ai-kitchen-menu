const STORAGE_KEY = "akm-oh";
const MAX_ORDERS = 50;

type StoredItem = {
  i: string; // dishId
  n: string; // name
  s: string; // slug
  q: number; // quantity
  u: string; // imageUrl (first image)
};

type StoredOrder = {
  i: string; // orderId
  t: number; // createdAt timestamp
  n: string; // note
  r: StoredItem[]; // items
};

export type OrderRecord = {
  orderId: string;
  createdAt: string;
  note: string;
  items: {
    dishId: string;
    name: string;
    slug: string;
    quantity: number;
    imageUrl: string;
  }[];
};

function loadAll(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(orders: StoredOrder[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // localStorage full or unavailable
  }
}

export function saveOrder(order: OrderRecord) {
  const stored: StoredOrder = {
    i: order.orderId,
    t: new Date(order.createdAt).getTime(),
    n: order.note || "",
    r: order.items.map((item) => ({
      i: item.dishId,
      n: item.name,
      s: item.slug,
      q: item.quantity,
      u: item.imageUrl || "",
    })),
  };

  const orders = loadAll();
  // Avoid duplicate orderId
  const filtered = orders.filter((o) => o.i !== stored.i);
  filtered.unshift(stored);
  saveAll(filtered.slice(0, MAX_ORDERS));
}

export function loadOrders(): OrderRecord[] {
  const orders = loadAll();
  return orders.map((o) => ({
    orderId: o.i,
    createdAt: new Date(o.t).toISOString(),
    note: o.n || "",
    items: o.r.map((item) => ({
      dishId: item.i,
      name: item.n,
      slug: item.s,
      quantity: item.q,
      imageUrl: item.u || "",
    })),
  }));
}
