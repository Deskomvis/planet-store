import { prisma } from "@/lib/db";
import { CategoryManagement } from "@/components/admin/category-management";

export default async function AdminDashboardPage() {
  const [categoryCount, productCount, outOfStockCount, testimonialCount] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.product.count({ where: { inStock: false } }),
    prisma.testimonial.count(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">Ringkasan katalog Planet Store.</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <p className="text-sm text-neutral-500">Total Testimoni</p>
            <p className="mt-1 text-2xl font-bold text-neutral-900">{testimonialCount}</p>
          </div>
        </div>
      </div>

      <CategoryManagement />
    </div>
  );
}
