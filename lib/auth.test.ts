import { describe, it, expect, vi, beforeEach } from "vitest";

// Build a chainable mock for Supabase query builder
function createMockQueryBuilder(result: { data: any; error: any }) {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(result)),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
  };
  return builder;
}

function createMockSupabase(user: any, profile: any) {
  return {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user } })),
    },
    from: vi.fn((table: string) => {
      if (table === "profiles") {
        return createMockQueryBuilder({ data: profile, error: null });
      }
      return createMockQueryBuilder({ data: null, error: null });
    }),
  };
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requireChef", () => {
  it("returns isChef=false when no user", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(
      createMockSupabase(null, null) as any
    );

    const { requireChef } = await import("./auth");
    const result = await requireChef();

    expect(result.user).toBeNull();
    expect(result.profile).toBeNull();
    expect(result.isChef).toBe(false);
  });

  it("returns isChef=true when user has chef role", async () => {
    const mockUser = { id: "user-1", email: "chef@test.com" };
    const mockProfile = { id: "user-1", role: "chef", display_name: "张大厨" };

    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(
      createMockSupabase(mockUser, mockProfile) as any
    );

    const { requireChef } = await import("./auth");
    const result = await requireChef();

    expect(result.user).toEqual(mockUser);
    expect(result.profile).toEqual(mockProfile);
    expect(result.isChef).toBe(true);
  });

  it("returns isChef=false when user is not a chef", async () => {
    const mockUser = { id: "user-1", email: "user@test.com" };
    const mockProfile = { id: "user-1", role: "user", display_name: "普通用户" };

    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(
      createMockSupabase(mockUser, mockProfile) as any
    );

    const { requireChef } = await import("./auth");
    const result = await requireChef();

    expect(result.isChef).toBe(false);
  });

  it("returns isChef=false when profile has no role", async () => {
    const mockUser = { id: "user-1", email: "user@test.com" };
    const mockProfile = { id: "user-1", role: null, display_name: "用户" };

    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(
      createMockSupabase(mockUser, mockProfile) as any
    );

    const { requireChef } = await import("./auth");
    const result = await requireChef();

    expect(result.isChef).toBe(false);
  });
});
