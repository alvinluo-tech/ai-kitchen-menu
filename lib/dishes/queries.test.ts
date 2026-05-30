import { describe, it, expect, vi, beforeEach } from "vitest";

// Chainable mock builder that is also thenable (so await builder.eq().eq() works)
function createBuilder(result: { data: any; error: any }) {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => Promise.resolve(result)),
    single: vi.fn(() => Promise.resolve(result)),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    // Make the builder thenable so `await builder.eq().eq()` resolves with result
    then: (resolve: any, reject: any) => Promise.resolve(result).then(resolve, reject),
  };
  return builder;
}

function createMockSupabase(responses: Record<string, { data: any; error: any }>) {
  return {
    from: vi.fn((table: string) => {
      const result = responses[table] ?? { data: null, error: null };
      return createBuilder(result);
    }),
  };
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getAvailableDishes", () => {
  it("returns dishes on success", async () => {
    const mockDishes = [{ id: "1", name: "红烧肉" }];
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(
      createMockSupabase({ dishes: { data: mockDishes, error: null } }) as any
    );

    const { getAvailableDishes } = await import("./queries");
    const result = await getAvailableDishes();
    expect(result).toEqual(mockDishes);
  });

  it("throws on error", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(
      createMockSupabase({
        dishes: { data: null, error: { message: "DB error" } },
      }) as any
    );

    const { getAvailableDishes } = await import("./queries");
    await expect(getAvailableDishes()).rejects.toThrow("DB error");
  });
});

describe("getDishBySlug", () => {
  it("returns dish when found", async () => {
    const mockDish = { id: "1", slug: "hong-shao-rou" };
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(
      createMockSupabase({ dishes: { data: mockDish, error: null } }) as any
    );

    const { getDishBySlug } = await import("./queries");
    const result = await getDishBySlug("hong-shao-rou");
    expect(result).toEqual(mockDish);
  });

  it("returns null on error", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(
      createMockSupabase({
        dishes: { data: null, error: { message: "Not found" } },
      }) as any
    );

    const { getDishBySlug } = await import("./queries");
    const result = await getDishBySlug("nonexistent");
    expect(result).toBeNull();
  });
});

describe("getDishById", () => {
  it("returns dish when found", async () => {
    const mockDish = { id: "abc-123", name: "红烧肉" };
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(
      createMockSupabase({ dishes: { data: mockDish, error: null } }) as any
    );

    const { getDishById } = await import("./queries");
    const result = await getDishById("abc-123");
    expect(result).toEqual(mockDish);
  });

  it("returns null on error", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(
      createMockSupabase({
        dishes: { data: null, error: { message: "Not found" } },
      }) as any
    );

    const { getDishById } = await import("./queries");
    const result = await getDishById("nonexistent");
    expect(result).toBeNull();
  });
});

describe("getAllDishes", () => {
  it("returns all dishes", async () => {
    const mockDishes = [{ id: "1" }, { id: "2" }];
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(
      createMockSupabase({ dishes: { data: mockDishes, error: null } }) as any
    );

    const { getAllDishes } = await import("./queries");
    const result = await getAllDishes();
    expect(result).toEqual(mockDishes);
  });

  it("returns empty array when data is null", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(
      createMockSupabase({ dishes: { data: null, error: null } }) as any
    );

    const { getAllDishes } = await import("./queries");
    const result = await getAllDishes();
    expect(result).toEqual([]);
  });

  it("throws on error", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(
      createMockSupabase({
        dishes: { data: null, error: { message: "DB error" } },
      }) as any
    );

    const { getAllDishes } = await import("./queries");
    await expect(getAllDishes()).rejects.toThrow("DB error");
  });
});

describe("getChefDishes", () => {
  it("returns dishes for a chef", async () => {
    const mockDishes = [{ id: "1", created_by: "chef-1" }];
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(
      createMockSupabase({ dishes: { data: mockDishes, error: null } }) as any
    );

    const { getChefDishes } = await import("./queries");
    const result = await getChefDishes("chef-1");
    expect(result).toEqual(mockDishes);
  });
});

describe("getChefDrafts", () => {
  it("returns draft dishes for a chef", async () => {
    const mockDrafts = [{ id: "1", status: "draft" }];
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(
      createMockSupabase({ dishes: { data: mockDrafts, error: null } }) as any
    );

    const { getChefDrafts } = await import("./queries");
    const result = await getChefDrafts("chef-1");
    expect(result).toEqual(mockDrafts);
  });
});

describe("publishDish", () => {
  it("does not throw on success", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(
      createMockSupabase({ dishes: { data: null, error: null } }) as any
    );

    const { publishDish } = await import("./queries");
    await expect(publishDish("dish-1", "chef-1")).resolves.toBeUndefined();
  });

  it("throws on error", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(
      createMockSupabase({
        dishes: { data: null, error: { message: "Update failed" } },
      }) as any
    );

    const { publishDish } = await import("./queries");
    await expect(publishDish("dish-1", "chef-1")).rejects.toThrow(
      "Update failed"
    );
  });
});

describe("unpublishDish", () => {
  it("does not throw on success", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(
      createMockSupabase({ dishes: { data: null, error: null } }) as any
    );

    const { unpublishDish } = await import("./queries");
    await expect(unpublishDish("dish-1", "chef-1")).resolves.toBeUndefined();
  });
});
