import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CategoryProductGrid } from "@/components/category-product-grid";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: { products: { orderBy: { createdAt: "desc" } } },
  });
}

async function getWhatsappSettings() {
  const settings = await prisma.storeSettings.findUnique({ where: { id: "settings" } });
  return {
    whatsappNumber: settings?.whatsappNumber ?? null,
    whatsappMessageTemplate: settings?.whatsappMessageTemplate ?? null,
  };
}

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({ select: { slug: true } });
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return { title: "Kategori tidak ditemukan" };
  }

  return {
    title: category.name,
    description: `Daftar produk dalam kategori ${category.name} di Planet Store.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [category, { whatsappNumber, whatsappMessageTemplate }] = await Promise.all([
    getCategory(slug),
    getWhatsappSettings(),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <>
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Link
          href="/"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Katalog
        </Link>

        <nav aria-label="Breadcrumb" className="mt-2 text-sm text-neutral-500">
          <Link href="/" className="hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            Katalog
          </Link>{" "}
          / <span aria-current="page" className="text-neutral-900">{category.name}</span>
        </nav>

        <h1 className="mt-2 text-xl font-bold text-neutral-900">{category.name}</h1>
        <p className="mt-1 text-sm text-neutral-500">{category.products.length} produk</p>

        {category.products.length === 0 ? (
          <p className="mt-8 text-sm text-neutral-500">Belum ada produk di kategori ini.</p>
        ) : (
          <Suspense fallback={null}>
            <CategoryProductGrid
              products={category.products}
              categoryName={category.name}
              whatsappNumber={whatsappNumber}
              whatsappMessageTemplate={whatsappMessageTemplate}
            />
          </Suspense>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
