"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { StockBadge } from "@/components/stock-badge";
import { buildWhatsappMessage } from "@/lib/whatsapp";

export type LightboxProduct = {
  id: string;
  name: string;
  description: string;
  inStock: boolean;
  imageUrl: string | null;
};

export function ProductLightbox({
  products,
  index,
  categoryName,
  whatsappNumber,
  whatsappMessageTemplate,
  onClose,
  onNavigate,
}: {
  products: LightboxProduct[];
  index: number;
  categoryName: string;
  whatsappNumber: string | null;
  whatsappMessageTemplate: string | null;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}) {
  const product = products[index];

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
            <p className="mt-1 text-xs text-neutral-600">{product.description}</p>
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
