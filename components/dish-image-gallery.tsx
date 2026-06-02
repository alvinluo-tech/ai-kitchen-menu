"use client";

import { useState } from "react";
import Image from "next/image";
import { ChefHat } from "lucide-react";
import { ImageLightbox } from "@/components/image-lightbox";

type DishImageGalleryProps = {
  images: string[];
  dishName: string;
};

export function DishImageGallery({ images, dishName }: DishImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (images.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center rounded-t-2xl">
        <ChefHat className="h-16 w-16 md:h-24 md:w-24 text-orange-200" />
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <>
        <button
          type="button"
          className="aspect-[16/9] relative rounded-t-2xl overflow-hidden cursor-pointer w-full"
          onClick={() => openLightbox(0)}
        >
          <img
            src={images[0]}
            alt={dishName}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </button>
        <ImageLightbox
          images={images}
          initialIndex={0}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          alt={dishName}
        />
      </>
    );
  }

  return (
    <>
      <div>
        <button
          type="button"
          className="aspect-[16/9] relative overflow-hidden cursor-pointer w-full"
          onClick={() => openLightbox(selectedIndex)}
        >
          <img
            src={images[selectedIndex]}
            alt={`${dishName} - 图片 ${selectedIndex + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </button>

        <div className="flex gap-2 p-2 overflow-x-auto bg-gray-900/90">
          {images.map((url, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedIndex
                  ? "border-orange-400 opacity-100 scale-105"
                  : "border-transparent opacity-60 hover:opacity-80"
              }`}
            >
              <Image
                src={url}
                alt={`${dishName} - 缩略图 ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
      <ImageLightbox
        images={images}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        alt={dishName}
      />
    </>
  );
}
