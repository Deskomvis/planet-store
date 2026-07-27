import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  if (categories.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Tambah Produk</h1>
        <p className="mt-4 text-sm text-neutral-600">
          Buat kategori terlebih dahulu sebelum menambah produk.
        </p>
        <Link
          href="/admin/kategori/baru"
          className="mt-4 inline-block rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Tambah Kategori
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900">Tambah Produk</h1>
      <div className="mt-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
