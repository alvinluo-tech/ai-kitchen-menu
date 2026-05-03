"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, X, Pencil } from "lucide-react";
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
import { ImageUploader } from "@/components/image-uploader";
import { AiAssistForm } from "@/components/ai-assist-form";
import { MagicWandButton } from "@/components/magic-wand-button";
import { FieldAssistDialog } from "@/components/field-assist-dialog";
import { AttachmentForm, type FormAttachment } from "@/components/attachment-form";
import type { Dish } from "@/lib/dishes/types";
import type { DishDraft } from "@/lib/ai/dish-draft-schema";
import slugify from "slugify";

const dishSchema = z.object({
  name: z.string().min(1, "请输入菜名"),
  slug: z.string().optional(),
  description: z.string().min(1, "请输入描述"),
  story: z.string().optional(),
  image_url: z.string().optional().or(z.literal("")),
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
  const [assistField, setAssistField] = useState<"description" | "story" | "tags" | null>(null);
  const [editingIngredientIndex, setEditingIngredientIndex] = useState<number | null>(null);
  const [attachment, setAttachment] = useState<FormAttachment>({
    title: "",
    content: "",
    image_urls: [],
    is_public: false,
  });

  // 编辑模式下加载已有附录
  useEffect(() => {
    if (mode === "edit" && dish?.id) {
      fetch(`/api/dishes/${dish.id}/attachments`)
        .then((res) => res.json())
        .then((data) => {
          if (data.attachments && data.attachments.length > 0) {
            const a = data.attachments[0];
            setAttachment({
              title: a.title || "",
              content: a.content || "",
              image_urls: a.image_urls || [],
              is_public: a.is_public,
            });
          }
        })
        .catch(console.error);
    }
  }, [mode, dish?.id]);

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
  const imageUrl = watch("image_url");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("name", value);
  };

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      const currentIngredients = watch("ingredients");

      if (editingIngredientIndex !== null) {
        // 编辑模式
        const updated = [...currentIngredients];
        updated[editingIngredientIndex] = {
          name: ingredientInput.trim(),
          amount: amountInput.trim() || undefined,
          is_required: true,
        };
        setValue("ingredients", updated);
        setEditingIngredientIndex(null);
      } else {
        // 新增模式
        setValue("ingredients", [
          ...currentIngredients,
          {
            name: ingredientInput.trim(),
            amount: amountInput.trim() || undefined,
            is_required: true,
          },
        ]);
      }

      setIngredientInput("");
      setAmountInput("");
    }
  };

  const editIngredient = (index: number) => {
    const currentIngredients = watch("ingredients");
    const item = currentIngredients[index];
    setIngredientInput(item.name);
    setAmountInput(item.amount || "");
    setEditingIngredientIndex(index);
  };

  const cancelEditIngredient = () => {
    setIngredientInput("");
    setAmountInput("");
    setEditingIngredientIndex(null);
  };

  const removeIngredient = (index: number) => {
    const currentIngredients = watch("ingredients");
    setValue(
      "ingredients",
      currentIngredients.filter((_, i) => i !== index)
    );
    if (editingIngredientIndex === index) {
      cancelEditIngredient();
    }
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

  const handleDraftGenerated = (draft: DishDraft) => {
    setValue("name", draft.name);
    setValue("slug", slugify(draft.name, { lower: true, strict: true }));
    setValue("description", draft.description);
    setValue("story", draft.story);
    setValue("cuisine", draft.cuisine);
    setValue("spice_level", draft.spice_level);
    setValue("difficulty", draft.difficulty);
    setValue("cooking_time_minutes", draft.cooking_time_minutes);
    setValue("servings", draft.servings);
    setValue(
      "ingredients",
      draft.ingredients.map((item) => ({
        name: item.name,
        amount: item.amount || "",
        is_required: item.is_required,
      }))
    );
    setValue("tags", draft.tags);
  };

  const handleFieldAssistApply = (value: string | string[]) => {
    if (assistField === "tags" && Array.isArray(value)) {
      setValue("tags", value);
    } else if (typeof value === "string") {
      setValue(assistField!, value);
    }
  };

  const getDishContext = () => ({
    name: watch("name"),
    description: watch("description"),
    cuisine: watch("cuisine"),
    ingredients: watch("ingredients")?.map((i) => i.name) || [],
  });

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
        body: JSON.stringify({
          ...data,
          attachment: attachment.title || attachment.content || attachment.image_urls.length > 0
            ? {
                title: attachment.title,
                content: attachment.content,
                image_urls: attachment.image_urls,
                is_public: attachment.is_public,
              }
            : null,
        }),
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
      {mode === "create" && (
        <AiAssistForm onDraftGenerated={handleDraftGenerated} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>菜品图片</Label>
            <ImageUploader
              value={imageUrl || undefined}
              onChange={(url) => setValue("image_url", url)}
              disabled={loading}
            />
          </div>

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
            <div className="flex items-center gap-2">
              <Label htmlFor="description">描述 *</Label>
              <MagicWandButton
                onClick={() => setAssistField("description")}
                disabled={loading}
              />
            </div>
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
            <div className="flex items-center gap-2">
              <Label htmlFor="story">朋友的一句话</Label>
              <MagicWandButton
                onClick={() => setAssistField("story")}
                disabled={loading}
              />
            </div>
            <Textarea
              id="story"
              {...register("story")}
              placeholder="这道菜背后有什么故事？"
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
              {editingIngredientIndex !== null ? "更新" : <Plus className="h-4 w-4" />}
            </Button>
            {editingIngredientIndex !== null && (
              <Button type="button" variant="ghost" onClick={cancelEditIngredient}>
                取消
              </Button>
            )}
          </div>

          {ingredients.length > 0 && (
            <div className="space-y-2">
              {ingredients.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded ${
                    editingIngredientIndex === index
                      ? "bg-orange-50 border border-orange-200"
                      : "bg-gray-50"
                  }`}
                >
                  <span className="flex-1">{item.name}</span>
                  {item.amount && (
                    <span className="text-sm text-gray-500">{item.amount}</span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editIngredient(index)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
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
          <div className="flex items-center justify-between">
            <CardTitle>标签</CardTitle>
            <MagicWandButton
              onClick={() => setAssistField("tags")}
              disabled={loading}
            />
          </div>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">附录</CardTitle>
        </CardHeader>
        <CardContent>
          <AttachmentForm
            attachment={attachment}
            onChange={setAttachment}
            disabled={loading}
          />
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

      {assistField && (
        <FieldAssistDialog
          open={!!assistField}
          onOpenChange={(open) => !open && setAssistField(null)}
          field={assistField}
          currentValue={assistField === "tags" ? undefined : watch(assistField) || undefined}
          dishContext={getDishContext()}
          onApply={handleFieldAssistApply}
        />
      )}
    </form>
  );
}
