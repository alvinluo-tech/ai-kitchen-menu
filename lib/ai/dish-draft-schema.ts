import { z } from "zod";

export const DishDraftSchema = z.object({
  name: z.string().describe("菜品名称"),
  description: z.string().describe("菜品简介，1-2句话"),
  story: z.string().describe("朋友的一句话，有温度的描述"),
  cuisine: z.string().describe("菜系，如：家常、川菜、粤菜等"),
  spice_level: z.number().min(0).max(5).describe("辣度，0-5"),
  difficulty: z.enum(["easy", "medium", "hard"]).describe("难度"),
  cooking_time_minutes: z.number().describe("烹饪时间（分钟）"),
  servings: z.number().describe("适合人数"),
  ingredients: z.array(
    z.object({
      name: z.string().describe("食材名称"),
      amount: z.string().optional().describe("用量，如：2个、300g"),
      is_required: z.boolean().describe("是否必需"),
    })
  ).describe("食材列表"),
  tags: z.array(z.string()).describe("风味标签，如：下饭、家常、快手"),
});

export type DishDraft = z.infer<typeof DishDraftSchema>;
