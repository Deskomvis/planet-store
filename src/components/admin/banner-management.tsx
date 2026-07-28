"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DeleteButton } from "@/components/admin/delete-button";

export type ManagedBanner = {
  id: string;
  imageUrl: string;
  link: string | null;
};

function BannerLinkDialog({
  banner,
  onClose,
  onSaved,
}: {
  banner: ManagedBanner;
  onClose: () => void;
  onSaved: (banner: ManagedBanner) => void;
}) {
  const [link, setLink] = useState(banner.link ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/banners/${banner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: banner.imageUrl, link: link.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan tautan");
        return;
      }
      onSaved(data.banner);
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Edit tautan banner"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base font-bold text-neutral-900">Tautan Banner</h2>
        <div className="relative mt-3 aspect-[16/6] w-full overflow-hidden rounded-lg bg-neutral-100">
          <Image src={banner.imageUrl} alt="Banner" fill className="object-cover" />
        </div>
        <div className="mt-4">
          <label htmlFor="banner-link" className="block text-sm font-medium text-neutral-700">
            URL Tujuan (opsional)
          </label>
          <input
            id="banner-link"
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Kosongkan jika banner ini tidak perlu bisa diklik.
          </p>
        </div>

        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="cursor-pointer rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BannerManagement({ initialBanners }: { initialBanners: ManagedBanner[] }) {
  const router = useRouter();
  const [banners, setBanners] = useState(initialBanners);
  const [editing, setEditing] = useState<ManagedBanner | null>(null);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFilesSelected(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setError(null);
    setUploading({ done: 0, total: files.length });
    const created: ManagedBanner[] = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error ?? "Gagal mengunggah gambar");

        const bannerRes = await fetch("/api/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: uploadData.url, link: null }),
        });
        const bannerData = await bannerRes.json();
        if (!bannerRes.ok) throw new Error(bannerData.error ?? "Gagal menambah banner");

        created.push(bannerData.banner);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengunggah salah satu gambar");
      } finally {
        setUploading((prev) => (prev ? { ...prev, done: prev.done + 1 } : null));
      }
    }

    if (created.length > 0) {
      setBanners((prev) => [...created, ...prev]);
      router.refresh();
    }
    setUploading(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Banner Katalog</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Tampil sebagai slider di bagian atas halaman katalog. Gunakan gambar landscape
            dengan rasio 16:6 (mis. 1600 x 600px) agar tidak terpotong, dan posisikan objek
            penting di tengah karena tepi kiri-kanan bisa sedikit terpotong di layar mobile.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={Boolean(uploading)}
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Banner
        </button>
      </div>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      {uploading ? (
        <p className="mt-2 text-sm text-neutral-500">
          Mengunggah gambar {uploading.done + 1} dari {uploading.total}...
        </p>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFilesSelected}
        className="hidden"
      />

      {banners.length === 0 ? (
        <p className="mt-6 py-6 text-center text-sm text-neutral-500">Belum ada banner.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white"
            >
              <button
                type="button"
                onClick={() => setEditing(banner)}
                className="block w-full cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <div className="relative aspect-[16/6] w-full overflow-hidden bg-neutral-100">
                  <Image
                    src={banner.imageUrl}
                    alt="Banner"
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-xs font-medium text-white">
                      {banner.link ? "Ada tautan" : "Klik untuk atur tautan"}
                    </span>
                  </div>
                </div>
              </button>

              <DeleteButton
                url={`/api/banners/${banner.id}`}
                confirmMessage="Banner ini akan dihapus permanen. Tindakan ini tidak bisa dibatalkan."
                onDeleted={() => {
                  setBanners((prev) => prev.filter((b) => b.id !== banner.id));
                  router.refresh();
                }}
                className="absolute right-2 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 text-red-600 opacity-0 shadow-sm transition-opacity hover:bg-white group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"
                  />
                </svg>
              </DeleteButton>
            </div>
          ))}
        </div>
      )}

      {editing ? (
        <BannerLinkDialog
          banner={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
            setEditing(null);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}
