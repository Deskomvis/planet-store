"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ImageInput } from "@/components/admin/image-input";

export function CategoryForm({
  categoryId,
  initialName,
  initialDescription,
  initialImageUrl,
}: {
  categoryId?: string;
  initialName?: string;
  initialDescription?: string | null;
  initialImageUrl?: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName ?? "");
  const [description, setDescription] = useState(initialDescription ?? "");
  const [imageUrl, setImageUrl] = useState(initialImageUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(categoryId);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(
        isEdit ? `/api/categories/${categoryId}` : "/api/categories",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description: description.trim() === "" ? null : description.trim(),
            imageUrl: imageUrl.trim() === "" ? null : imageUrl.trim(),
          }),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan kategori");
        return;
      }

      router.push("/admin/kategori");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
          Nama Kategori
        </label>
        <input
          id="name"
          type="text"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          placeholder="mis. Polyester 24s"
        />
      </div>

      <ImageInput
        id="imageUrl"
        label="Gambar Cover (opsional)"
        value={imageUrl}
        onChange={setImageUrl}
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
          Deskripsi (opsional)
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          placeholder="Tampil di kartu kategori pada halaman katalog"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Kategori"}
        </button>
      </div>
    </form>
  );
}
