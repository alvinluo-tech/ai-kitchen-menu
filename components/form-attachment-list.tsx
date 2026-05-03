"use client";

import { useState } from "react";
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
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    if (!title.trim() && !content.trim() && !imageUrl) {
      setError("请至少填写一项内容");
      return;
    }

    onChange([
      ...attachments,
      {
        title: title.trim(),
        content: content.trim(),
        image_url: imageUrl,
        is_public: isPublic,
      },
    ]);

    setTitle("");
    setContent("");
    setImageUrl("");
    setIsPublic(false);
    setError(null);
  };

  const handleRemove = (index: number) => {
    onChange(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex-1 min-w-0">
                {attachment.title && (
                  <p className="font-medium text-sm">{attachment.title}</p>
                )}
                {attachment.content && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {attachment.content}
                  </p>
                )}
                {attachment.image_url && (
                  <p className="text-xs text-gray-500 mt-1">已上传图片</p>
                )}
                <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  {attachment.is_public ? (
                    <><Eye className="h-3 w-3" /> 公开</>
                  ) : (
                    <><EyeOff className="h-3 w-3" /> 仅自己可见</>
                  )}
                </span>
              </div>
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
          ))}
        </div>
      )}

      <div className="border-t pt-4 space-y-3">
        <div className="space-y-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="标题（可选）"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="添加文字说明、烹饪步骤、小贴士等"
            rows={2}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label>图片（可选）</Label>
          <ImageUploader
            value={imageUrl || undefined}
            onChange={setImageUrl}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="attachment_public"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            disabled={disabled}
            className="rounded"
          />
          <Label htmlFor="attachment_public" className="text-sm">
            公开（所有人可见）
          </Label>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={handleAdd}
          disabled={disabled || (!title.trim() && !content.trim() && !imageUrl)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          添加附录
        </Button>
      </div>
    </div>
  );
}
