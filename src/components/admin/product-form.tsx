"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ImageInput } from "@/components/admin/image-input";

type Category = { id: string; name: string };

export function ProductForm({
  categories,
  productId,
  initial,
}: {
  categories: Category[];
  productId?: string;
  initial?: {
    name: string;
    description: string;
    inStock: boolean;
    imageUrl: string | null;
    categoryId: string;
  };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [inStock, setInStock] = useState(initial?.inStock ?? true);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(productId);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(isEdit ? `/api/products/${productId}` : "/api/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          inStock,
          imageUrl: imageUrl.trim() === "" ? null : imageUrl.trim(),
          categoryId,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan produk");
        return;
      }

      router.push("/admin/produk");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
          Nama Produk
        </label>
        <input
          id="name"
          type="text"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
          Deskripsi Singkat
        </label>
        <textarea
          id="description"
          required
          minLength={5}
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-neutral-700">
          Kategori
        </label>
        <select
          id="categoryId"
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <ImageInput
        id="imageUrl"
        label="Gambar Produk (opsional)"
        value={imageUrl}
        onChange={setImageUrl}
      />

      <div className="flex items-center gap-2">
        <input
          id="inStock"
          type="checkbox"
          checked={inStock}
          onChange={(e) => setInStock(e.target.checked)}
          className="h-4 w-4 rounded border-neutral-300"
        />
        <label htmlFor="inStock" className="text-sm font-medium text-neutral-700">
          Stok tersedia
        </label>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Produk"}
      </button>
    </form>
  );
}
