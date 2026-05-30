import { describe, it, expect } from "vitest";
import { classifyDish } from "./classify";
import type { Dish } from "./types";

function makeDish(overrides: Partial<Dish> = {}): Dish {
  return {
    id: "1",
    name: "Test Dish",
    slug: "test-dish",
    description: "A test dish",
    spice_level: 0,
    difficulty: "easy",
    is_available: true,
    status: "published",
    order_count: 0,
    created_at: "2025-01-01",
    updated_at: "2025-01-01",
    ...overrides,
  };
}

describe("classifyDish", () => {
  describe("tag-based classification", () => {
    it('classifies as soup when tag contains "汤"', () => {
      const dish = makeDish({
        dish_tags: [{ id: "1", tag: "番茄蛋汤" }],
      });
      expect(classifyDish(dish)).toBe("soup");
    });

    it('classifies as soup when tag contains "煲汤"', () => {
      const dish = makeDish({
        dish_tags: [{ id: "1", tag: "老火煲汤" }],
      });
      expect(classifyDish(dish)).toBe("soup");
    });

    it('classifies as meat when tag contains "荤菜"', () => {
      const dish = makeDish({
        dish_tags: [{ id: "1", tag: "经典荤菜" }],
      });
      expect(classifyDish(dish)).toBe("meat");
    });

    it('classifies as meat when tag contains "海鲜"', () => {
      const dish = makeDish({
        dish_tags: [{ id: "1", tag: "新鲜海鲜" }],
      });
      expect(classifyDish(dish)).toBe("meat");
    });

    it('classifies as vegetable when tag contains "素菜"', () => {
      const dish = makeDish({
        dish_tags: [{ id: "1", tag: "清炒素菜" }],
      });
      expect(classifyDish(dish)).toBe("vegetable");
    });

    it("soup tags take priority over meat tags", () => {
      const dish = makeDish({
        dish_tags: [
          { id: "1", tag: "荤汤" },
          { id: "2", tag: "肉类" },
        ],
      });
      expect(classifyDish(dish)).toBe("soup");
    });
  });

  describe("name-based classification", () => {
    it('classifies as soup when name contains "汤"', () => {
      const dish = makeDish({ name: "番茄鸡蛋汤" });
      expect(classifyDish(dish)).toBe("soup");
    });

    it('classifies as soup when name contains "羹"', () => {
      const dish = makeDish({ name: "西湖牛肉羹" });
      expect(classifyDish(dish)).toBe("soup");
    });
  });

  describe("ingredient-based classification", () => {
    it("classifies as meat when ingredients contain meat", () => {
      const dish = makeDish({
        dish_ingredients: [
          {
            id: "1",
            is_required: true,
            ingredients: { id: "1", name: "猪肉", category: null },
          },
        ],
      });
      expect(classifyDish(dish)).toBe("meat");
    });

    it("classifies as meat when ingredient contains chicken", () => {
      const dish = makeDish({
        dish_ingredients: [
          {
            id: "1",
            is_required: true,
            ingredients: { id: "1", name: "鸡胸肉", category: null },
          },
        ],
      });
      expect(classifyDish(dish)).toBe("meat");
    });

    it("classifies as vegetable when ingredients exist but no meat", () => {
      const dish = makeDish({
        dish_ingredients: [
          {
            id: "1",
            is_required: true,
            ingredients: { id: "1", name: "白菜", category: null },
          },
        ],
      });
      expect(classifyDish(dish)).toBe("vegetable");
    });
  });

  describe("fallback", () => {
    it('returns "other" when no tags, no meat keywords, no ingredients', () => {
      const dish = makeDish({
        name: "神秘料理",
        dish_tags: [],
        dish_ingredients: [],
      });
      expect(classifyDish(dish)).toBe("other");
    });

    it('returns "other" when dish has no tags and no ingredients', () => {
      const dish = makeDish({ name: "未知菜品" });
      expect(classifyDish(dish)).toBe("other");
    });
  });
});
