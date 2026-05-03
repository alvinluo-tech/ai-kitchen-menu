"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Props = {
  tags: string[];
  tagInput: string;
  onTagInputChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (tag: string) => void;
};

export function DishTags({ tags, tagInput, onTagInputChange, onAdd, onRemove }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={tagInput}
          onChange={(e) => onTagInputChange(e.target.value)}
          placeholder="例如：下饭、快手"
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={onAdd}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <Button type="button" variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => onRemove(tag)}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
