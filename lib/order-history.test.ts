import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock localStorage
const storage: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => storage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    storage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete storage[key];
  }),
  clear: vi.fn(() => {
    for (const key of Object.keys(storage)) delete storage[key];
  }),
};

vi.stubGlobal("localStorage", localStorageMock);
vi.stubGlobal("window", {});

// Must import after stubbing globals
const { saveOrder, loadOrders } = await import("./order-history");

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe("saveOrder", () => {
  it("saves an order to localStorage", () => {
    saveOrder({
      orderId: "order-1",
      createdAt: "2025-06-01T12:00:00Z",
      note: "少盐",
      items: [
        {
          dishId: "dish-1",
          name: "红烧肉",
          slug: "hong-shao-rou",
          quantity: 2,
          imageUrl: "https://example.com/img.jpg",
        },
      ],
    });

    expect(localStorageMock.setItem).toHaveBeenCalled();
    const stored = JSON.parse(storage["akm-oh"]);
    expect(stored).toHaveLength(1);
    expect(stored[0].i).toBe("order-1");
    expect(stored[0].n).toBe("少盐");
    expect(stored[0].r).toHaveLength(1);
    expect(stored[0].r[0].n).toBe("红烧肉");
    expect(stored[0].r[0].q).toBe(2);
  });

  it("prepends new orders (most recent first)", () => {
    saveOrder({
      orderId: "order-1",
      createdAt: "2025-06-01T12:00:00Z",
      note: "",
      items: [],
    });
    saveOrder({
      orderId: "order-2",
      createdAt: "2025-06-02T12:00:00Z",
      note: "",
      items: [],
    });

    const stored = JSON.parse(storage["akm-oh"]);
    expect(stored[0].i).toBe("order-2");
    expect(stored[1].i).toBe("order-1");
  });

  it("deduplicates orders by orderId", () => {
    saveOrder({
      orderId: "order-1",
      createdAt: "2025-06-01T12:00:00Z",
      note: "first",
      items: [],
    });
    saveOrder({
      orderId: "order-1",
      createdAt: "2025-06-01T12:00:00Z",
      note: "updated",
      items: [],
    });

    const stored = JSON.parse(storage["akm-oh"]);
    expect(stored).toHaveLength(1);
    expect(stored[0].n).toBe("updated");
  });

  it("caps at 50 orders", () => {
    for (let i = 0; i < 55; i++) {
      saveOrder({
        orderId: `order-${i}`,
        createdAt: `2025-06-${String(i + 1).padStart(2, "0")}T12:00:00Z`,
        note: "",
        items: [],
      });
    }

    const stored = JSON.parse(storage["akm-oh"]);
    expect(stored).toHaveLength(50);
    // Most recent should be first
    expect(stored[0].i).toBe("order-54");
  });

  it("handles empty note", () => {
    saveOrder({
      orderId: "order-1",
      createdAt: "2025-06-01T12:00:00Z",
      note: "",
      items: [],
    });

    const stored = JSON.parse(storage["akm-oh"]);
    expect(stored[0].n).toBe("");
  });
});

describe("loadOrders", () => {
  it("returns empty array when no orders stored", () => {
    expect(loadOrders()).toEqual([]);
  });

  it("loads and transforms stored orders", () => {
    saveOrder({
      orderId: "order-1",
      createdAt: "2025-06-01T12:00:00Z",
      note: "加辣",
      items: [
        {
          dishId: "dish-1",
          name: "麻婆豆腐",
          slug: "ma-po-doufu",
          quantity: 1,
          imageUrl: "https://example.com/img.jpg",
        },
      ],
    });

    const orders = loadOrders();
    expect(orders).toHaveLength(1);
    expect(orders[0].orderId).toBe("order-1");
    expect(orders[0].note).toBe("加辣");
    expect(orders[0].items[0].dishId).toBe("dish-1");
    expect(orders[0].items[0].name).toBe("麻婆豆腐");
    expect(orders[0].items[0].quantity).toBe(1);
  });

  it("converts timestamp back to ISO string", () => {
    const timestamp = new Date("2025-06-01T12:00:00Z").getTime();
    storage["akm-oh"] = JSON.stringify([
      { i: "order-1", t: timestamp, n: "", r: [] },
    ]);

    const orders = loadOrders();
    expect(orders[0].createdAt).toBe("2025-06-01T12:00:00.000Z");
  });

  it("handles corrupted localStorage data gracefully", () => {
    storage["akm-oh"] = "not-json";
    expect(loadOrders()).toEqual([]);
  });
});
