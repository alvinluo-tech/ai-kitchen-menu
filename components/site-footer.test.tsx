import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("renders footer text", () => {
    render(<SiteFooter />);
    expect(screen.getByText("AI 私厨电子菜单")).toBeInTheDocument();
    expect(screen.getByText("朋友会做的菜，AI 帮你推荐")).toBeInTheDocument();
  });

  it("renders as footer element", () => {
    const { container } = render(<SiteFooter />);
    expect(container.querySelector("footer")).toBeInTheDocument();
  });
});
