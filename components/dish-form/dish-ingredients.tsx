"use client";

import { Plus, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Ingredient = { name: string; amount?: string; is_required: boolean };

type Props = {
  ingredients: Ingredient[];
  ingredientInput: string;
  amountInput: string;
  editingIndex: number | null;
  onIngredientInputChange: (v: string) => void;
  onAmountInputChange: (v: string) => void;
  onAdd: () => void;
  onEdit: (index: number) => void;
  onCancelEdit: () => void;
  onRemove: (index: number) => void;
};

export function DishIngredients({
  ingredients,
  ingredientInput,
  amountInput,
  editingIndex,
  onIngredientInputChange,
  onAmountInputChange,
  onAdd,
  onEdit,
  onCancelEdit,
  onRemove,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={ingredientInput} onChange={(e) => onIngredientInputChange(e.target.value)} placeholder="食材名称" className="flex-1" />
        <Input value={amountInput} onChange={(e) => onAmountInputChange(e.target.value)} placeholder="用量 (可选)" className="w-32" />
        <Button type="button" variant="outline" onClick={onAdd}>
          {editingIndex !== null ? "更新" : <Plus className="h-4 w-4" />}
        </Button>
        {editingIndex !== null && (
          <Button type="button" variant="ghost" onClick={onCancelEdit}>取消</Button>
        )}
      </div>

      {ingredients.length > 0 && (
        <div className="space-y-2">
          {ingredients.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 p-2 rounded ${
                editingIndex === index ? "bg-orange-50 border border-orange-200" : "bg-gray-50"
              }`}
            >
              <span className="flex-1">{item.name}</span>
              {item.amount && <span className="text-sm text-gray-500">{item.amount}</span>}
              <Button type="button" variant="ghost" size="icon" onClick={() => onEdit(index)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
