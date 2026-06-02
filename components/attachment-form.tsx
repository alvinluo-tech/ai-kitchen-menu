"use client";

import { Trash2, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/image-uploader";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ImageLightbox } from "@/components/image-lightbox";
import { useState } from "react";

export type FormAttachment = {
  title: string;
  content: string;
  image_urls: string[];
  is_public: boolean;
};

type AttachmentFormProps = {
  attachment: FormAttachment;
  onChange: (attachment: FormAttachment | ((prev: FormAttachment) => FormAttachment)) => void;
  disabled?: boolean;
};

type SortableAttachmentImageProps = {
  url: string;
  index: number;
  onRemove: (index: number) => void;
  onClick: () => void;
  disabled?: boolean;
};

function SortableAttachmentImage({ url, index, onRemove, onClick, disabled }: SortableAttachmentImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `attachment-image-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group touch-manipulation"
      {...attributes}
      {...listeners}
    >
      <img
        src={url}
        alt={`附录图片 ${index + 1}`}
        className="w-full aspect-square object-cover rounded-lg cursor-pointer"
        onClick={onClick}
      />
      <div className="absolute top-1 left-1 p-1 bg-black/50 rounded text-white/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <GripVertical className="h-3 w-3" />
      </div>
      <button
        type="button"
        onClick={() => onRemove(index)}
        disabled={disabled}
        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

export function AttachmentForm({ attachment, onChange, disabled }: AttachmentFormProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const handleUpdate = (field: keyof FormAttachment, value: string | boolean | string[]) => {
    onChange({ ...attachment, [field]: value });
  };

  const handleAddImage = (url: string) => {
    onChange((prev) => ({
      ...prev,
      image_urls: [...prev.image_urls, url],
    }));
  };

  const handleRemoveImage = (index: number) => {
    handleUpdate(
      "image_urls",
      attachment.image_urls.filter((_, i) => i !== index)
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = Number(String(active.id).replace("attachment-image-", ""));
      const newIndex = Number(String(over.id).replace("attachment-image-", ""));
      onChange((prev) => ({
        ...prev,
        image_urls: arrayMove(prev.image_urls, oldIndex, newIndex),
      }));
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={attachment.image_urls.map((_, i) => `attachment-image-${i}`)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 gap-2">
                {attachment.image_urls.map((url, index) => (
                  <SortableAttachmentImage
                    key={`attachment-image-${index}`}
                    url={url}
                    index={index}
                    onRemove={handleRemoveImage}
                    onClick={() => openLightbox(index)}
                    disabled={disabled}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
      <ImageLightbox
        images={attachment.image_urls}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        alt="附录图片"
      />
    </div>
  );
}
