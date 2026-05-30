import { describe, it, expect } from "vitest";
import { cn, extractJson } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("deduplicates conflicting tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles falsy values", () => {
    expect(cn("foo", false, null, undefined, "bar")).toBe("foo bar");
  });

  it("returns empty string for no arguments", () => {
    expect(cn()).toBe("");
  });
});

describe("extractJson", () => {
  it("extracts JSON from markdown code block", () => {
    const input = 'Here is the result:\n```json\n{"name": "test"}\n```\nDone.';
    expect(extractJson(input)).toBe('{"name": "test"}');
  });

  it("extracts JSON from markdown code block with extra whitespace", () => {
    const input = '```json\n  {"key": "value"}  \n```';
    expect(extractJson(input)).toBe('{"key": "value"}');
  });

  it("extracts JSON object when no code block present", () => {
    const input = 'Some text {"name": "test"} more text';
    expect(extractJson(input)).toBe('{"name": "test"}');
  });

  it("extracts nested JSON object", () => {
    const input = 'Result: {"data": {"nested": true}} done';
    expect(extractJson(input)).toBe('{"data": {"nested": true}}');
  });

  it("returns trimmed text when no JSON found", () => {
    expect(extractJson("  just plain text  ")).toBe("just plain text");
  });

  it("handles empty string", () => {
    expect(extractJson("")).toBe("");
  });

  it("prefers code block over loose braces", () => {
    const input = 'outer {"loose": true} ```json\n{"precise": 1}\n```';
    expect(extractJson(input)).toBe('{"precise": 1}');
  });
});
