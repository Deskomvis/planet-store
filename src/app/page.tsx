import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CategoryCard } from "@/components/category-card";

export const revalidate = 300; // ISR: re-generate at most every 5 minutes

export const metadata: Metadata = {
  title: "Katalog Produk",
  description:
    "Daftar kategori produk Planet Store: kain, koko dewasa, gamis anak, dan perlengkapan sholat.",
};

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <h1 className="text-xl font-bold text-neutral-900">Kategori Produk</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Pilih kategori untuk melihat daftar produk.
        </p>

        {categories.length === 0 ? (
          <p className="mt-8 text-sm text-neutral-500">Belum ada kategori.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                name={category.name}
                slug={category.slug}
                description={category.description}
                imageUrl={category.imageUrl}
              />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
