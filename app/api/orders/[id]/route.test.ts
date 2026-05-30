import { describe, it, expect, vi, beforeEach } from "vitest";

function createBuilder(result: { data: any; error: any }) {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(result)),
    update: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    // Make thenable so await builder.eq().eq() resolves
    then: (resolve: any, reject: any) => Promise.resolve(result).then(resolve, reject),
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
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    ...overrides.extra,
  };
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PUT /api/orders/[id]", () => {
  it("returns 401 when not logged in", async () => {
    const mockSupabase = createMockSupabase({ user: null });
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const { PUT } = await import("./route");
    const request = new Request("http://localhost/api/orders/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });

    const response = await PUT(request, {
      params: Promise.resolve({ id: "order-1" }),
    });
    expect(response.status).toBe(401);
  });

  it("returns 403 when user is not a chef", async () => {
    const mockSupabase = createMockSupabase({
      user: { id: "user-1" },
      profiles: { data: { role: "user" }, error: null },
    });
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const { PUT } = await import("./route");
    const request = new Request("http://localhost/api/orders/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });

    const response = await PUT(request, {
      params: Promise.resolve({ id: "order-1" }),
    });
    expect(response.status).toBe(403);
  });

  it("returns 400 for invalid action", async () => {
    const mockSupabase = createMockSupabase({
      user: { id: "chef-1" },
      profiles: { data: { role: "chef" }, error: null },
    });
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const { PUT } = await import("./route");
    const request = new Request("http://localhost/api/orders/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "invalid" }),
    });

    const response = await PUT(request, {
      params: Promise.resolve({ id: "order-1" }),
    });
    expect(response.status).toBe(400);
  });

  it("accepts a pending order", async () => {
    const mockSupabase = createMockSupabase({
      user: { id: "chef-1" },
      profiles: { data: { role: "chef" }, error: null },
      orders: { data: { status: "pending", accepted_by: null }, error: null },
    });
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const { PUT } = await import("./route");
    const request = new Request("http://localhost/api/orders/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });

    const response = await PUT(request, {
      params: Promise.resolve({ id: "order-1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("returns 404 when order not found", async () => {
    const mockSupabase = createMockSupabase({
      user: { id: "chef-1" },
      profiles: { data: { role: "chef" }, error: null },
      orders: { data: null, error: null },
    });
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const { PUT } = await import("./route");
    const request = new Request("http://localhost/api/orders/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });

    const response = await PUT(request, {
      params: Promise.resolve({ id: "order-1" }),
    });
    expect(response.status).toBe(404);
  });

  it("cancels an order", async () => {
    const mockSupabase = createMockSupabase({
      user: { id: "chef-1" },
      profiles: { data: { role: "chef" }, error: null },
    });
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const { PUT } = await import("./route");
    const request = new Request("http://localhost/api/orders/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });

    const response = await PUT(request, {
      params: Promise.resolve({ id: "order-1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
