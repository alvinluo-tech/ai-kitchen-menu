"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EmptyState } from "@/components/empty-state";
import { ChefDetailDialog } from "@/components/chef-detail-dialog";
import { ChefHat, Clock, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

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

type ChefsPageClientProps = {
  chefs: ChefProfile[];
};

export function ChefsPageClient({ chefs }: ChefsPageClientProps) {
  const [selectedChef, setSelectedChef] = useState<ChefProfile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleChefClick = (chef: ChefProfile) => {
    setSelectedChef(chef);
    setDialogOpen(true);
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">厨师风采</h1>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
              认识为你做菜的朋友们，了解他们的拿手好菜和烹饪故事
            </p>
          </div>

          {chefs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
              {chefs.map((chef) => (
                <Card
                  key={chef.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleChefClick(chef)}
                >
                  <div className="h-32 bg-gradient-to-br from-orange-100 to-amber-50 relative">
                    {chef.avatar_url ? (
                      <Image
                        src={chef.avatar_url}
                        alt={chef.display_name || "厨师"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="h-16 w-16 text-orange-200" />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4 md:p-6 -mt-8 relative">
                    <div className="w-16 h-16 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center mb-3">
                      {chef.avatar_url ? (
                        <Image
                          src={chef.avatar_url}
                          alt={chef.display_name || "厨师"}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <ChefHat className="h-8 w-8 text-orange-400" />
                      )}
                    </div>

                    <h3 className="font-bold text-lg mb-1">
                      {chef.display_name || "匿名厨师"}
                    </h3>

                    {chef.bio && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {chef.bio}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-500">
                      {chef.years_of_cooking && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{chef.years_of_cooking} 年经验</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" />
                        <span>{chef.dish_count} 道菜</span>
                      </div>
                    </div>

                    {chef.specialties && chef.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {chef.specialties.slice(0, 4).map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="暂无厨师展示"
              description="还没有厨师开放个人展示，敬请期待。"
            />
          )}
        </div>
      </main>
      <SiteFooter />

      <ChefDetailDialog
        chef={selectedChef}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
