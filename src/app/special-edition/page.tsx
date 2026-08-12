import type { Metadata } from "next";
import type { SpecialEditionPage as SpecialEditionPageData } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { SiteFooter } from "@/components/site-footer";
import { SpecialEditionVariantGrid } from "@/components/special-edition-variant-grid";
import type { SpecialEditionBlock } from "@/lib/validation";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Special Edition | Gudang Planet",
  description: "Koleksi Special Edition Gudang Planet dalam jumlah terbatas.",
};

function ActionLink({ href, label }: { href: string; label: string }) {
  if (!href || !label) return null;
  const className = "group mt-8 inline-flex items-center gap-4 border-b border-amber-200 pb-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-100 transition-colors hover:border-white hover:text-white";
  return href.startsWith("/") ? <Link href={href} className={className}>{label}<span aria-hidden="true" className="transition-transform group-hover:translate-x-1">↗</span></Link> : <a href={href} className={className} target="_blank" rel="noreferrer">{label}<span aria-hidden="true" className="transition-transform group-hover:translate-x-1">↗</span></a>;
}

function EditorialBlock({ block, index }: { block: SpecialEditionBlock; index: number }) {
  const imageFirst = block.align === "left";
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-12 md:items-center md:gap-10 md:py-24 lg:px-12">
      <div className={`relative min-h-96 overflow-hidden bg-neutral-900 md:col-span-7 md:min-h-[38rem] ${imageFirst ? "md:order-1" : "md:order-2"}`}>
        {block.imageUrl ? <Image src={block.imageUrl} alt={block.title || "Special Edition"} fill sizes="(max-width: 768px) 100vw, 60vw" className="object-contain" /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,#37322a_0%,#151515_42%,#080808_100%)]"><span className="absolute bottom-6 left-6 text-[10px] uppercase tracking-[0.35em] text-white/35">Visual {String(index + 1).padStart(2, "0")}</span></div>}
      </div>
      <div className={`md:col-span-5 ${imageFirst ? "md:order-2 md:pl-5" : "md:order-1 md:pr-5"}`}>
        {block.eyebrow ? <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-200/70">{block.eyebrow}</p> : null}
        <h2 className="mt-5 max-w-xl font-serif text-4xl leading-[0.98] tracking-tight text-stone-100 sm:text-5xl lg:text-6xl">{block.title}</h2>
        {block.body ? <p className="mt-7 max-w-lg whitespace-pre-line text-sm leading-7 text-stone-400 sm:text-base">{block.body}</p> : null}
        <ActionLink href={block.linkUrl} label={block.linkLabel} />
      </div>
    </section>
  );
}

export function SpecialEditionView({ page }: { page: SpecialEditionPageData }) {
  let blocks: SpecialEditionBlock[] = [];
  try { blocks = JSON.parse(page.contentJson); } catch { blocks = []; }
  blocks = blocks.filter((block) => block.enabled);

  return (
    <div className="min-h-screen bg-[#090909] text-stone-100 selection:bg-amber-100 selection:text-black">
      <header className="absolute inset-x-0 top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link href="/" className="text-sm font-black uppercase tracking-[0.18em] text-white sm:text-base">Gudang Planet</Link>
          <div className="flex items-center gap-5"><Link href="/special-edition" className="hidden text-[10px] uppercase tracking-[0.28em] text-white/55 sm:inline">All Special Editions</Link><Link href="/" className="rounded-full border border-white/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-black">Katalog</Link></div>
        </div>
      </header>
      <main>
        <section className="relative flex min-h-[92svh] items-end overflow-hidden bg-neutral-950">
          {page.heroImageUrl ? <Image src={page.heroImageUrl} alt={page.title} fill priority fetchPriority="high" sizes="100vw" className="object-cover" /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_30%,#4a4438_0%,#1b1a18_28%,#080808_70%)]" />}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/90" />
          <div className="relative mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20"><div className="max-w-5xl">{page.eyebrow ? <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.42em] text-amber-100/80 sm:text-xs">{page.eyebrow}</p> : null}<h1 className="font-serif text-[clamp(4rem,14vw,11rem)] leading-[0.76] tracking-[-0.055em] text-white">{page.title}</h1><div className="mt-8 flex flex-col gap-6 border-t border-white/20 pt-5 sm:flex-row sm:items-start sm:justify-between">{page.description ? <p className="max-w-xl text-sm leading-6 text-white/65 sm:text-base">{page.description}</p> : <span />}<p className="shrink-0 text-[10px] uppercase leading-5 tracking-[0.25em] text-white/45">Exclusive catalogue<br />Scroll to discover ↓</p></div></div></div>
        </section>
        {blocks.map((block, index) => {
          if (block.type === "editorial" || block.type === "product") return <EditorialBlock key={block.id} block={block} index={index} />;
          if (block.type === "features") return <section key={block.id} className="border-y border-white/10 bg-[#0e0e0e]"><div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24 lg:px-12"><div className="grid gap-12 md:grid-cols-2"><div>{block.eyebrow ? <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-200/70">{block.eyebrow}</p> : null}<h2 className="mt-5 max-w-xl font-serif text-4xl leading-none text-stone-100 sm:text-5xl">{block.title}</h2>{block.body ? <p className="mt-6 max-w-md text-sm leading-7 text-stone-400">{block.body}</p> : null}</div><ol className="divide-y divide-white/10 border-t border-white/10">{block.items.filter(Boolean).map((item, itemIndex) => <li key={`${block.id}-${itemIndex}`} className="flex items-center gap-6 py-5"><span className="text-[10px] tracking-widest text-amber-200/50">0{itemIndex + 1}</span><span className="text-sm uppercase tracking-[0.16em] text-stone-200">{item}</span></li>)}</ol></div></div></section>;
          if (block.type === "variants") return <section key={block.id} className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24 lg:px-12"><SpecialEditionVariantGrid variants={block.variants.filter((variant) => variant.imageUrl).map((variant) => ({ ...variant, imageUrl: variant.imageUrl! }))} /></section>;
          return <section key={block.id} className="relative overflow-hidden px-5 py-24 text-center sm:px-8 md:py-36"><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#27241f_0%,#090909_62%)]" /><div className="relative mx-auto max-w-4xl">{block.eyebrow ? <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-200/70">{block.eyebrow}</p> : null}<h2 className="mt-6 font-serif text-5xl leading-[0.92] text-white sm:text-7xl">{block.title}</h2>{block.body ? <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-stone-400">{block.body}</p> : null}<ActionLink href={block.linkUrl} label={block.linkLabel} /></div></section>;
        })}
      </main><div className="border-t border-white/10 [&_footer]:border-white/10 [&_footer]:bg-black [&_footer]:text-stone-400"><SiteFooter /></div>
    </div>
  );
}

export default async function SpecialEditionPage() {
  const pages = await prisma.specialEditionPage.findMany({ where: { published: true }, orderBy: { updatedAt: "desc" } });
  return <div className="min-h-screen bg-[#090909] text-white"><header className="border-b border-white/10"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12"><Link href="/" className="text-sm font-black uppercase tracking-[0.18em]">Gudang Planet</Link><Link href="/" className="rounded-full border border-white/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em]">Katalog</Link></div></header><main className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24 lg:px-12"><p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-200/70">Curated releases</p><h1 className="mt-5 font-serif text-5xl leading-none sm:text-7xl">Special Editions</h1><p className="mt-6 max-w-xl text-sm leading-7 text-stone-400">Koleksi khusus dengan karakter, cerita, dan detail yang dirilis dalam jumlah terbatas.</p>{pages.length === 0 ? <p className="mt-16 text-sm text-stone-500">Belum ada koleksi yang dipublikasikan.</p> : <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-5">{pages.map((page) => <Link key={page.id} href={`/special-edition/${page.slug}`} className="group min-w-0"><div className="relative aspect-[4/3] overflow-hidden bg-neutral-900">{page.heroImageUrl ? <Image src={page.heroImageUrl} alt={page.title} fill sizes="(max-width:640px) 50vw, 50vw" className="object-contain" /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,#4a4438,#111_65%)]" />}</div><p className="mt-3 truncate text-[8px] uppercase tracking-[0.2em] text-amber-200/60 sm:mt-4 sm:text-[9px] sm:tracking-[0.3em]">{page.eyebrow || "Special Edition"}</p><h2 className="mt-1 line-clamp-2 font-serif text-xl leading-tight text-white sm:mt-2 sm:text-4xl">{page.title}</h2>{page.description ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-stone-500 sm:text-sm sm:leading-6">{page.description}</p> : null}</Link>)}</div>}</main><div className="border-t border-white/10 [&_footer]:border-white/10 [&_footer]:bg-black [&_footer]:text-stone-400"><SiteFooter /></div></div>;
}
