import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { type ReactNode } from "react";
import { CartProvider, useCart } from "./cart-context";

// Mock localStorage
const storage: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => storage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    storage[key] = value;
  }),
  removeItem: vi.fn(),
  clear: vi.fn(() => {
    for (const key of Object.keys(storage)) delete storage[key];
  }),
};
vi.stubGlobal("localStorage", localStorageMock);

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe("useCart", () => {
  it("throws when used outside CartProvider", () => {
    expect(() => renderHook(() => useCart())).toThrow(
      "useCart must be used within CartProvider"
    );
  });

  it("starts with empty cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
  });

  it("adds item to cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({
        dishId: "dish-1",
        name: "红烧肉",
        slug: "hong-shao-rou",
      });
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].dishId).toBe("dish-1");
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.totalItems).toBe(1);
  });

  it("increments quantity when adding same item", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({
        dishId: "dish-1",
        name: "红烧肉",
        slug: "hong-shao-rou",
      });
    });
    act(() => {
      result.current.addItem({
        dishId: "dish-1",
        name: "红烧肉",
        slug: "hong-shao-rou",
      });
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.totalItems).toBe(2);
  });

  it("removes item from cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({
        dishId: "dish-1",
        name: "红烧肉",
        slug: "hong-shao-rou",
      });
    });
    act(() => {
      result.current.removeItem("dish-1");
    });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });

  it("updates quantity", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({
        dishId: "dish-1",
        name: "红烧肉",
        slug: "hong-shao-rou",
      });
    });
    act(() => {
      result.current.updateQuantity("dish-1", 5);
    });
    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.totalItems).toBe(5);
  });

  it("removes item when quantity set to 0", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({
        dishId: "dish-1",
        name: "红烧肉",
        slug: "hong-shao-rou",
      });
    });
    act(() => {
      result.current.updateQuantity("dish-1", 0);
    });
    expect(result.current.items).toHaveLength(0);
  });

  it("removes item when quantity set to negative", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({
        dishId: "dish-1",
        name: "红烧肉",
        slug: "hong-shao-rou",
      });
    });
    act(() => {
      result.current.updateQuantity("dish-1", -1);
    });
    expect(result.current.items).toHaveLength(0);
  });

  it("clears cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({
        dishId: "dish-1",
        name: "红烧肉",
        slug: "hong-shao-rou",
      });
      result.current.addItem({
        dishId: "dish-2",
        name: "麻婆豆腐",
        slug: "ma-po-doufu",
      });
    });
    act(() => {
      result.current.clearCart();
    });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });

  it("calculates totalItems across multiple items", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({
        dishId: "dish-1",
        name: "红烧肉",
        slug: "hong-shao-rou",
      });
      result.current.addItem({
        dishId: "dish-2",
        name: "麻婆豆腐",
        slug: "ma-po-doufu",
      });
      result.current.addItem({
        dishId: "dish-1",
        name: "红烧肉",
        slug: "hong-shao-rou",
      });
    });
    expect(result.current.totalItems).toBe(3);
  });
});
