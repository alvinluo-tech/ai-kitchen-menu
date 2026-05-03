"use client";

import Image from "next/image";
import Link from "next/link";
import { ChefHat, Clock, Award, UtensilsCrossed } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ChefProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  specialties: string[] | null;
  years_of_cooking: number | null;
  social_link: string | null;
  dish_count?: number;
  dishes?: {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
    description: string;
  }[];
};

type ChefDetailDialogProps = {
  chef: ChefProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChefDetailDialog({ chef, open, onOpenChange }: ChefDetailDialogProps) {
  if (!chef) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-50 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              {chef.avatar_url ? (
                <Image
                  src={chef.avatar_url}
                  alt={chef.display_name || "厨师"}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              ) : (
                <ChefHat className="h-8 w-8 text-orange-300" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl">
                {chef.display_name || "匿名厨师"}
              </DialogTitle>
              <DialogDescription>
                {chef.years_of_cooking && (
                  <span className="flex items-center gap-1 mt-1">
                    <Clock className="h-3.5 w-3.5" />
                    {chef.years_of_cooking} 年烹饪经验
                  </span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {chef.bio && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">个人简介</h4>
              <p className="text-sm text-gray-700">{chef.bio}</p>
            </div>
          )}

          {chef.specialties && chef.specialties.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">擅长菜系</h4>
              <div className="flex flex-wrap gap-2">
                {chef.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <UtensilsCrossed className="h-4 w-4" />
            <span>{chef.dish_count || 0} 道拿手菜</span>
          </div>

          {chef.dishes && chef.dishes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">部分菜品</h4>
              <div className="grid grid-cols-2 gap-2">
                {chef.dishes.slice(0, 4).map((dish) => (
                  <Link
                    key={dish.id}
                    href={`/menu/${dish.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-50 rounded flex-shrink-0 overflow-hidden">
                      {dish.image_url ? (
                        <Image
                          src={dish.image_url}
                          alt={dish.name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UtensilsCrossed className="h-4 w-4 text-orange-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{dish.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{dish.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button render={<Link href={`/chefs/${chef.id}`} onClick={() => onOpenChange(false)} />} variant="outline" className="w-full gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              查看全部菜品
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
