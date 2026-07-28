"use client";

import { useCallback, useEffect, useState } from "react";
import { StockBadge } from "@/components/stock-badge";
import { toggleFavorite } from "@/lib/favorites";
import { useFavorites } from "@/hooks/use-favorites";
import { downloadFile, filenameFromUrl, shareToWhatsApp } from "@/lib/share";

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
    await shareToWhatsApp(
      [{ url: product.imageUrl, filename: filenameFromUrl(product.imageUrl, product.name) }],
      `${product.name} (gambar sudah diunduh, lampirkan di chat ini)`
    );
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
      <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white">
          {index + 1} / {products.length}
        </span>
      </div>

      <div
        className="relative mx-auto flex w-full max-w-2xl flex-1 items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {products.length > 1 ? (
          <button
            type="button"
            onClick={goPrev}
            aria-label="Sebelumnya"
            className="absolute left-0 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:-left-14"
          >
            ‹
          </button>
        ) : null}

        <div className="relative max-h-[70vh] w-fit max-w-full overflow-hidden rounded-xl bg-white">
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/5 text-neutral-700 transition-colors hover:bg-black/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
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
            onClick={goNext}
            aria-label="Berikutnya"
            className="absolute right-0 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:-right-14"
          >
            ›
          </button>
        ) : null}
      </div>

      <div
        className="mx-auto flex w-full max-w-2xl flex-wrap items-center justify-center gap-3 pb-2 pt-4"
        onClick={(e) => e.stopPropagation()}
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
            aria-label="Bagikan lewat WhatsApp"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-transparent text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.85.5 3.58 1.36 5.07L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0012.04 2zm5.71 14.13c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.11.11-1.79-.11-.41-.13-.94-.3-1.62-.6-2.86-1.24-4.72-4.12-4.86-4.31-.14-.19-1.16-1.55-1.16-2.96 0-1.41.74-2.1 1-2.39.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.42-.07.65.5.24.58.81 2 .88 2.15.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.31.31-.13.61.18.3.8 1.32 1.72 2.14 1.18 1.05 2.18 1.38 2.48 1.53.3.15.48.13.66-.08.18-.21.76-.88.96-1.18.2-.3.4-.25.67-.15.28.1 1.75.83 2.05.98.3.15.5.22.57.35.08.13.08.75-.16 1.43z" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}
