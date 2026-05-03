"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MagicWandButton } from "@/components/magic-wand-button";

type Props = {
  register: any;
  errors: any;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAssistDescription: () => void;
  onAssistStory: () => void;
  loading: boolean;
};

export function DishBasicInfo({ register, errors, onNameChange, onAssistDescription, onAssistStory, loading }: Props) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">菜名 *</Label>
        <Input id="name" {...register("name")} onChange={onNameChange} placeholder="例如：番茄炒蛋" />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="description">描述 *</Label>
          <MagicWandButton onClick={onAssistDescription} disabled={loading} />
        </div>
        <Textarea id="description" {...register("description")} placeholder="简单描述这道菜" />
        {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="story">朋友的一句话</Label>
          <MagicWandButton onClick={onAssistStory} disabled={loading} />
        </div>
        <Textarea id="story" {...register("story")} placeholder="这道菜背后有什么故事？" />
      </div>
    </>
  );
}
