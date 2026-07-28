import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CategoryForm } from "@/components/admin/category-form";
import { CategoryProductsManager } from "@/components/admin/category-products-manager";

type Props = { params: Promise<{ id: string }> };

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: { products: { orderBy: { createdAt: "asc" } } },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          aria-label="Kembali ke dashboard"
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-neutral-900">Edit Kategori</h1>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <CategoryForm
          categoryId={category.id}
          initialName={category.name}
          initialDescription={category.description}
          initialImageUrl={category.imageUrl}
        />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <CategoryProductsManager
          categoryId={category.id}
          categoryName={category.name}
          initialProducts={category.products}
        />
      </div>
    </div>
  );
}
