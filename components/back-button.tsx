"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      className="mb-4 md:mb-6 gap-2 text-sm"
      onClick={() => router.back()}
    >
      <ArrowLeft className="h-4 w-4" />
      返回
    </Button>
  );
}
