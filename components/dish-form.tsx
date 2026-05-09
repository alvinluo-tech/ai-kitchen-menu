"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/image-uploader";
import { AiAssistForm } from "@/components/ai-assist-form";
import { MagicWandButton } from "@/components/magic-wand-button";
import { FieldAssistDialog } from "@/components/field-assist-dialog";
import { AttachmentForm, type FormAttachment } from "@/components/attachment-form";
import { DishBasicInfo } from "@/components/dish-form/dish-basic-info";
import { DishAttributes } from "@/components/dish-form/dish-attributes";
import { DishIngredients } from "@/components/dish-form/dish-ingredients";
import { DishTags } from "@/components/dish-form/dish-tags";
import type { Dish } from "@/lib/dishes/types";
import { getDishImageUrls } from "@/lib/dishes/types";
import type { DishDraft } from "@/lib/ai/dish-draft-schema";
import { arrayMove } from "@dnd-kit/sortable";
import slugify from "slugify";

export const dishSchema = z.object({
  name: z.string().min(1, "请输入菜名"),
  slug: z.string().optional(),
  description: z.string().min(1, "请输入描述"),
  story: z.string().optional(),
  image_urls: z.array(z.string()),
  cuisine: z.string().optional(),
  spice_level: z.number().min(0).max(5),
  difficulty: z.enum(["easy", "medium", "hard"]),
  cooking_time_minutes: z.number().positive().optional().nullable(),
  servings: z.string().optional().nullable(),
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
      image_urls: getDishImageUrls(dish?.image_url),
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
  const imageUrls = watch("image_urls");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("name", e.target.value);
  };

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      const currentIngredients = watch("ingredients");
      if (editingIngredientIndex !== null) {
        const updated = [...currentIngredients];
        updated[editingIngredientIndex] = {
          name: ingredientInput.trim(),
          amount: amountInput.trim() || undefined,
          is_required: true,
        };
        setValue("ingredients", updated);
        setEditingIngredientIndex(null);
      } else {
        setValue("ingredients", [
          ...currentIngredients,
          { name: ingredientInput.trim(), amount: amountInput.trim() || undefined, is_required: true },
        ]);
      }
      setIngredientInput("");
      setAmountInput("");
    }
  };

  const editIngredient = (index: number) => {
    const item = watch("ingredients")[index];
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
    const current = watch("ingredients");
    setValue("ingredients", current.filter((_, i) => i !== index));
    if (editingIngredientIndex === index) cancelEditIngredient();
  };

  const moveIngredient = (fromIndex: number, toIndex: number) => {
    const current = watch("ingredients");
    setValue("ingredients", arrayMove(current, fromIndex, toIndex));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue("tags", [...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setValue("tags", tags.filter((t) => t !== tag));
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
    setValue("ingredients", draft.ingredients.map((item) => ({
      name: item.name, amount: item.amount || "", is_required: item.is_required,
    })));
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          attachment: attachment.title || attachment.content || attachment.image_urls.length > 0
            ? { title: attachment.title, content: attachment.content, image_urls: attachment.image_urls, is_public: attachment.is_public }
            : null,
        }),
      });

      if (response.ok) {
        if (mode === "create") {
          try {
            sessionStorage.setItem("ai-kitchen-menu:optimistic-dish", JSON.stringify({
              id: "pending", name: data.name,
              slug: slugify(data.name, { lower: true, strict: true }),
              description: data.description, image_url: data.image_urls?.[0] || null,
              is_available: data.is_available, createdAt: Date.now(),
            }));
          } catch {}
        }
        const { toast } = await import("sonner");
        toast.success(mode === "create" ? "菜品创建成功" : "菜品更新成功");
        router.push("/admin");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save dish:", error);
      const { toast } = await import("sonner");
      toast.error("保存失败，请重试");
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
            <div className="text-sm font-medium">菜品图片</div>
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img src={url} alt={`菜品图片 ${index + 1}`} className="w-full aspect-square object-cover rounded-lg" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => setValue("image_urls", imageUrls.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <ImageUploader onUpload={(url) => setValue("image_urls", [...imageUrls, url])} disabled={loading} />
          </div>
          <DishBasicInfo
            register={register}
            errors={errors}
            onNameChange={handleNameChange}
            onAssistDescription={() => setAssistField("description")}
            onAssistStory={() => setAssistField("story")}
            loading={loading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>菜品属性</CardTitle>
        </CardHeader>
        <CardContent>
          <DishAttributes register={register} setValue={setValue} difficulty={dish?.difficulty} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>食材</CardTitle>
        </CardHeader>
        <CardContent>
          <DishIngredients
            ingredients={ingredients}
            ingredientInput={ingredientInput}
            amountInput={amountInput}
            editingIndex={editingIngredientIndex}
            onIngredientInputChange={setIngredientInput}
            onAmountInputChange={setAmountInput}
            onAdd={addIngredient}
            onEdit={editIngredient}
            onCancelEdit={cancelEditIngredient}
            onRemove={removeIngredient}
            onReorder={moveIngredient}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>标签</CardTitle>
            <MagicWandButton onClick={() => setAssistField("tags")} disabled={loading} />
          </div>
        </CardHeader>
        <CardContent>
          <DishTags
            tags={tags}
            tagInput={tagInput}
            onTagInputChange={setTagInput}
            onAdd={addTag}
            onRemove={removeTag}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">附录</CardTitle>
        </CardHeader>
        <CardContent>
          <AttachmentForm attachment={attachment} onChange={setAttachment} disabled={loading} />
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" />保存中...</>
          ) : mode === "create" ? "创建菜品" : "保存修改"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
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
