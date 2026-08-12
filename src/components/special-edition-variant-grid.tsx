"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { downloadFile, downloadFiles, filenameFromUrl } from "@/lib/share";

type SpecialEditionVariant = {
  id: string;
  name: string;
  imageUrl: string;
};

export function SpecialEditionVariantGrid({ variants }: { variants: SpecialEditionVariant[] }) {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
      downloadFiles(files);
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
              role={!selectMode ? "button" : undefined}
              tabIndex={!selectMode ? 0 : undefined}
              onClick={!selectMode ? () => setOpenIndex(variants.indexOf(variant)) : undefined}
              onKeyDown={!selectMode ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setOpenIndex(variants.indexOf(variant));
                }
              } : undefined}
              aria-label={!selectMode ? `Lihat ${variant.name || "varian"}` : undefined}
              className={`group relative aspect-square overflow-hidden bg-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${selectMode ? "" : "cursor-zoom-in"}`}
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

      {openIndex !== null ? (
        <SpecialEditionVariantLightbox
          variants={variants}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      ) : null}

    </>
  );
}

function SpecialEditionVariantLightbox({
  variants,
  index,
  onClose,
  onNavigate,
}: {
  variants: SpecialEditionVariant[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const variant = variants[index];
  const touchStartX = useRef<number | null>(null);
  const [downloading, setDownloading] = useState(false);

  const goPrev = useCallback(() => {
    onNavigate((index - 1 + variants.length) % variants.length);
  }, [index, onNavigate, variants.length]);

  const goNext = useCallback(() => {
    onNavigate((index + 1) % variants.length);
  }, [index, onNavigate, variants.length]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, onClose]);

  if (!variant) return null;

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadFile(variant.imageUrl, filenameFromUrl(variant.imageUrl, variant.name || "Varian Special Edition"));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={variant.name || "Varian Special Edition"}
      className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4"
      onClick={onClose}
      onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null || variants.length < 2) return;
        const distance = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(distance) < 50) return;
        if (distance > 0) goPrev();
        else goNext();
      }}
    >
      <div className="flex items-center justify-end">
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white" onClick={(event) => event.stopPropagation()}>
          {index + 1} / {variants.length}
        </span>
      </div>

      <div className="relative mx-auto flex w-full max-w-2xl flex-1 items-center justify-center">
        {variants.length > 1 ? (
          <button type="button" onClick={(event) => { event.stopPropagation(); goPrev(); }} aria-label="Sebelumnya" className="absolute left-1 z-10 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-white/10 text-3xl text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:-left-14 sm:h-10 sm:w-10 sm:text-base">‹</button>
        ) : null}

        <div className="relative max-h-[78vh] w-fit max-w-full overflow-hidden rounded-xl bg-white" onClick={(event) => event.stopPropagation()}>
          <button type="button" onClick={onClose} aria-label="Tutup" className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">✕</button>
          {/* eslint-disable-next-line @next/next/no-img-element -- preserve natural dimensions and mobile long-press saving */}
          <img src={variant.imageUrl} alt={variant.name || "Varian Special Edition"} className="block max-h-[78vh] w-auto max-w-full object-contain" />
        </div>

        {variants.length > 1 ? (
          <button type="button" onClick={(event) => { event.stopPropagation(); goNext(); }} aria-label="Berikutnya" className="absolute right-1 z-10 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-white/10 text-3xl text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:-right-14 sm:h-10 sm:w-10 sm:text-base">›</button>
        ) : null}
      </div>

      <div className="mx-auto flex w-full max-w-2xl items-center justify-center gap-3 pb-2 pt-4" onClick={(event) => event.stopPropagation()}>
        <p className="max-w-xs truncate text-sm text-white/70">{variant.name || `Varian ${index + 1}`}</p>
        <button type="button" onClick={handleDownload} disabled={downloading} className="flex cursor-pointer items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
          {downloading ? "Mengunduh..." : "Download"}
        </button>
      </div>
    </div>
  );
}
