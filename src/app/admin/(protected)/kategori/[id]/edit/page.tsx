import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CategoryForm } from "@/components/admin/category-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900">Edit Kategori</h1>
      <div className="mt-6">
        <CategoryForm
          categoryId={category.id}
          initialName={category.name}
          initialDescription={category.description}
          initialImageUrl={category.imageUrl}
        />
      </div>
    </div>
  );
}
