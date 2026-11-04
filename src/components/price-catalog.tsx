"use client";

import Image from "next/image";
import { useState, type TouchEvent } from "react";

type Product = { id: string; name: string; imageUrl: string | null; description: string | null; price: number | null; originalPrice: number | null; inStock: boolean };
type Category = { id: string; name: string; description: string | null; products: Product[] };
const rupiah = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);

function VariantSlider({ category }: { category: Category }) {
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const product = category.products[index];
  const move = (step: number) => setIndex((current) => (current + step + category.products.length) % category.products.length);
  function onTouchEnd(event: TouchEvent) {
    if (touchStart !== null) {
      const distance = touchStart - event.changedTouches[0].clientX;
      if (Math.abs(distance) > 50) move(distance > 0 ? 1 : -1);
    }
    setTouchStart(null);
  }
  return (
    <div className="grid gap-6 border-t border-neutral-200 bg-neutral-50 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-10">
      <div className="min-w-0">
        <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white" onTouchStart={(event) => setTouchStart(event.touches[0].clientX)} onTouchEnd={onTouchEnd}>
          <div className="relative aspect-square max-h-[65vh] w-full" aria-live="polite">
            {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 1024px) 90vw, 55vw" className="object-contain" /> : <div className="flex h-full items-center justify-center text-sm text-neutral-400">Tidak ada gambar</div>}
          </div>
          {category.products.length > 1 && <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between">
            <button type="button" onClick={() => move(-1)} aria-label="Varian sebelumnya" className="h-11 w-11 cursor-pointer rounded-full border border-neutral-200 bg-white/95 text-xl shadow-sm">←</button>
            <button type="button" onClick={() => move(1)} aria-label="Varian berikutnya" className="h-11 w-11 cursor-pointer rounded-full border border-neutral-200 bg-white/95 text-xl shadow-sm">→</button>
          </div>}
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-neutral-900/80 px-3 py-1 text-xs text-white">{index + 1} / {category.products.length}</span>
        </div>
        {category.products.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-2" aria-label="Pilih varian">
          {category.products.map((variant, position) => <button key={variant.id} type="button" onClick={() => setIndex(position)} aria-label={`Lihat ${variant.name}`} aria-pressed={position === index} className={`relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 bg-white ${position === index ? "border-neutral-900" : "border-neutral-200"}`}>
            {variant.imageUrl ? <Image src={variant.imageUrl} alt="" fill sizes="64px" className="object-cover" /> : <span className="text-xs">{position + 1}</span>}
          </button>)}
        </div>}
      </div>
      <div className="py-2 lg:py-6" aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{category.name}</p>
        <h3 className="mt-3 text-2xl font-bold text-neutral-900 sm:text-3xl">{product.name}</h3>
        <div className="mt-5 flex flex-wrap items-baseline gap-3">
          <p className="text-2xl font-bold text-neutral-900">{product.price === null ? "Harga belum tersedia" : rupiah(product.price)}</p>
          {product.originalPrice !== null && <span className="text-base text-neutral-400 line-through">{rupiah(product.originalPrice)}</span>}
        </div>
        <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-medium ${product.inStock ? "bg-emerald-50 text-emerald-700" : "bg-neutral-200 text-neutral-600"}`}>{product.inStock ? "Stok tersedia" : "Stok habis"}</span>
        <div className="mt-7 border-t border-neutral-200 pt-6">
          <h4 className="text-sm font-semibold text-neutral-900">Keterangan produk</h4>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-neutral-600">{product.description || "Belum ada keterangan untuk varian ini."}</p>
        </div>
      </div>
    </div>
  );
}

export function PriceCatalog({ categories }: { categories: Category[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  return <div className="mt-7 space-y-3">
    {categories.length === 0 && <p className="py-10 text-sm text-neutral-500">Belum ada produk di katalog.</p>}
    {categories.map((category) => {
      const open = activeId === category.id;
      return <section key={category.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <h2><button type="button" onClick={() => setActiveId(open ? null : category.id)} aria-expanded={open} aria-controls={`category-${category.id}`} className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-neutral-50 sm:px-7 sm:py-6">
          <span><span className="block text-lg font-semibold text-neutral-900 sm:text-xl">{category.name}</span><span className="mt-1 block text-sm font-normal text-neutral-500">{category.products.length} varian produk</span></span>
          <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xl">{open ? "−" : "+"}</span>
        </button></h2>
        <div id={`category-${category.id}`} hidden={!open}>{open && <VariantSlider category={category} />}</div>
      </section>;
    })}
  </div>;
}
