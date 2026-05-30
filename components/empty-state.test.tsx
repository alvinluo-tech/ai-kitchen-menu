import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="没有菜品" description="快去添加第一道菜吧" />);
    expect(screen.getByText("没有菜品")).toBeInTheDocument();
    expect(screen.getByText("快去添加第一道菜吧")).toBeInTheDocument();
  });

  it("renders ChefHat icon", () => {
    const { container } = render(<EmptyState title="空" description="空" />);
    // lucide-react renders SVG
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
