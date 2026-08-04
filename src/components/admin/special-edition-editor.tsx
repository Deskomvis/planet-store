"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageInput } from "@/components/admin/image-input";
import type { SpecialEditionBlock, SpecialEditionInput } from "@/lib/validation";

const blockNames: Record<SpecialEditionBlock["type"], string> = {
  editorial: "Cerita editorial",
  product: "Sorotan produk",
  features: "Daftar keunggulan",
  cta: "Ajakan / CTA",
};

function makeBlock(type: SpecialEditionBlock["type"]): SpecialEditionBlock {
  return {
    id: `${type}-${Date.now()}`,
    type,
    enabled: true,
    eyebrow: type === "product" ? "THE PIECE" : "",
    title: blockNames[type],
    body: "",
    imageUrl: "",
    linkLabel: type === "cta" || type === "product" ? "Lihat koleksi" : "",
    linkUrl: "",
    items: type === "features" ? ["Material pilihan", "Jumlah terbatas", "Detail eksklusif"] : [],
    align: "left",
  };
}

const inputClass = "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-600 focus:outline-none";

export function SpecialEditionEditor({ initialValue }: { initialValue: SpecialEditionInput }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateBlock(index: number, patch: Partial<SpecialEditionBlock>) {
    setValue((current) => ({
      ...current,
      blocks: current.blocks.map((block, i) => (i === index ? { ...block, ...patch } : block)),
    }));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.blocks.length) return;
    setValue((current) => {
      const blocks = [...current.blocks];
      [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
      return { ...current, blocks };
    });
  }

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/special-edition", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal menyimpan halaman");
      setMessage("Halaman Special Edition berhasil disimpan.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan jaringan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Special Edition</h1>
            <p className="mt-1 text-sm text-neutral-500">Atur halaman editorial premium dan susunan bloknya.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/special-edition" target="_blank" className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              Lihat halaman
            </Link>
            <button type="button" onClick={save} disabled={saving} className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50">
              {saving ? "Menyimpan..." : "Simpan perubahan"}
            </button>
          </div>
        </div>
        {message ? <p className="mt-3 text-sm text-green-700">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="text-sm font-medium text-neutral-700">Label kecil
            <input value={value.eyebrow} onChange={(e) => setValue({ ...value, eyebrow: e.target.value })} className={inputClass} placeholder="LIMITED RELEASE / 2026" />
          </label>
          <label className="text-sm font-medium text-neutral-700">Judul utama
            <input value={value.title} onChange={(e) => setValue({ ...value, title: e.target.value })} className={inputClass} />
          </label>
          <label className="text-sm font-medium text-neutral-700 md:col-span-2">Deskripsi
            <textarea value={value.description} onChange={(e) => setValue({ ...value, description: e.target.value })} className={`${inputClass} min-h-24`} />
          </label>
          <div className="md:col-span-2">
            <ImageInput id="special-hero" label="Gambar hero (landscape, disarankan 1600 × 1000)" value={value.heroImageUrl} onChange={(heroImageUrl) => setValue({ ...value, heroImageUrl })} />
          </div>
          <label className="flex items-center gap-3 md:col-span-2">
            <input type="checkbox" checked={value.published} onChange={(e) => setValue({ ...value, published: e.target.checked })} className="h-4 w-4" />
            <span><span className="block text-sm font-semibold text-neutral-900">Publikasikan halaman</span><span className="text-xs text-neutral-500">Jika nonaktif, halaman tidak dapat diakses pengunjung.</span></span>
          </label>
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-bold text-neutral-900">Susunan konten</h2><p className="text-sm text-neutral-500">Blok dirender berurutan dan menyesuaikan layar secara otomatis.</p></div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(blockNames) as SpecialEditionBlock["type"][]).map((type) => (
              <button key={type} type="button" onClick={() => setValue({ ...value, blocks: [...value.blocks, makeBlock(type)] })} className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-neutral-50">+ {blockNames[type]}</button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {value.blocks.map((block, index) => (
            <article key={block.id} className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">{index + 1}</span><h3 className="font-bold text-neutral-900">{blockNames[block.type]}</h3></div>
                <div className="flex items-center gap-1">
                  <button type="button" aria-label="Pindah ke atas" disabled={index === 0} onClick={() => moveBlock(index, -1)} className="rounded p-2 hover:bg-neutral-100 disabled:opacity-30">↑</button>
                  <button type="button" aria-label="Pindah ke bawah" disabled={index === value.blocks.length - 1} onClick={() => moveBlock(index, 1)} className="rounded p-2 hover:bg-neutral-100 disabled:opacity-30">↓</button>
                  <button type="button" onClick={() => setValue({ ...value, blocks: value.blocks.filter((_, i) => i !== index) })} className="rounded p-2 text-red-600 hover:bg-red-50">Hapus</button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-neutral-700">Label kecil<input value={block.eyebrow} onChange={(e) => updateBlock(index, { eyebrow: e.target.value })} className={inputClass} /></label>
                <label className="text-sm font-medium text-neutral-700">Judul<input value={block.title} onChange={(e) => updateBlock(index, { title: e.target.value })} className={inputClass} /></label>
                <label className="text-sm font-medium text-neutral-700 md:col-span-2">Deskripsi<textarea value={block.body} onChange={(e) => updateBlock(index, { body: e.target.value })} className={`${inputClass} min-h-20`} /></label>
                {(block.type === "editorial" || block.type === "product") ? <div className="md:col-span-2"><ImageInput id={`block-image-${block.id}`} label="Gambar blok" value={block.imageUrl} onChange={(imageUrl) => updateBlock(index, { imageUrl })} /></div> : null}
                {block.type === "features" ? <label className="text-sm font-medium text-neutral-700 md:col-span-2">Keunggulan (satu per baris)<textarea value={block.items.join("\n")} onChange={(e) => updateBlock(index, { items: e.target.value.split("\n").slice(0, 8) })} className={`${inputClass} min-h-28`} /></label> : null}
                {(block.type === "product" || block.type === "cta") ? <><label className="text-sm font-medium text-neutral-700">Teks tombol<input value={block.linkLabel} onChange={(e) => updateBlock(index, { linkLabel: e.target.value })} className={inputClass} /></label><label className="text-sm font-medium text-neutral-700">Tautan<input value={block.linkUrl} onChange={(e) => updateBlock(index, { linkUrl: e.target.value })} className={inputClass} placeholder="/kategori/... atau https://..." /></label></> : null}
                {(block.type === "editorial" || block.type === "product") ? <label className="text-sm font-medium text-neutral-700">Posisi gambar<select value={block.align} onChange={(e) => updateBlock(index, { align: e.target.value as "left" | "right" })} className={inputClass}><option value="left">Kiri</option><option value="right">Kanan</option></select></label> : null}
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-700"><input type="checkbox" checked={block.enabled} onChange={(e) => updateBlock(index, { enabled: e.target.checked })} /> Tampilkan blok</label>
              </div>
            </article>
          ))}
          {value.blocks.length === 0 ? <p className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">Belum ada blok. Tambahkan blok konten di atas.</p> : null}
        </div>
      </section>
    </div>
  );
}
