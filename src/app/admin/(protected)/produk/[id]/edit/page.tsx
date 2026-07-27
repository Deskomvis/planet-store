import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900">Edit Produk</h1>
      <div className="mt-6">
        <ProductForm
          categories={categories}
          productId={product.id}
          initial={{
            name: product.name,
            description: product.description,
            inStock: product.inStock,
            imageUrl: product.imageUrl,
            categoryId: product.categoryId,
          }}
        />
      </div>
    </div>
  );
}
