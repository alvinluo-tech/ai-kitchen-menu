import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BackButton } from "./back-button";

const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: mockBack }),
}));

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("BackButton", () => {
  it("renders with text", () => {
    render(<BackButton />);
    expect(screen.getByText("返回")).toBeInTheDocument();
  });

  it("calls router.back on click", async () => {
    const user = userEvent.setup();
    render(<BackButton />);
    await user.click(screen.getByText("返回"));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
