import { describe, it, expect } from "vitest";
import { UserPreferenceSchema, RecommendationSchema } from "./schemas";

describe("UserPreferenceSchema", () => {
  it("accepts valid input with all fields", () => {
    const input = {
      flavors: ["辣", "鲜"],
      availableIngredients: ["猪肉", "白菜"],
      avoidIngredients: ["香菜"],
      avoidStyles: ["甜食"],
      maxCookingTime: 30,
      preferredSpiceLevel: 3,
      peopleCount: 4,
      mood: "想吃点清淡的",
    };
    const result = UserPreferenceSchema.parse(input);
    expect(result.flavors).toEqual(["辣", "鲜"]);
    expect(result.maxCookingTime).toBe(30);
  });

  it("applies defaults for missing fields", () => {
    const result = UserPreferenceSchema.parse({});
    expect(result.flavors).toEqual([]);
    expect(result.availableIngredients).toEqual([]);
    expect(result.avoidIngredients).toEqual([]);
    expect(result.avoidStyles).toEqual([]);
    expect(result.maxCookingTime).toBeNull();
    expect(result.preferredSpiceLevel).toBeNull();
    expect(result.peopleCount).toBeNull();
    expect(result.mood).toBeNull();
  });

  it("rejects spice level above 5", () => {
    expect(() =>
      UserPreferenceSchema.parse({ preferredSpiceLevel: 6 })
    ).toThrow();
  });

  it("rejects spice level below 0", () => {
    expect(() =>
      UserPreferenceSchema.parse({ preferredSpiceLevel: -1 })
    ).toThrow();
  });

  it("accepts null values for optional fields", () => {
    const result = UserPreferenceSchema.parse({
      maxCookingTime: null,
      preferredSpiceLevel: null,
      peopleCount: null,
      mood: null,
    });
    expect(result.maxCookingTime).toBeNull();
  });
});

describe("RecommendationSchema", () => {
  it("accepts valid recommendation", () => {
    const input = {
      recommendations: [
        {
          dishId: "abc-123",
          score: 85,
          reason: "Matches your taste",
          matchedIngredients: ["猪肉"],
          missingIngredients: ["料酒"],
        },
      ],
      summary: "推荐红烧肉",
    };
    const result = RecommendationSchema.parse(input);
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].score).toBe(85);
  });

  it("accepts empty recommendations array", () => {
    const result = RecommendationSchema.parse({
      recommendations: [],
      summary: "No matches",
    });
    expect(result.recommendations).toEqual([]);
  });

  it("rejects score above 100", () => {
    expect(() =>
      RecommendationSchema.parse({
        recommendations: [
          {
            dishId: "1",
            score: 101,
            reason: "test",
            matchedIngredients: [],
            missingIngredients: [],
          },
        ],
        summary: "test",
      })
    ).toThrow();
  });

  it("rejects negative score", () => {
    expect(() =>
      RecommendationSchema.parse({
        recommendations: [
          {
            dishId: "1",
            score: -1,
            reason: "test",
            matchedIngredients: [],
            missingIngredients: [],
          },
        ],
        summary: "test",
      })
    ).toThrow();
  });

  it("rejects missing required fields", () => {
    expect(() =>
      RecommendationSchema.parse({
        recommendations: [{ dishId: "1" }],
        summary: "test",
      })
    ).toThrow();
  });
});
