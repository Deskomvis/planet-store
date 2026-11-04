import type { Metadata } from "next";
import { PriceCatalog } from "@/components/price-catalog";
import Link from "next/link";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Katalog Harga",
  description: "Katalog produk dan harga Gudang Planet.",
};

export default async function PriceCatalogPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { products: { orderBy: { createdAt: "desc" } } },
  });
  const populated = categories.filter((category) => category.products.length > 0);

  return (
    <>
      <Suspense fallback={null}><SiteHeader /></Suspense>
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
        <Link href="/" className="text-sm font-medium text-neutral-500 hover:text-neutral-900">← Beranda</Link>
        <div className="mt-5 border-b border-neutral-200 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Gudang Planet</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">Katalog Produk</h1>
          <p className="mt-2 text-sm text-neutral-500">Pilih kategori untuk melihat varian produk, harga, dan keterangannya.</p>
        </div>
        <PriceCatalog categories={populated} />
      </main>
      <SiteFooter />
    </>
  );
}
