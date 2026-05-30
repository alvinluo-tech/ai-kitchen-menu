import { describe, it, expect, vi, beforeEach } from "vitest";

// Chainable mock builder - terminal methods return result
function createBuilder(result: { data: any; error: any }) {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => Promise.resolve(result)),
    single: vi.fn(() => Promise.resolve(result)),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
  };
  return builder;
}

function createMockSupabase(overrides: Record<string, any> = {}) {
  return {
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: overrides.user ?? null } })
      ),
    },
    from: vi.fn((table: string) => {
      const result = overrides[table] ?? { data: null, error: null };
      return createBuilder(result);
    }),
    ...overrides.extra,
  };
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/orders", () => {
  it("creates order successfully", async () => {
    const mockOrder = { id: "order-1" };
    const mockSupabase = createMockSupabase({
      orders: { data: mockOrder, error: null },
      order_items: { data: null, error: null },
    });

    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ dish_id: "550e8400-e29b-41d4-a716-446655440000", quantity: 2 }],
        customer_note: "少盐",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.orderId).toBe("order-1");
  });

  it("returns 400 for invalid body", async () => {
    const mockSupabase = createMockSupabase();
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [] }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 500 when order creation fails", async () => {
    const mockSupabase = createMockSupabase({
      orders: { data: null, error: { message: "DB error" } },
    });
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ dish_id: "550e8400-e29b-41d4-a716-446655440000", quantity: 1 }],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});

describe("GET /api/orders", () => {
  it("returns 401 when not logged in", async () => {
    const mockSupabase = createMockSupabase({ user: null });
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const { GET } = await import("./route");
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns 403 when user is not a chef", async () => {
    const mockSupabase = createMockSupabase({
      user: { id: "user-1" },
      profiles: { data: { role: "user" }, error: null },
    });
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const { GET } = await import("./route");
    const response = await GET();
    expect(response.status).toBe(403);
  });

  it("returns orders for chef", async () => {
    const mockOrders = [{ id: "order-1", status: "pending" }];
    const mockSupabase = createMockSupabase({
      user: { id: "chef-1" },
      profiles: { data: { role: "chef" }, error: null },
      orders: { data: mockOrders, error: null },
    });
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const { GET } = await import("./route");
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.orders).toEqual(mockOrders);
  });
});
