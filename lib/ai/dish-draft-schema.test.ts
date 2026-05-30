import { describe, it, expect } from "vitest";
import { DishDraftSchema } from "./dish-draft-schema";

describe("DishDraftSchema", () => {
  const validDraft = {
    name: "红烧肉",
    description: "经典家常菜，肥而不腻",
    story: "妈妈的味道",
    cuisine: "家常",
    spice_level: 2,
    difficulty: "medium" as const,
    cooking_time_minutes: 60,
    servings: "3-4",
    ingredients: [
      { name: "五花肉", amount: "500g", is_required: true },
      { name: "冰糖", amount: "30g", is_required: true },
      { name: "八角", is_required: false },
    ],
    tags: ["下饭", "家常"],
  };

  it("accepts valid draft", () => {
    const result = DishDraftSchema.parse(validDraft);
    expect(result.name).toBe("红烧肉");
    expect(result.ingredients).toHaveLength(3);
  });

  it("rejects spice level above 5", () => {
    expect(() =>
      DishDraftSchema.parse({ ...validDraft, spice_level: 6 })
    ).toThrow();
  });

  it("rejects spice level below 0", () => {
    expect(() =>
      DishDraftSchema.parse({ ...validDraft, spice_level: -1 })
    ).toThrow();
  });

  it("rejects invalid difficulty", () => {
    expect(() =>
      DishDraftSchema.parse({ ...validDraft, difficulty: "expert" })
    ).toThrow();
  });

  it("accepts all difficulty levels", () => {
    for (const diff of ["easy", "medium", "hard"]) {
      const result = DishDraftSchema.parse({ ...validDraft, difficulty: diff });
      expect(result.difficulty).toBe(diff);
    }
  });

  it("ingredient amount is optional", () => {
    const draft = {
      ...validDraft,
      ingredients: [{ name: "盐", is_required: true }],
    };
    const result = DishDraftSchema.parse(draft);
    expect(result.ingredients[0].amount).toBeUndefined();
  });

  it("rejects missing required fields", () => {
    expect(() => DishDraftSchema.parse({})).toThrow();
  });

  it("rejects non-string name", () => {
    expect(() => DishDraftSchema.parse({ ...validDraft, name: 123 })).toThrow();
  });

  it("rejects non-array ingredients", () => {
    expect(() =>
      DishDraftSchema.parse({ ...validDraft, ingredients: "not-array" })
    ).toThrow();
  });
});
