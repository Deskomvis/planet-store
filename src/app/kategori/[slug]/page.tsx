import type { Metadata } from "next";
import Link from "next/link";
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
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <nav className="text-sm text-neutral-500">
          <Link href="/" className="hover:underline">
            Katalog
          </Link>{" "}
          / <span className="text-neutral-900">{category.name}</span>
        </nav>

        <h1 className="mt-2 text-xl font-bold text-neutral-900">{category.name}</h1>
        <p className="mt-1 text-sm text-neutral-500">{category.products.length} produk</p>

        {category.products.length === 0 ? (
          <p className="mt-8 text-sm text-neutral-500">Belum ada produk di kategori ini.</p>
        ) : (
          <CategoryProductGrid
            products={category.products}
            categoryName={category.name}
            whatsappNumber={whatsappNumber}
            whatsappMessageTemplate={whatsappMessageTemplate}
          />
        )}
      </main>
      <SiteFooter />
    </>
  );
}
