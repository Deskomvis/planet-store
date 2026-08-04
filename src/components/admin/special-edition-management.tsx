"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type SpecialPageSummary = { id: string; slug: string; title: string; description: string | null; heroImageUrl: string | null; published: boolean; updatedAt: string };

export function SpecialEditionManagement({ initialPages }: { initialPages: SpecialPageSummary[] }) {
  const router = useRouter();
  const [pages, setPages] = useState(initialPages);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function remove(page: SpecialPageSummary) {
    if (!window.confirm(`Hapus halaman “${page.title}”? Tindakan ini tidak dapat dibatalkan.`)) return;
    setDeleting(page.id);
    const response = await fetch(`/api/special-edition/${page.id}`, { method: "DELETE" });
    if (response.ok) { setPages((items) => items.filter((item) => item.id !== page.id)); router.refresh(); }
    else alert((await response.json()).error ?? "Gagal menghapus halaman");
    setDeleting(null);
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-xl font-bold text-neutral-900">Special Edition Page Builder</h1><p className="mt-1 text-sm text-neutral-500">Buat dan kelola halaman koleksi khusus dengan susunan blok dinamis.</p></div><Link href="/admin/special-edition/baru" className="rounded-full bg-neutral-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-neutral-700">+ Buat halaman</Link></div>
    {pages.length === 0 ? <div className="rounded-xl border border-dashed border-neutral-300 p-12 text-center"><p className="text-sm text-neutral-500">Belum ada halaman khusus.</p></div> : <div className="grid gap-4 sm:grid-cols-2">{pages.map((page) => <article key={page.id} className="overflow-hidden rounded-xl border border-neutral-200 bg-white"><div className="relative aspect-[16/8] bg-neutral-900">{page.heroImageUrl ? <Image src={page.heroImageUrl} alt="" fill sizes="(max-width:640px) 100vw, 50vw" className="object-cover" /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,#514838,#111_60%)]" />}<span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${page.published ? "bg-green-100 text-green-800" : "bg-neutral-200 text-neutral-700"}`}>{page.published ? "Published" : "Draft"}</span></div><div className="p-4"><h2 className="font-bold text-neutral-900">{page.title}</h2><p className="mt-1 text-xs text-neutral-500">/special-edition/{page.slug}</p>{page.description ? <p className="mt-3 line-clamp-2 text-sm text-neutral-600">{page.description}</p> : null}<div className="mt-4 flex flex-wrap gap-2"><Link href={`/admin/special-edition/${page.id}`} className="rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white">Edit builder</Link><Link href={`/special-edition/${page.slug}`} target="_blank" className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700">Lihat</Link><button type="button" disabled={deleting === page.id} onClick={() => remove(page)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Hapus</button></div></div></article>)}</div>}
  </div>;
}
