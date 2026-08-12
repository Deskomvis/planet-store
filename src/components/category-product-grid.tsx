"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductLightbox, type LightboxProduct } from "@/components/product-lightbox";
import { downloadFiles, filenameFromUrl, shareImages } from "@/lib/share";

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
    if (downloading) return;
    setDownloading(true);
    try {
      downloadFiles(selectedProducts.map((p) => ({
        url: p.imageUrl!,
        filename: filenameFromUrl(p.imageUrl!, p.name),
      })));
    } finally {
      setDownloading(false);
    }
  }

  async function handleBulkShare() {
    setSharing(true);
    const result = await shareImages(
      selectedProducts.map((p) => ({
        url: p.imageUrl!,
        filename: filenameFromUrl(p.imageUrl!, p.name),
      })),
      `${selectedProducts.length} produk ${categoryName}`
    );
    if (result === "unsupported") {
      handleBulkDownload();
    }
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
              {downloading ? "Menyiapkan..." : "Download"}
            </button>
            <button
              type="button"
              onClick={handleBulkShare}
              disabled={sharing}
              className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.684 13.342a3 3 0 100-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.368-2.684 3 3 0 00-5.368 2.684zm0 8a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              {sharing ? "Membagikan..." : "Share"}
            </button>
          </div>
        </div>
      ) : null}

    </>
  );
}
