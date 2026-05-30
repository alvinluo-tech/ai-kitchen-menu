import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DishGrid } from "./dish-grid";
import type { Dish } from "@/lib/dishes/types";

// Mock next/link and next/image
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock useCart
vi.mock("@/lib/cart-context", () => ({
  useCart: () => ({
    items: [],
    addItem: vi.fn(),
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
    totalItems: 0,
  }),
}));

function makeDish(overrides: Partial<Dish> = {}): Dish {
  return {
    id: "1",
    name: "红烧肉",
    slug: "hong-shao-rou",
    description: "经典菜",
    spice_level: 0,
    difficulty: "easy",
    is_available: true,
    status: "published",
    order_count: 0,
    created_at: "2025-01-01",
    updated_at: "2025-01-01",
    ...overrides,
  };
}

describe("DishGrid", () => {
  it("renders a card for each dish", () => {
    const dishes = [
      makeDish({ id: "1", name: "红烧肉", slug: "hong-shao-rou" }),
      makeDish({ id: "2", name: "麻婆豆腐", slug: "ma-po-doufu" }),
    ];
    render(<DishGrid dishes={dishes} />);
    expect(screen.getByText("红烧肉")).toBeInTheDocument();
    expect(screen.getByText("麻婆豆腐")).toBeInTheDocument();
  });

  it("renders empty grid for no dishes", () => {
    const { container } = render(<DishGrid dishes={[]} />);
    expect(container.querySelector(".grid")).toBeInTheDocument();
    expect(container.querySelector(".grid")?.children).toHaveLength(0);
  });

  it("passes tags to DishCard", () => {
    const dishes = [
      makeDish({
        id: "1",
        name: "红烧肉",
        dish_tags: [{ id: "t1", tag: "下饭" }],
      }),
    ];
    render(<DishGrid dishes={dishes} />);
    expect(screen.getByText("下饭")).toBeInTheDocument();
  });
});
