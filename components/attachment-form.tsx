"use client";

import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/image-uploader";

export type FormAttachment = {
  title: string;
  content: string;
  image_urls: string[];
  is_public: boolean;
};

type AttachmentFormProps = {
  attachment: FormAttachment;
  onChange: (attachment: FormAttachment) => void;
  disabled?: boolean;
};

export function AttachmentForm({ attachment, onChange, disabled }: AttachmentFormProps) {
  const handleUpdate = (field: keyof FormAttachment, value: string | boolean | string[]) => {
    onChange({ ...attachment, [field]: value });
  };

  const handleAddImage = (url: string) => {
    handleUpdate("image_urls", [...attachment.image_urls, url]);
  };

  const handleRemoveImage = (index: number) => {
    handleUpdate(
      "image_urls",
      attachment.image_urls.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-4">
      <Input
        value={attachment.title}
        onChange={(e) => handleUpdate("title", e.target.value)}
        placeholder="附录标题（可选）"
        disabled={disabled}
      />

      <Textarea
        value={attachment.content}
        onChange={(e) => handleUpdate("content", e.target.value)}
        placeholder="添加文字说明、烹饪步骤、小贴士等"
        rows={3}
        disabled={disabled}
      />

      <div className="space-y-2">
        <Label>图片（可选，可上传多张）</Label>
        
        {attachment.image_urls.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {attachment.image_urls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`附录图片 ${index + 1}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  disabled={disabled}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <ImageUploader
          onUpload={handleAddImage}
          disabled={disabled}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="attachment_public"
          checked={attachment.is_public}
          onChange={(e) => handleUpdate("is_public", e.target.checked)}
          disabled={disabled}
          className="rounded"
        />
        <Label htmlFor="attachment_public" className="text-sm">
          公开（所有人可见）
        </Label>
      </div>
    </div>
  );
}
