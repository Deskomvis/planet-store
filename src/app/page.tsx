import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CategoryGrid } from "@/components/category-grid";
import { extractMapEmbedSrc } from "@/lib/google-maps";

export const revalidate = 300; // ISR: re-generate at most every 5 minutes

export const metadata: Metadata = {
  title: "Katalog Produk",
  description:
    "Daftar kategori produk Gudang Planet: kain, koko dewasa, gamis anak, dan perlengkapan sholat.",
};

async function getCategories() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

async function getMapEmbedSrc() {
  const settings = await prisma.storeSettings.findUnique({ where: { id: "settings" } });
  return extractMapEmbedSrc(settings?.googleMapsEmbed);
}

export default async function HomePage() {
  const [categories, mapEmbedSrc] = await Promise.all([getCategories(), getMapEmbedSrc()]);

  return (
    <>
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <h1 className="text-xl font-bold text-neutral-900">Kategori Produk</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Pilih kategori untuk melihat daftar produk.
        </p>

        {categories.length === 0 ? (
          <p className="mt-8 text-sm text-neutral-500">Belum ada kategori.</p>
        ) : (
          <Suspense fallback={null}>
            <CategoryGrid categories={categories} />
          </Suspense>
        )}

        {mapEmbedSrc ? (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-neutral-900">Lokasi Kami</h2>
            <iframe
              src={mapEmbedSrc}
              width="100%"
              height="320"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="mt-3 w-full rounded-2xl border border-neutral-200"
            />
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
