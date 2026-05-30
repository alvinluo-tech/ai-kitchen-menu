import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { DishCard } from "./dish-card";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock next/image
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

const baseProps = {
  dishId: "dish-1",
  name: "红烧肉",
  slug: "hong-shao-rou",
  description: "经典家常菜",
};

beforeEach(() => {
  cleanup();
});

describe("DishCard", () => {
  it("renders dish name and description", () => {
    render(<DishCard {...baseProps} />);
    expect(screen.getByText("红烧肉")).toBeInTheDocument();
    expect(screen.getByText("经典家常菜")).toBeInTheDocument();
  });

  it("renders tags", () => {
    render(<DishCard {...baseProps} tags={["下饭", "家常", "经典"]} />);
    expect(screen.getByText("下饭")).toBeInTheDocument();
    expect(screen.getByText("家常")).toBeInTheDocument();
    expect(screen.getByText("经典")).toBeInTheDocument();
  });

  it("limits displayed tags to 3", () => {
    render(<DishCard {...baseProps} tags={["a", "b", "c", "d"]} />);
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
    expect(screen.getByText("c")).toBeInTheDocument();
    expect(screen.queryByText("d")).not.toBeInTheDocument();
  });

  it("renders cooking time when provided", () => {
    render(<DishCard {...baseProps} cookingTimeMinutes={30} />);
    expect(screen.getByText("30分钟")).toBeInTheDocument();
  });

  it("does not render cooking time when null", () => {
    render(<DishCard {...baseProps} cookingTimeMinutes={null} />);
    expect(screen.queryByText(/分钟/)).not.toBeInTheDocument();
  });

  it("renders spice level when > 0", () => {
    render(<DishCard {...baseProps} spiceLevel={3} />);
    expect(screen.getByText("辣度 3")).toBeInTheDocument();
  });

  it("does not render spice level when 0", () => {
    render(<DishCard {...baseProps} spiceLevel={0} />);
    expect(screen.queryByText(/辣度/)).not.toBeInTheDocument();
  });

  it("renders order count when > 0", () => {
    render(<DishCard {...baseProps} orderCount={42} />);
    expect(screen.getByText("42次")).toBeInTheDocument();
  });

  it("does not render order count when 0", () => {
    render(<DishCard {...baseProps} orderCount={0} />);
    expect(screen.queryByText(/次/)).not.toBeInTheDocument();
  });

  it("renders score badge when provided", () => {
    render(<DishCard {...baseProps} score={85} />);
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("renders rank badge when <= 3", () => {
    render(<DishCard {...baseProps} rank={2} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("does not render rank badge when > 3", () => {
    const { container } = render(<DishCard {...baseProps} rank={5} />);
    expect(container.querySelector(".bg-orange-500")).not.toBeInTheDocument();
  });

  it("renders reason when provided", () => {
    render(<DishCard {...baseProps} reason="匹配你的口味偏好" />);
    expect(screen.getByText("匹配你的口味偏好")).toBeInTheDocument();
  });

  it("renders matched and missing ingredients", () => {
    render(
      <DishCard
        {...baseProps}
        matchedIngredients={["猪肉", "酱油"]}
        missingIngredients={["八角"]}
      />
    );
    expect(screen.getByText(/猪肉、酱油/)).toBeInTheDocument();
    expect(screen.getByText(/八角/)).toBeInTheDocument();
  });

  it("renders chef name when provided", () => {
    render(
      <DishCard
        {...baseProps}
        chef={{ id: "chef-1", display_name: "张大厨", avatar_url: null }}
      />
    );
    expect(screen.getByText("张大厨")).toBeInTheDocument();
  });

  it('renders "匿名" when chef has no display_name', () => {
    render(
      <DishCard
        {...baseProps}
        chef={{ id: "chef-1", display_name: null, avatar_url: null }}
      />
    );
    expect(screen.getByText("匿名")).toBeInTheDocument();
  });

  it("renders link to detail page", () => {
    render(<DishCard {...baseProps} />);
    const links = screen.getAllByText("查看详情");
    expect(links.length).toBeGreaterThan(0);
    const link = links[0].closest("a");
    expect(link).toHaveAttribute("href", "/menu/hong-shao-rou");
  });

  it("renders placeholder when no image", () => {
    const { container } = render(<DishCard {...baseProps} imageUrl={null} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders image when URL provided", () => {
    render(
      <DishCard {...baseProps} imageUrl="https://example.com/img.jpg" />
    );
    const img = screen.getByAltText("红烧肉");
    expect(img).toHaveAttribute("src", "https://example.com/img.jpg");
  });
});
