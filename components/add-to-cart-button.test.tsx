import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddToCartButton } from "./add-to-cart-button";

const mockAddItem = vi.fn();
let mockItems: any[] = [];

vi.mock("@/lib/cart-context", () => ({
  useCart: () => ({
    items: mockItems,
    addItem: mockAddItem,
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
    totalItems: mockItems.reduce((s: number, i: any) => s + i.quantity, 0),
  }),
}));

const baseProps = {
  dishId: "dish-1",
  name: "红烧肉",
  slug: "hong-shao-rou",
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockItems = [];
});

describe("AddToCartButton", () => {
  it('renders "点菜" when not in cart', () => {
    render(<AddToCartButton {...baseProps} />);
    expect(screen.getByText("点菜")).toBeInTheDocument();
  });

  it('renders quantity when item is in cart', () => {
    mockItems = [{ dishId: "dish-1", quantity: 3 }];
    render(<AddToCartButton {...baseProps} />);
    expect(screen.getByText("点菜 (3)")).toBeInTheDocument();
  });

  it("calls addItem on click", async () => {
    const user = userEvent.setup();
    render(<AddToCartButton {...baseProps} />);
    await user.click(screen.getByText("点菜"));
    expect(mockAddItem).toHaveBeenCalledWith({
      dishId: "dish-1",
      name: "红烧肉",
      slug: "hong-shao-rou",
      imageUrl: null,
    });
  });

  it('shows "已添加" after clicking', async () => {
    const user = userEvent.setup();
    render(<AddToCartButton {...baseProps} />);
    await user.click(screen.getByText("点菜"));
    expect(screen.getByText("已添加")).toBeInTheDocument();
  });

  it('renders icon variant correctly', () => {
    render(<AddToCartButton {...baseProps} variant="icon" />);
    expect(screen.getByTitle("点菜")).toBeInTheDocument();
  });
});
