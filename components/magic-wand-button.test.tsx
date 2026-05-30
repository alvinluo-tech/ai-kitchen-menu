import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MagicWandButton } from "./magic-wand-button";

beforeEach(() => {
  cleanup();
});

describe("MagicWandButton", () => {
  it("renders button with title", () => {
    render(<MagicWandButton onClick={() => {}} />);
    expect(screen.getByTitle("AI 助写")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<MagicWandButton onClick={onClick} />);
    await user.click(screen.getByTitle("AI 助写"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<MagicWandButton onClick={onClick} disabled />);
    const button = screen.getByTitle("AI 助写");
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
