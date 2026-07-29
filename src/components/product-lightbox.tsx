"use client";

import { useCallback, useEffect, useState } from "react";
import { StockBadge } from "@/components/stock-badge";
import { toggleFavorite } from "@/lib/favorites";
import { useFavorites } from "@/hooks/use-favorites";
import { downloadFile, filenameFromUrl, shareImages } from "@/lib/share";

export type LightboxProduct = {
  id: string;
  name: string;
  description: string | null;
  inStock: boolean;
  imageUrl: string | null;
};

export function ProductLightbox({
  products,
  index,
  onClose,
  onNavigate,
  categorySlug,
  categoryName,
}: {
  products: LightboxProduct[];
  index: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
  categorySlug: string;
  categoryName: string;
}) {
  const product = products[index];
  const favorites = useFavorites();
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const goPrev = useCallback(() => {
    onNavigate((index - 1 + products.length) % products.length);
  }, [index, products.length, onNavigate]);

  const goNext = useCallback(() => {
    onNavigate((index + 1) % products.length);
  }, [index, products.length, onNavigate]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goPrev, goNext]);

  if (!product) return null;

  const isFavorited = favorites.some((f) => f.id === product.id);

  function handleToggleFavorite() {
    toggleFavorite({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      inStock: product.inStock,
      categorySlug,
      categoryName,
    });
  }

  async function handleDownload() {
    if (!product.imageUrl || downloading) return;
    setDownloading(true);
    await downloadFile(product.imageUrl, filenameFromUrl(product.imageUrl, product.name));
    setDownloading(false);
  }

  async function handleShare() {
    if (!product.imageUrl || sharing) return;
    setSharing(true);
    const result = await shareImages(
      [{ url: product.imageUrl, filename: filenameFromUrl(product.imageUrl, product.name) }],
      product.name
    );
    if (result === "unsupported") {
      await handleDownload();
    }
    setSharing(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4"
      onClick={onClose}
    >
      <div className="flex items-center justify-end">
        <span
          className="rounded-full bg-white/10 px-3 py-1 text-sm text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {index + 1} / {products.length}
        </span>
      </div>

      <div className="relative mx-auto flex w-full max-w-2xl flex-1 items-center justify-center">
        {products.length > 1 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Sebelumnya"
            className="absolute left-0 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:-left-14"
          >
            ‹
          </button>
        ) : null}

        <div
          className="relative max-h-[70vh] w-fit max-w-full overflow-hidden rounded-xl bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            ✕
          </button>

          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- natural aspect ratio without cropping; dimensions unknown ahead of time
            <img
              src={product.imageUrl}
              alt={product.name}
              className="block max-h-[70vh] w-auto max-w-full object-contain"
            />
          ) : (
            <div className="flex aspect-square w-[70vh] max-w-full items-center justify-center text-sm text-neutral-400">
              Tidak ada gambar
            </div>
          )}
        </div>

        {products.length > 1 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Berikutnya"
            className="absolute right-0 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:-right-14"
          >
            ›
          </button>
        ) : null}
      </div>

      <div
        className="mx-auto flex w-full max-w-2xl flex-wrap items-center justify-center gap-3 pb-2 pt-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) return;
          e.stopPropagation();
        }}
      >
        <StockBadge inStock={product.inStock} />

        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-pressed={isFavorited}
          className={`flex cursor-pointer items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
            isFavorited
              ? "border-transparent bg-white text-red-600"
              : "border-white/30 bg-transparent text-white hover:bg-white/10"
          }`}
        >
          <svg
            className="h-4 w-4"
            fill={isFavorited ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
            />
          </svg>
          {isFavorited ? "Favorit" : "Tambah Favorit"}
        </button>

        {product.imageUrl ? (
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-white/30 bg-transparent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
              />
            </svg>
            {downloading ? "Mengunduh..." : "Download"}
          </button>
        ) : null}

        {product.imageUrl ? (
          <button
            type="button"
            onClick={handleShare}
            disabled={sharing}
            aria-label="Bagikan gambar"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-transparent text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.684 13.342a3 3 0 100-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.368-2.684 3 3 0 00-5.368 2.684zm0 8a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}
