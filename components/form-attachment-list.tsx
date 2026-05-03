"use client";

import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/image-uploader";

export type FormAttachment = {
  title: string;
  content: string;
  image_url: string;
  is_public: boolean;
};

type FormAttachmentListProps = {
  attachments: FormAttachment[];
  onChange: (attachments: FormAttachment[]) => void;
  disabled?: boolean;
};

export function FormAttachmentList({ attachments, onChange, disabled }: FormAttachmentListProps) {
  const handleAdd = () => {
    onChange([
      ...attachments,
      { title: "", content: "", image_url: "", is_public: false },
    ]);
  };

  const handleRemove = (index: number) => {
    onChange(attachments.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof FormAttachment, value: string | boolean) => {
    const updated = [...attachments];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {attachments.map((attachment, index) => (
        <div
          key={index}
          className="p-4 bg-gray-50 rounded-lg border space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">附录 {index + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-500"
              onClick={() => handleRemove(index)}
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <Input
            value={attachment.title}
            onChange={(e) => handleUpdate(index, "title", e.target.value)}
            placeholder="标题（可选）"
            disabled={disabled}
          />

          <Textarea
            value={attachment.content}
            onChange={(e) => handleUpdate(index, "content", e.target.value)}
            placeholder="添加文字说明、烹饪步骤、小贴士等"
            rows={2}
            disabled={disabled}
          />

          <div className="space-y-2">
            <Label>图片（可选）</Label>
            {attachment.image_url ? (
              <div className="relative">
                <img
                  src={attachment.image_url}
                  alt="附录图片"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleUpdate(index, "image_url", "")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <ImageUploader
                onUpload={(url) => handleUpdate(index, "image_url", url)}
                disabled={disabled}
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`attachment_public_${index}`}
              checked={attachment.is_public}
              onChange={(e) => handleUpdate(index, "is_public", e.target.checked)}
              disabled={disabled}
              className="rounded"
            />
            <Label htmlFor={`attachment_public_${index}`} className="text-sm">
              公开（所有人可见）
            </Label>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={handleAdd}
        disabled={disabled}
        className="w-full gap-2"
      >
        <Plus className="h-4 w-4" />
        添加附录
      </Button>
    </div>
  );
}
