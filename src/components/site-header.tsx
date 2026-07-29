"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SiteSidebar } from "@/components/site-sidebar";
import { useFavorites } from "@/hooks/use-favorites";

function SearchBox() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isCategoryPage = pathname.startsWith("/kategori/");
  const isFavoritPage = pathname === "/favorit";
  const showSearch = pathname === "/" || isCategoryPage || isFavoritPage;
  const placeholder = isCategoryPage
    ? "Cari produk..."
    : isFavoritPage
      ? "Cari produk favorit..."
      : "Cari kategori...";

  const [value, setValue] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    if (!showSearch) return;
    const current = searchParams.get("q") ?? "";
    if (value === current) return;

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, showSearch]);

  if (!showSearch) return <div className="flex-1" />;

  return (
    <div className="relative flex-1">
      <label htmlFor="header-search" className="sr-only">
        {placeholder}
      </label>
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
      </svg>
      <input
        id="header-search"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-neutral-400 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      />
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const favorites = useFavorites();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-lg bg-neutral-900 px-2.5 py-1.5 transition-colors hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <Image src="/logo-gp-black.webp" alt="Gudang Planet" width={170} height={51} priority />
        </Link>

        <SearchBox key={pathname} />

        <Link
          href="/favorit"
          aria-label={`Produk favorit${favorites.length > 0 ? ` (${favorites.length})` : ""}`}
          aria-current={pathname === "/favorit" ? "page" : undefined}
          className="relative flex shrink-0 cursor-pointer items-center justify-center rounded-full p-2 text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <svg
            className="h-6 w-6"
            fill={favorites.length > 0 ? "currentColor" : "none"}
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
          {favorites.length > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
              {favorites.length > 99 ? "99+" : favorites.length}
            </span>
          ) : null}
        </Link>

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Buka menu"
          aria-haspopup="dialog"
          aria-expanded={sidebarOpen}
          className="flex shrink-0 cursor-pointer items-center justify-center rounded-full p-2 text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <SiteSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </header>
  );
}
