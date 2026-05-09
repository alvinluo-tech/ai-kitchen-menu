"use client";

import { Plus, Pencil, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  onReorder: (fromIndex: number, toIndex: number) => void;
};

type SortableIngredientProps = {
  item: Ingredient;
  index: number;
  editingIndex: number | null;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
};

function SortableIngredient({ item, index, editingIndex, onEdit, onRemove }: SortableIngredientProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 rounded ${
        editingIndex === index ? "bg-orange-50 border border-orange-200" : "bg-gray-50"
      }`}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-1">{item.name}</span>
      {item.amount && <span className="text-sm text-gray-500">{item.amount}</span>}
      <Button type="button" variant="ghost" size="icon" onClick={() => onEdit(index)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(index)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

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
  onReorder,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(Number(active.id), Number(over.id));
    }
  };

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={ingredients.map((_, i) => i.toString())}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {ingredients.map((item, index) => (
                <SortableIngredient
                  key={index}
                  item={item}
                  index={index}
                  editingIndex={editingIndex}
                  onEdit={onEdit}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
