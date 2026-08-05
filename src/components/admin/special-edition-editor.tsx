"use client";

import { useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageInput } from "@/components/admin/image-input";
import type { SpecialEditionBlock, SpecialEditionInput } from "@/lib/validation";

const blockNames: Record<SpecialEditionBlock["type"], string> = {
  editorial: "Cerita editorial",
  product: "Sorotan produk",
  features: "Daftar keunggulan",
  variants: "Katalog varian",
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
    variants: type === "variants" ? [{ id: `variant-${Date.now()}`, name: "Varian 01", description: "", imageUrl: "" }] : [],
    align: "left",
  };
}

const inputClass = "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-600 focus:outline-none";

export function SpecialEditionEditor({ initialValue, pageId }: { initialValue: SpecialEditionInput; pageId?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [variantUploading, setVariantUploading] = useState<{ blockId: string; done: number; total: number } | null>(null);
  const [variantUploadError, setVariantUploadError] = useState<{ blockId: string; message: string } | null>(null);

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

  async function uploadVariantImages(
    blockIndex: number,
    block: SpecialEditionBlock,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const input = event.currentTarget;
    const isStarterPlaceholder = block.variants.length === 1
      && block.variants[0].name === "Varian 01"
      && !block.variants[0].description
      && !block.variants[0].imageUrl;
    const existingVariants = isStarterPlaceholder ? [] : block.variants;
    const availableSlots = 24 - existingVariants.length;
    const files = Array.from(input.files ?? []).slice(0, Math.max(availableSlots, 0));
    if (files.length === 0) {
      if ((input.files?.length ?? 0) > 0) setVariantUploadError({ blockId: block.id, message: "Maksimal 24 varian dalam satu blok." });
      input.value = "";
      return;
    }

    setVariantUploadError(null);
    setVariantUploading({ blockId: block.id, done: 0, total: files.length });
    const uploaded: SpecialEditionBlock["variants"] = [];
    const startNumber = existingVariants.length + 1;

    for (const [fileIndex, file] of files.entries()) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/upload", { method: "POST", body: formData });
        const responseText = await response.text();
        const data = responseText ? JSON.parse(responseText) as { url?: string; error?: string } : {};
        if (!response.ok || !data.url) throw new Error(data.error ?? `Gagal mengunggah ${file.name}`);
        uploaded.push({
          id: `variant-upload-${file.lastModified}-${file.size}-${fileIndex}`,
          name: `Varian ${String(startNumber + fileIndex).padStart(2, "0")}`,
          description: "",
          imageUrl: data.url,
        });
      } catch (uploadError) {
        setVariantUploadError({ blockId: block.id, message: uploadError instanceof Error ? uploadError.message : "Gagal mengunggah salah satu gambar" });
      } finally {
        setVariantUploading((current) => current ? { ...current, done: current.done + 1 } : null);
      }
    }

    if (uploaded.length > 0) {
      updateBlock(blockIndex, { variants: [...existingVariants, ...uploaded] });
    }
    setVariantUploading(null);
    input.value = "";
  }

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(pageId ? `/api/special-edition/${pageId}` : "/api/special-edition", {
        method: pageId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
      const responseText = await response.text();
      let data: { error?: string; page?: { id: string } } = {};
      if (responseText) {
        try {
          data = JSON.parse(responseText) as typeof data;
        } catch {
          throw new Error("Server mengirim respons yang tidak valid. Silakan coba lagi.");
        }
      }
      if (!response.ok) throw new Error(data.error ?? "Gagal menyimpan halaman");
      if (!data.page?.id) throw new Error("Halaman tersimpan tanpa ID yang valid");
      setMessage("Halaman Special Edition berhasil disimpan.");
      if (!pageId) router.replace(`/admin/special-edition/${data.page.id}`);
      else router.refresh();
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
            <Link href={`/special-edition/${value.slug}`} target="_blank" className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
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
          <label className="text-sm font-medium text-neutral-700">Slug URL
            <div className="mt-1 flex items-center rounded-lg border border-neutral-300 bg-white px-3"><span className="shrink-0 text-xs text-neutral-400">/special-edition/</span><input value={value.slug} onChange={(e) => setValue({ ...value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-") })} className="min-w-0 flex-1 py-2 text-sm focus:outline-none" /></div>
          </label>
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
                {block.type === "variants" ? <div className="space-y-3 md:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-neutral-800">Daftar varian</p><div className="flex flex-wrap gap-2"><label className={`cursor-pointer rounded-full border border-neutral-900 px-3 py-1.5 text-xs font-semibold text-neutral-900 hover:bg-neutral-100 ${variantUploading ? "pointer-events-none opacity-50" : ""}`}>+ Upload banyak gambar<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" disabled={Boolean(variantUploading)} onChange={(event) => uploadVariantImages(index, block, event)} className="sr-only" /></label><button type="button" disabled={Boolean(variantUploading) || block.variants.length >= 24} onClick={() => updateBlock(index, { variants: [...block.variants, { id: `variant-${Date.now()}`, name: `Varian ${String(block.variants.length + 1).padStart(2, "0")}`, description: "", imageUrl: "" }] })} className="rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40">+ Tambah manual</button></div></div>
                  {variantUploading?.blockId === block.id ? <p className="text-xs text-neutral-500">Mengunggah gambar {Math.min(variantUploading.done + 1, variantUploading.total)} dari {variantUploading.total}...</p> : null}
                  {variantUploadError?.blockId === block.id ? <p className="text-xs text-red-600">{variantUploadError.message}</p> : null}
                  <div className="grid grid-cols-2 gap-3">
                    {block.variants.map((variant, variantIndex) => <div key={variant.id} className="rounded-lg border border-neutral-200 p-3">
                      <div className="flex justify-between gap-2"><p className="text-xs font-bold text-neutral-500">VARIAN {variantIndex + 1}</p><button type="button" onClick={() => updateBlock(index, { variants: block.variants.filter((item) => item.id !== variant.id) })} className="text-xs text-red-600">Hapus</button></div>
                      <label className="mt-2 block text-xs font-medium text-neutral-700">Nama<input value={variant.name} onChange={(e) => updateBlock(index, { variants: block.variants.map((item) => item.id === variant.id ? { ...item, name: e.target.value } : item) })} className={inputClass} /></label>
                      <label className="mt-2 block text-xs font-medium text-neutral-700">Deskripsi<input value={variant.description} onChange={(e) => updateBlock(index, { variants: block.variants.map((item) => item.id === variant.id ? { ...item, description: e.target.value } : item) })} className={inputClass} /></label>
                      <div className="mt-3"><ImageInput id={`variant-${block.id}-${variant.id}`} label="Gambar varian" value={variant.imageUrl} onChange={(imageUrl) => updateBlock(index, { variants: block.variants.map((item) => item.id === variant.id ? { ...item, imageUrl } : item) })} /></div>
                    </div>)}
                  </div>
                </div> : null}
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
