import { describe, it, expect } from "vitest";
import { getDishImageUrls, getDishImageUrl } from "./types";

describe("getDishImageUrls", () => {
  it("returns empty array for null", () => {
    expect(getDishImageUrls(null)).toEqual([]);
  });

  it("returns empty array for undefined", () => {
    expect(getDishImageUrls(undefined)).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(getDishImageUrls("")).toEqual([]);
  });

  it("parses JSON array of URLs", () => {
    const urls = ["https://example.com/1.jpg", "https://example.com/2.jpg"];
    expect(getDishImageUrls(JSON.stringify(urls))).toEqual(urls);
  });

  it("wraps non-array JSON string in array (preserves original)", () => {
    expect(getDishImageUrls('"https://example.com/img.jpg"')).toEqual([
      '"https://example.com/img.jpg"',
    ]);
  });

  it("wraps plain URL string in array", () => {
    expect(getDishImageUrls("https://example.com/img.jpg")).toEqual([
      "https://example.com/img.jpg",
    ]);
  });

  it("handles empty JSON array", () => {
    expect(getDishImageUrls("[]")).toEqual([]);
  });
});

describe("getDishImageUrl", () => {
  it("returns null for null input", () => {
    expect(getDishImageUrl(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(getDishImageUrl(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getDishImageUrl("")).toBeNull();
  });

  it("returns first URL from JSON array", () => {
    const urls = ["https://example.com/1.jpg", "https://example.com/2.jpg"];
    expect(getDishImageUrl(JSON.stringify(urls))).toBe(
      "https://example.com/1.jpg"
    );
  });

  it("returns plain URL string", () => {
    expect(getDishImageUrl("https://example.com/img.jpg")).toBe(
      "https://example.com/img.jpg"
    );
  });

  it("returns null for empty JSON array", () => {
    expect(getDishImageUrl("[]")).toBeNull();
  });
});
