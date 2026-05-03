"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Dish } from "@/lib/dishes/types";
import slugify from "slugify";

const dishSchema = z.object({
  name: z.string().min(1, "请输入菜名"),
  slug: z.string().min(1, "请输入 slug"),
  description: z.string().min(1, "请输入描述"),
  story: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  cuisine: z.string().optional(),
  spice_level: z.number().min(0).max(5),
  difficulty: z.enum(["easy", "medium", "hard"]),
  cooking_time_minutes: z.number().positive().optional().nullable(),
  servings: z.number().positive().optional().nullable(),
  is_available: z.boolean(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      amount: z.string().optional(),
      is_required: z.boolean(),
    })
  ),
  tags: z.array(z.string()),
});

type DishFormData = z.infer<typeof dishSchema>;

type DishFormProps = {
  dish?: Dish;
  mode: "create" | "edit";
};

export function DishForm({ dish, mode }: DishFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ingredientInput, setIngredientInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DishFormData>({
    resolver: zodResolver(dishSchema),
    defaultValues: {
      name: dish?.name ?? "",
      slug: dish?.slug ?? "",
      description: dish?.description ?? "",
      story: dish?.story ?? "",
      image_url: dish?.image_url ?? "",
      cuisine: dish?.cuisine ?? "",
      spice_level: dish?.spice_level ?? 0,
      difficulty: dish?.difficulty ?? "easy",
      cooking_time_minutes: dish?.cooking_time_minutes ?? null,
      servings: dish?.servings ?? null,
      is_available: dish?.is_available ?? true,
      ingredients:
        dish?.dish_ingredients?.map((item) => ({
          name: item.ingredients.name,
          amount: item.amount ?? "",
          is_required: item.is_required,
        })) ?? [],
      tags: dish?.dish_tags?.map((tag) => tag.tag) ?? [],
    },
  });

  const ingredients = watch("ingredients");
  const tags = watch("tags");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("name", value);
    if (mode === "create") {
      setValue("slug", slugify(value, { lower: true, strict: true }));
    }
  };

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      const currentIngredients = watch("ingredients");
      setValue("ingredients", [
        ...currentIngredients,
        {
          name: ingredientInput.trim(),
          amount: amountInput.trim() || undefined,
          is_required: true,
        },
      ]);
      setIngredientInput("");
      setAmountInput("");
    }
  };

  const removeIngredient = (index: number) => {
    const currentIngredients = watch("ingredients");
    setValue(
      "ingredients",
      currentIngredients.filter((_, i) => i !== index)
    );
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue("tags", [...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setValue(
      "tags",
      tags.filter((t) => t !== tag)
    );
  };

  const onSubmit = async (data: DishFormData) => {
    setLoading(true);

    try {
      const url = mode === "create" ? "/api/dishes" : `/api/dishes/${dish?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/admin");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save dish:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">菜名 *</Label>
            <Input
              id="name"
              {...register("name")}
              onChange={handleNameChange}
              placeholder="例如：番茄炒蛋"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="例如：tomato-egg"
            />
            {errors.slug && (
              <p className="text-sm text-red-600">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述 *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="简单描述这道菜"
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="story">朋友的一句话</Label>
            <Textarea
              id="story"
              {...register("story")}
              placeholder="这道菜背后有什么故事？"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">图片 URL</Label>
            <Input
              id="image_url"
              {...register("image_url")}
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>菜品属性</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cuisine">菜系</Label>
              <Input
                id="cuisine"
                {...register("cuisine")}
                placeholder="例如：家常"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">难度</Label>
              <Select
                defaultValue={dish?.difficulty ?? "easy"}
                onValueChange={(value) =>
                  setValue("difficulty", value as "easy" | "medium" | "hard")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">简单</SelectItem>
                  <SelectItem value="medium">中等</SelectItem>
                  <SelectItem value="hard">困难</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="spice_level">辣度 (0-5)</Label>
              <Input
                id="spice_level"
                type="number"
                min="0"
                max="5"
                {...register("spice_level", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cooking_time_minutes">烹饪时间(分钟)</Label>
              <Input
                id="cooking_time_minutes"
                type="number"
                min="1"
                {...register("cooking_time_minutes", {
                  valueAsNumber: true,
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="servings">适合人数</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                {...register("servings", {
                  valueAsNumber: true,
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_available"
              {...register("is_available")}
              className="rounded"
            />
            <Label htmlFor="is_available">上架</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>食材</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              placeholder="食材名称"
              className="flex-1"
            />
            <Input
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="用量 (可选)"
              className="w-32"
            />
            <Button type="button" variant="outline" onClick={addIngredient}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {ingredients.length > 0 && (
            <div className="space-y-2">
              {ingredients.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                >
                  <span className="flex-1">{item.name}</span>
                  {item.amount && (
                    <span className="text-sm text-gray-500">{item.amount}</span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIngredient(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>标签</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="例如：下饭、快手"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              保存中...
            </>
          ) : mode === "create" ? (
            "创建菜品"
          ) : (
            "保存修改"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          取消
        </Button>
      </div>
    </form>
  );
}
