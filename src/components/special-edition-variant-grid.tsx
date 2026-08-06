"use client";

import { useState } from "react";
import Image from "next/image";
import { downloadFiles, filenameFromUrl } from "@/lib/share";

type SpecialEditionVariant = {
  id: string;
  name: string;
  imageUrl: string;
};

export function SpecialEditionVariantGrid({ variants }: { variants: SpecialEditionVariant[] }) {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDownload() {
    if (downloading) return;
    const files = variants
      .filter((variant) => selectedIds.has(variant.id))
      .map((variant) => ({
        url: variant.imageUrl,
        filename: filenameFromUrl(variant.imageUrl, variant.name || "Varian Special Edition"),
      }));
    if (files.length === 0) return;
    setDownloading(true);
    try {
      await downloadFiles(files, "special-edition-terpilih.zip");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-stone-500">
          {selectMode ? `${selectedIds.size} dipilih` : `${variants.length} varian`}
        </p>
        {variants.length > 0 ? (
          <button
            type="button"
            onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
            className="cursor-pointer rounded-full border border-white/25 px-3 py-1.5 text-sm font-medium text-stone-200 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {selectMode ? "Batal" : "Pilih"}
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {variants.map((variant) => {
          const selected = selectedIds.has(variant.id);
          return (
            <div
              key={variant.id}
              className="group relative aspect-square overflow-hidden bg-neutral-900"
            >
              <Image
                src={variant.imageUrl}
                alt={variant.name || "Varian Special Edition"}
                fill
                sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                className={`object-cover transition-transform duration-500 ${selectMode ? "" : "group-hover:scale-[1.03]"}`}
              />
              {selectMode ? (
                <>
                  <div className={`absolute inset-0 transition-colors ${selected ? "bg-black/35" : "bg-black/0"}`} />
                  <button
                    type="button"
                    onClick={() => toggleSelected(variant.id)}
                    aria-pressed={selected}
                    aria-label={`Pilih ${variant.name || "varian"}`}
                    className="absolute inset-0 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  />
                  <span className={`pointer-events-none absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-sm font-bold text-white ${selected ? "bg-blue-600" : "bg-black/25"}`}>
                    {selected ? "✓" : ""}
                  </span>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      {selectMode && selectedIds.size > 0 ? (
        <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-full bg-neutral-900 px-4 py-2.5 shadow-xl ring-1 ring-white/15">
            <span className="text-sm font-medium text-white">{selectedIds.size} item</span>
            <div className="h-4 w-px bg-white/20" />
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
              </svg>
              {downloading ? "Menyiapkan..." : "Download"}
            </button>
          </div>
        </div>
      ) : null}

    </>
  );
}
