"use client";

import { useState, useEffect } from "react";
import { Loader2, FileText, Image as ImageIcon } from "lucide-react";
import type { DishAttachment } from "@/lib/dishes/attachment-types";

type PublicAttachmentsProps = {
  dishId: string;
};

export function PublicAttachments({ dishId }: PublicAttachmentsProps) {
  const [attachments, setAttachments] = useState<DishAttachment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchAttachments();
  }, [dishId]);

  if (loading) {
    return (
      <div className="mt-6 md:mt-8">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 md:mt-8">
      <h3 className="font-medium text-base md:text-lg mb-4">附录</h3>
      <div className="space-y-4">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="bg-white rounded-xl shadow-sm border p-4"
          >
            {attachment.title && (
              <h4 className="font-medium text-sm mb-2">{attachment.title}</h4>
            )}
            {attachment.content && (
              <p className="text-sm text-gray-600 whitespace-pre-wrap mb-3">
                {attachment.content}
              </p>
            )}
            {attachment.image_urls && attachment.image_urls.length > 0 && (
              <div className="mt-2 space-y-2">
                {attachment.image_urls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={attachment.title || `附录图片 ${index + 1}`}
                    className="w-full h-auto max-h-96 object-contain rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
