import { z } from "zod";

export const UserPreferenceSchema = z.object({
  flavors: z.array(z.string()).default([]),
  availableIngredients: z.array(z.string()).default([]),
  avoidIngredients: z.array(z.string()).default([]),
  avoidStyles: z.array(z.string()).default([]),
  maxCookingTime: z.number().nullable().default(null),
  preferredSpiceLevel: z.number().min(0).max(5).nullable().default(null),
  peopleCount: z.number().nullable().default(null),
  mood: z.string().nullable().default(null),
});

export const RecommendationSchema = z.object({
  recommendations: z.array(
    z.object({
      dishId: z.string(),
      score: z.number().min(0).max(100),
      reason: z.string(),
      matchedIngredients: z.array(z.string()),
      missingIngredients: z.array(z.string()),
    })
  ),
  summary: z.string(),
});

export type UserPreference = z.infer<typeof UserPreferenceSchema>;
export type RecommendationOutput = z.infer<typeof RecommendationSchema>;
