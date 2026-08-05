"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export function CategoryCard({
  name,
  slug,
  description,
  imageUrl,
}: {
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const descriptionText = description || "Tidak ada deskripsi.";
  const canExpand = descriptionText.length > 70;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:rounded-2xl">
      <Link href={`/kategori/${slug}`} className="block cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
        <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
              Tidak ada gambar
            </div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="line-clamp-1 text-xs font-bold uppercase tracking-tight text-neutral-900 sm:text-base"><Link href={`/kategori/${slug}`} className="hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">{name}</Link></h2>
          <span className="hidden shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 sm:inline-block">
            Produk
          </span>
        </div>
        <p className={`mt-1 min-h-[3.75rem] text-[11px] leading-5 text-neutral-500 sm:min-h-[4.5rem] sm:text-sm sm:leading-6 ${expanded ? "" : "line-clamp-3"}`}>
          {descriptionText}
        </p>
        <div className="mt-1 min-h-5">
          {canExpand ? <button type="button" aria-expanded={expanded} onClick={() => setExpanded((current) => !current)} className="text-[11px] font-semibold text-neutral-700 underline-offset-2 hover:underline sm:text-xs">{expanded ? "Ringkas" : "Selengkapnya"}</button> : null}
        </div>
      </div>
    </article>
  );
}
