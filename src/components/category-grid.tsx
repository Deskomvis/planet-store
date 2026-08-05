"use client";

import { useSearchParams } from "next/navigation";
import { CategoryCard } from "@/components/category-card";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

export function CategoryGrid({ categories }: { categories: CategoryItem[] }) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";

  const filtered = q
    ? categories.filter((category) => category.name.toLowerCase().includes(q))
    : categories;

  if (filtered.length === 0) {
    return <p className="mt-8 text-sm text-neutral-500">Kategori tidak ditemukan.</p>;
  }

  return (
    <div className="mt-6 grid grid-cols-2 items-stretch gap-2 sm:gap-4 lg:grid-cols-3">
      {filtered.map((category) => (
        <CategoryCard
          key={category.id}
          name={category.name}
          slug={category.slug}
          description={category.description}
          imageUrl={category.imageUrl}
        />
      ))}
    </div>
  );
}
