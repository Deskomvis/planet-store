import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { CategoryManagement } from "@/components/admin/category-management";
import { BannerManagement } from "@/components/admin/banner-management";

export default async function AdminDashboardPage() {
  const session = await getSession();
  const isFullAdmin = session?.role === "admin";

  if (!isFullAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Kategori & Produk</h1>
          <p className="mt-1 text-sm text-neutral-500">Kelola kategori dan produk katalog Gudang Planet.</p>
        </div>
        <CategoryManagement />
      </div>
    );
  }

  const [categoryCount, productCount, outOfStockCount, testimonialCount, banners] =
    await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.product.count({ where: { inStock: false } }),
      prisma.testimonial.count(),
      prisma.banner.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">Ringkasan katalog Gudang Planet.</p>

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

      <BannerManagement initialBanners={banners} />

      <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Testimoni</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {testimonialCount} video testimoni pelanggan tersimpan.
          </p>
        </div>
        <Link
          href="/admin/testimoni?new=1"
          className="flex items-center gap-2 cursor-pointer rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Testimoni
        </Link>
      </div>
    </div>
  );
}
