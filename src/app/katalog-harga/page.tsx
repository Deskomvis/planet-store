import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Daftar Harga",
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
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">Daftar Harga</h1>
          <p className="mt-2 text-sm text-neutral-500">Pilih kategori untuk melihat varian produk, harga, dan keterangannya.</p>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-6">
          {populated.map((category) => {
            const image = category.imageUrl || category.products[0]?.imageUrl;
            return <Link key={category.id} href={`/katalog-harga/${category.slug}`} className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4">
              <div className="relative aspect-square overflow-hidden bg-neutral-100">
                {image ? <Image src={image} alt={category.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none" /> : <span className="flex h-full items-center justify-center text-sm text-neutral-400">Tidak ada gambar</span>}
              </div>
              <div className="p-4 sm:p-5"><h2 className="font-semibold text-neutral-900 sm:text-lg">{category.name}</h2><p className="mt-1 text-xs text-neutral-500 sm:text-sm">{category.products.length} varian produk →</p></div>
            </Link>;
          })}
        </div>
        {populated.length === 0 && <p className="py-10 text-sm text-neutral-500">Belum ada produk di katalog.</p>}
      </main>
      <SiteFooter />
    </>
  );
}
