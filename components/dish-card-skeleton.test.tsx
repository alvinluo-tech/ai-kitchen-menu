import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { DishCardSkeleton } from "./dish-card-skeleton";

describe("DishCardSkeleton", () => {
  it("renders skeleton elements", () => {
    const { container } = render(<DishCardSkeleton />);
    // Should render multiple skeleton elements
    const skeletons = container.querySelectorAll("[data-slot=skeleton]");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders without crashing", () => {
    const { container } = render(<DishCardSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });
});
