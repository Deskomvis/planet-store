import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminDashboardPage() {
  const [categoryCount, productCount, outOfStockCount] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.product.count({ where: { inStock: false } }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">Ringkasan katalog Planet Store.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-sm text-neutral-500">Total Kategori</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{categoryCount}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-sm text-neutral-500">Total Produk</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{productCount}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-sm text-neutral-500">Stok Habis</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{outOfStockCount}</p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href="/admin/kategori"
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Kelola Kategori
        </Link>
      </div>
    </div>
  );
}
