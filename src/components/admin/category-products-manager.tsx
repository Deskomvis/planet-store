"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { StockBadge } from "@/components/stock-badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { ProductEditDialog, type ManagedProduct } from "@/components/admin/product-edit-dialog";

export function CategoryProductsManager({
  categoryId,
  categoryName,
  initialProducts,
}: {
  categoryId: string;
  categoryName: string;
  initialProducts: ManagedProduct[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState<ManagedProduct | null>(null);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFilesSelected(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setError(null);
    setUploading({ done: 0, total: files.length });

    let nextNumber = products.length + 1;
    const created: ManagedProduct[] = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error ?? "Gagal mengunggah gambar");

        const productRes = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `${categoryName} #${nextNumber}`,
            description: null,
            inStock: true,
            imageUrl: uploadData.url,
            categoryId,
          }),
        });
        const productData = await productRes.json();
        if (!productRes.ok) throw new Error(productData.error ?? "Gagal menambah produk");

        created.push(productData.product);
        nextNumber += 1;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengunggah salah satu gambar");
      } finally {
        setUploading((prev) => (prev ? { ...prev, done: prev.done + 1 } : null));
      }
    }

    if (created.length > 0) {
      setProducts((prev) => [...prev, ...created]);
      router.refresh();
    }
    setUploading(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-neutral-900">
          Produk dalam kategori ini <span className="font-normal text-neutral-500">({products.length})</span>
        </h2>
      </div>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      {uploading ? (
        <p className="mt-2 text-sm text-neutral-500">
          Mengunggah gambar {uploading.done + 1} dari {uploading.total}...
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white"
          >
            <button
              type="button"
              onClick={() => setEditing(product)}
              className="block w-full cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
                    Tidak ada gambar
                  </div>
                )}
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-xs font-medium text-white">Klik untuk edit</span>
                </div>
              </div>
              <div className="p-2.5">
                <p className="line-clamp-1 text-sm font-semibold text-neutral-900">{product.name}</p>
                <div className="mt-1.5">
                  <StockBadge inStock={product.inStock} />
                </div>
              </div>
            </button>

            <DeleteButton
              url={`/api/products/${product.id}`}
              confirmMessage={`Produk "${product.name}" akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`}
              onDeleted={() => {
                setProducts((prev) => prev.filter((p) => p.id !== product.id));
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

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={Boolean(uploading)}
          className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-neutral-300 text-neutral-400 transition-colors hover:border-neutral-400 hover:text-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs font-medium">Tambah</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFilesSelected}
        className="hidden"
      />

      {editing ? (
        <ProductEditDialog
          product={editing}
          categoryId={categoryId}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setEditing(null);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}
