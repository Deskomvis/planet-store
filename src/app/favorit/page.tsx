"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StockBadge } from "@/components/stock-badge";
import { useFavorites } from "@/hooks/use-favorites";
import { removeFavorite } from "@/lib/favorites";

function FavoritContent() {
  const allFavorites = useFavorites();
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";

  const favorites = q
    ? allFavorites.filter((f) => f.name.toLowerCase().includes(q))
    : allFavorites;

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
          Produk Favorit
        </Link>

        <h1 className="mt-4 text-xl font-bold text-neutral-900">Koleksi Tersimpan</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Anda memiliki {allFavorites.length} produk favorit.
        </p>

        {favorites.length === 0 ? (
          <div className="mt-6 flex items-center justify-center rounded-2xl bg-neutral-100 px-4 py-16 text-sm text-neutral-500">
            {allFavorites.length === 0 ? "Belum ada produk favorit." : "Produk favorit tidak ditemukan."}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {favorites.map((product) => (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <button
                  type="button"
                  onClick={() => removeFavorite(product.id)}
                  aria-label={`Hapus ${product.name} dari favorit`}
                  className="absolute right-2 top-2 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
                    />
                  </svg>
                </button>

                <Link
                  href={`/kategori/${product.categorySlug}`}
                  className="block cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
                        Tidak ada gambar
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-1 text-sm font-semibold text-neutral-900">
                      {product.name}
                    </h3>
                    <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">
                      {product.categoryName}
                    </p>
                    <div className="mt-2">
                      <StockBadge inStock={product.inStock} />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

export default function FavoritPage() {
  return (
    <Suspense fallback={null}>
      <FavoritContent />
    </Suspense>
  );
}
