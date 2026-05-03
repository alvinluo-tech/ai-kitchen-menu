"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, GripVertical, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/image-uploader";
import type { DishAttachment } from "@/lib/dishes/attachment-types";

type AttachmentFormProps = {
  dishId: string;
  isOwner: boolean;
};

export function AttachmentForm({ dishId, isOwner }: AttachmentFormProps) {
  const [attachments, setAttachments] = useState<DishAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAttachments();
  }, [dishId]);

  const fetchAttachments = async () => {
    try {
      const response = await fetch(`/api/dishes/${dishId}/attachments`);
      const data = await response.json();
      if (response.ok) {
        setAttachments(data.attachments || []);
      }
    } catch (err) {
      console.error("Failed to fetch attachments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!title.trim() && !content.trim() && !imageUrl) {
      setError("请至少填写一项内容");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/dishes/${dishId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || null,
          content: content.trim() || null,
          image_url: imageUrl || null,
          is_public: isPublic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "添加失败");
        return;
      }

      setAttachments([...attachments, data.attachment]);
      setTitle("");
      setContent("");
      setImageUrl("");
      setIsPublic(false);
    } catch {
      setError("添加失败，请稍后再试");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm("确定要删除这个附件吗？")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/dishes/${dishId}/attachments?id=${attachmentId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setAttachments(attachments.filter((a) => a.id !== attachmentId));
      }
    } catch (err) {
      console.error("Failed to delete attachment:", err);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">附录</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {attachments.length > 0 && (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {attachment.title && (
                      <h4 className="font-medium text-sm mb-1">
                        {attachment.title}
                      </h4>
                    )}
                    {attachment.content && (
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {attachment.content}
                      </p>
                    )}
                    {attachment.image_url && (
                      <div className="mt-2">
                        <img
                          src={attachment.image_url}
                          alt={attachment.title || "附件图片"}
                          className="max-w-full h-auto max-h-48 rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      {attachment.is_public ? (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> 公开
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <EyeOff className="h-3 w-3" /> 仅自己可见
                        </span>
                      )}
                    </div>
                  </div>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-500"
                      onClick={() => handleDelete(attachment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {isOwner && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium text-sm">添加附录</h4>

            <div className="space-y-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="标题（可选）"
              />
            </div>

            <div className="space-y-2">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="添加文字说明、烹饪步骤、小贴士等"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>图片（可选）</Label>
              <ImageUploader
                value={imageUrl || undefined}
                onChange={setImageUrl}
                disabled={saving}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="is_public" className="text-sm">
                公开（所有人可见）
              </Label>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <Button
              onClick={handleAdd}
              disabled={saving || (!title.trim() && !content.trim() && !imageUrl)}
              className="gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  添加中...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  添加
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
