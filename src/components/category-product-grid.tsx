"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductLightbox, type LightboxProduct } from "@/components/product-lightbox";
import { downloadFile, filenameFromUrl, shareToWhatsApp } from "@/lib/share";

export function CategoryProductGrid({
  products,
  categoryName,
  categorySlug,
}: {
  products: LightboxProduct[];
  categoryName: string;
  categorySlug: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const filtered = q
    ? products.filter((product) => product.name.toLowerCase().includes(q))
    : products;

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedProducts = products.filter((p) => selectedIds.has(p.id) && p.imageUrl);

  async function handleBulkDownload() {
    setDownloading(true);
    for (const product of selectedProducts) {
      await downloadFile(product.imageUrl!, filenameFromUrl(product.imageUrl!, product.name));
    }
    setDownloading(false);
  }

  async function handleBulkShare() {
    setSharing(true);
    await shareToWhatsApp(
      selectedProducts.map((p) => ({
        url: p.imageUrl!,
        filename: filenameFromUrl(p.imageUrl!, p.name),
      })),
      `${selectedProducts.length} produk ${categoryName} (gambar sudah diunduh, lampirkan di chat ini)`
    );
    setSharing(false);
  }

  return (
    <>
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          {selectMode ? `${selectedIds.size} dipilih` : `${filtered.length} produk`}
        </p>
        {filtered.length > 0 ? (
          <button
            type="button"
            onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
            className="cursor-pointer rounded-full border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {selectMode ? "Batal" : "Pilih"}
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">Produk tidak ditemukan.</p>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-1 sm:gap-3 md:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              inStock={product.inStock}
              imageUrl={product.imageUrl}
              selectMode={selectMode}
              selected={selectedIds.has(product.id)}
              onClick={() =>
                selectMode ? toggleSelected(product.id) : setOpenIndex(products.indexOf(product))
              }
            />
          ))}
        </div>
      )}

      {openIndex !== null ? (
        <ProductLightbox
          products={products}
          index={openIndex}
          categoryName={categoryName}
          categorySlug={categorySlug}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      ) : null}

      {selectMode && selectedIds.size > 0 ? (
        <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-full bg-neutral-900 px-4 py-2.5 shadow-xl">
            <span className="text-sm font-medium text-white">{selectedIds.size} item</span>
            <div className="h-4 w-px bg-white/20" />
            <button
              type="button"
              onClick={handleBulkDownload}
              disabled={downloading}
              className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
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
            <button
              type="button"
              onClick={handleBulkShare}
              disabled={sharing}
              className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.85.5 3.58 1.36 5.07L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0012.04 2zm5.71 14.13c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.11.11-1.79-.11-.41-.13-.94-.3-1.62-.6-2.86-1.24-4.72-4.12-4.86-4.31-.14-.19-1.16-1.55-1.16-2.96 0-1.41.74-2.1 1-2.39.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.42-.07.65.5.24.58.81 2 .88 2.15.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.31.31-.13.61.18.3.8 1.32 1.72 2.14 1.18 1.05 2.18 1.38 2.48 1.53.3.15.48.13.66-.08.18-.21.76-.88.96-1.18.2-.3.4-.25.67-.15.28.1 1.75.83 2.05.98.3.15.5.22.57.35.08.13.08.75-.16 1.43z" />
              </svg>
              {sharing ? "Membagikan..." : "Share"}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
