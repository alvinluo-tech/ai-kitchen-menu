"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UseFormSetValue } from "react-hook-form";

type Props = {
  register: any;
  setValue: UseFormSetValue<any>;
  difficulty?: string;
};

export function DishAttributes({ register, setValue, difficulty }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cuisine">菜系</Label>
          <Input id="cuisine" {...register("cuisine")} placeholder="例如：家常" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">难度</Label>
          <Select
            defaultValue={difficulty ?? "easy"}
            onValueChange={(value) => setValue("difficulty", value as "easy" | "medium" | "hard")}
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
          <Input id="spice_level" type="number" min="0" max="5" {...register("spice_level", { valueAsNumber: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cooking_time_minutes">烹饪时间(分钟)</Label>
          <Input
            id="cooking_time_minutes"
            type="number"
            min="1"
            {...register("cooking_time_minutes", {
              valueAsNumber: true,
              setValueAs: (v: string) => (v === "" ? null : Number(v)),
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="servings">适合人数</Label>
          <Input
            id="servings"
            placeholder="例如：3-4"
            {...register("servings")}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="is_available" {...register("is_available")} className="rounded" />
        <Label htmlFor="is_available">上架</Label>
      </div>
    </div>
  );
}
