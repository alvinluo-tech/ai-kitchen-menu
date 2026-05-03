"use client";

import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type MagicWandButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export function MagicWandButton({ onClick, disabled }: MagicWandButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-6 w-6 text-orange-400 hover:text-orange-600 hover:bg-orange-50"
      onClick={onClick}
      disabled={disabled}
      title="AI 助写"
    >
      <Wand2 className="h-3.5 w-3.5" />
    </Button>
  );
}
