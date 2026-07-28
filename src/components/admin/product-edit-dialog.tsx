"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImageInput } from "@/components/admin/image-input";

export type ManagedProduct = {
  id: string;
  name: string;
  description: string | null;
  inStock: boolean;
  imageUrl: string | null;
};

export function ProductEditDialog({
  product,
  categoryId,
  onClose,
  onSaved,
}: {
  product: ManagedProduct;
  categoryId: string;
  onClose: () => void;
  onSaved: (product: ManagedProduct) => void;
}) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [inStock, setInStock] = useState(product.inStock);
  const [imageUrl, setImageUrl] = useState(product.imageUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleSave() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description.trim() || null,
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
      onSaved(data.product);
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
      aria-label={`Edit produk ${product.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-900">Edit Produk</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="cursor-pointer rounded-full p-1 text-neutral-500 hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="product-name" className="block text-sm font-medium text-neutral-700">
              Nama Produk
            </label>
            <input
              id="product-name"
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="product-description" className="block text-sm font-medium text-neutral-700">
              Deskripsi (opsional)
            </label>
            <textarea
              id="product-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
            />
          </div>

          <ImageInput id="product-image" label="Gambar Produk" value={imageUrl} onChange={setImageUrl} />

          {imageUrl && imageUrl === product.imageUrl ? (
            <div className="relative h-24 w-24 overflow-hidden rounded border border-neutral-200 bg-neutral-100">
              <Image src={imageUrl} alt={name} fill className="object-cover" />
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <input
              id="product-instock"
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300"
            />
            <label htmlFor="product-instock" className="text-sm font-medium text-neutral-700">
              Stok tersedia
            </label>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex justify-end gap-3">
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
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
