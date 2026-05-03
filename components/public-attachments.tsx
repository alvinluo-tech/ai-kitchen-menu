"use client";

import { useState, useEffect } from "react";
import { Loader2, BookOpen, Lock, Eye } from "lucide-react";
import type { DishAttachment } from "@/lib/dishes/attachment-types";

type PublicAttachmentsProps = {
  dishId: string;
  isOwner?: boolean;
};

export function PublicAttachments({ dishId, isOwner = false }: PublicAttachmentsProps) {
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
      <div className="mt-8 md:mt-12">
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
        </div>
      </div>
    );
  }

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 md:mt-12">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100 via-amber-50 to-orange-100 rounded-2xl" />
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl shadow-md">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                附录
              </h3>
              <p className="text-xs text-gray-500">更多详细信息</p>
            </div>
          </div>

          <div className="space-y-6">
            {attachments.map((attachment, attachmentIndex) => (
              <div
                key={attachment.id}
                className="group"
              >
                {attachmentIndex > 0 && (
                  <div className="h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent mb-6" />
                )}

                {attachment.title && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                    <h4 className="font-semibold text-sm md:text-base text-gray-800">
                      {attachment.title}
                    </h4>
                    {isOwner && (
                      <div className="flex items-center gap-1 ml-auto">
                        {attachment.is_public ? (
                          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <Eye className="h-3 w-3" />
                            <span>公开</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            <Lock className="h-3 w-3" />
                            <span>仅自己可见</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {attachment.content && (
                  <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-xl p-4 mb-4">
                    <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {attachment.content}
                    </p>
                  </div>
                )}

                {attachment.image_urls && attachment.image_urls.length > 0 && (
                  <div className={
                    attachment.image_urls.length === 1
                      ? "max-w-md mx-auto"
                      : "grid grid-cols-2 gap-3"
                  }>
                    {attachment.image_urls.map((url, index) => (
                      <div
                        key={index}
                        className="relative group/img"
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-200 to-amber-200 rounded-xl opacity-0 group-hover/img:opacity-100 transition-opacity duration-300" />
                        <img
                          src={url}
                          alt={attachment.title || `附录图片 ${index + 1}`}
                          className="relative w-full aspect-square object-cover rounded-xl shadow-md"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
