import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VariantSlider } from "@/components/price-catalog";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug }, select: { name: true } });
  return { title: category ? `${category.name} — Daftar Harga` : "Kategori tidak ditemukan" };
}

export default async function CatalogCategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug }, include: { products: { orderBy: { createdAt: "desc" }, take: 10 } } });
  if (!category) notFound();
  return <>
    <Suspense fallback={null}><SiteHeader /></Suspense>
    <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
      <Link href="/katalog-harga" className="text-sm font-medium text-neutral-500 hover:text-neutral-900">← Semua kategori</Link>
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-neutral-900">{category.name}</h1>
      {category.description && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-500">{category.description}</p>}
      <p className="mt-3 text-sm text-neutral-500">Menampilkan maksimal 10 contoh varian.</p>
      <div className="mt-7 overflow-hidden rounded-2xl border border-neutral-200"><VariantSlider category={category} /></div>
      <div className="mt-6 flex justify-center"><Link href={`/kategori/${category.slug}`} className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-700">Lihat katalog lengkap →</Link></div>
    </main>
    <SiteFooter />
  </>;
}
