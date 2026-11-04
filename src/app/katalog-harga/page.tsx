import type { Metadata } from "next";
import Image from "next/image";
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

const rupiah = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);

export default async function PriceCatalogPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { products: { orderBy: { createdAt: "desc" } } },
  });
  const populated = categories.filter((category) => category.products.length > 0);

  return (
    <>
      <Suspense fallback={null}><SiteHeader /></Suspense>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-12">
        <Link href="/" className="text-sm font-medium text-neutral-500 hover:text-neutral-900">← Beranda</Link>
        <div className="mt-5 border-b border-neutral-200 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Gudang Planet</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">Katalog Produk</h1>
          <p className="mt-2 text-sm text-neutral-500">Temukan produk, harga, dan keterangannya di sini.</p>
        </div>
        {populated.length === 0 ? <p className="py-10 text-sm text-neutral-500">Belum ada produk di katalog.</p> : populated.map((category) => (
          <section key={category.id} className="mt-8">
            <h2 className="text-lg font-bold text-neutral-900">{category.name}</h2>
            <div className="mt-3 divide-y divide-neutral-100">
              {category.products.map((product) => (
                <details key={product.id} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center gap-4 [&::-webkit-details-marker]:hidden">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-32 sm:w-32">
                      {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill sizes="128px" className="object-cover" /> : <span className="flex h-full items-center justify-center px-2 text-center text-xs text-neutral-400">Tidak ada gambar</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-neutral-900">{product.name}</h3>
                      {product.description ? <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-neutral-500">{product.description}</p> : null}
                      <p className="mt-2 text-sm font-semibold text-neutral-900">{product.price === null ? "Harga belum tersedia" : rupiah(product.price)} {product.originalPrice !== null && <span className="ml-1 font-normal text-neutral-400 line-through">{rupiah(product.originalPrice)}</span>}</p>
                      {!product.inStock && <p className="mt-1 text-xs text-neutral-500">Stok habis</p>}
                    </div>
                    <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xl text-neutral-700 group-open:rotate-45">+</span>
                  </summary>
                  {product.description && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-600">{product.description}</p>}
                </details>
              ))}
            </div>
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
