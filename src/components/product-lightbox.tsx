"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { StockBadge } from "@/components/stock-badge";
import { buildWhatsappMessage } from "@/lib/whatsapp";
import { toggleFavorite } from "@/lib/favorites";
import { useFavorites } from "@/hooks/use-favorites";

export type LightboxProduct = {
  id: string;
  name: string;
  description: string | null;
  inStock: boolean;
  imageUrl: string | null;
};

async function downloadImage(url: string, filename: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export function ProductLightbox({
  products,
  index,
  categoryName,
  categorySlug,
  whatsappNumber,
  whatsappMessageTemplate,
  onClose,
  onNavigate,
}: {
  products: LightboxProduct[];
  index: number;
  categoryName: string;
  categorySlug: string;
  whatsappNumber: string | null;
  whatsappMessageTemplate: string | null;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}) {
  const product = products[index];
  const favorites = useFavorites();
  const [downloading, setDownloading] = useState(false);

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
    const ext = product.imageUrl.split(".").pop()?.split("?")[0] || "jpg";
    await downloadImage(product.imageUrl, `${product.name}.${ext}`);
    setDownloading(false);
  }

  const waMessage = buildWhatsappMessage(whatsappMessageTemplate, {
    produk: product.name,
    kategori: categoryName,
  });
  const waHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`
    : null;

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

        <div className="relative aspect-square w-full max-h-[70vh] overflow-hidden rounded-xl bg-white">
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/5 text-neutral-700 transition-colors hover:bg-black/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            ✕
          </button>

          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="90vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
              Tidak ada gambar
            </div>
          )}

          <div className="absolute left-4 top-4 max-w-[70%] rounded-lg bg-white/95 px-4 py-3">
            <p className="text-sm font-semibold text-neutral-900">{product.name}</p>
            {product.description ? (
              <p className="mt-1 text-xs text-neutral-600">{product.description}</p>
            ) : null}
          </div>
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

        {waHref ? (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex cursor-pointer items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Share ke WhatsApp Admin
          </a>
        ) : null}
      </div>
    </div>
  );
}
