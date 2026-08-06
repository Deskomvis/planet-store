"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { StockBadge } from "@/components/stock-badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ProductEditDialog, type ManagedProduct } from "@/components/admin/product-edit-dialog";
import { downloadFiles, filenameFromUrl } from "@/lib/share";

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

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkDelete() {
    setBulkDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map((id) => fetch(`/api/products/${id}`, { method: "DELETE" })));
      setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      setConfirmBulkDelete(false);
      exitSelectMode();
      router.refresh();
    } finally {
      setBulkDeleting(false);
    }
  }

  async function handleBulkDownload() {
    if (downloading) return;
    const selected = products.filter((p) => selectedIds.has(p.id) && p.imageUrl);
    setDownloading(true);
    try {
      await downloadFiles(
        selected.map((product) => ({
          url: product.imageUrl!,
          filename: filenameFromUrl(product.imageUrl!, product.name),
        })),
        `${categoryName}-terpilih.zip`
      );
    } finally {
      setDownloading(false);
    }
  }

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
        {selectMode ? (
          <>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={exitSelectMode}
                aria-label="Batalkan pilihan"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-base font-bold text-neutral-900">{selectedIds.size} item dipilih</h2>
            </div>
            <button
              type="button"
              onClick={() =>
                setSelectedIds(
                  selectedIds.size === products.length ? new Set() : new Set(products.map((p) => p.id))
                )
              }
              className="cursor-pointer rounded-full border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {selectedIds.size === products.length ? "Batalkan Semua" : "Pilih Semua"}
            </button>
          </>
        ) : (
          <>
            <h2 className="text-base font-bold text-neutral-900">
              Produk dalam kategori ini <span className="font-normal text-neutral-500">({products.length})</span>
            </h2>
            {products.length > 0 ? (
              <button
                type="button"
                onClick={() => setSelectMode(true)}
                className="cursor-pointer rounded-full border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Pilih
              </button>
            ) : null}
          </>
        )}
      </div>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      {uploading ? (
        <p className="mt-2 text-sm text-neutral-500">
          Mengunggah gambar {uploading.done + 1} dari {uploading.total}...
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {products.map((product) => {
          const isSelected = selectedIds.has(product.id);
          return (
            <div
              key={product.id}
              className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white"
            >
              <button
                type="button"
                onClick={() => (selectMode ? toggleSelected(product.id) : setEditing(product))}
                className="block w-full cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className={`object-cover transition-transform duration-300 ${
                        selectMode ? "" : "group-hover:scale-105"
                      }`}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
                      Tidak ada gambar
                    </div>
                  )}

                  {selectMode ? (
                    <div
                      className={`absolute inset-0 transition-colors ${isSelected ? "bg-black/30" : "bg-black/0"}`}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="text-xs font-medium text-white">Klik untuk edit</span>
                    </div>
                  )}

                  {selectMode ? (
                    <span
                      className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                        isSelected ? "border-white bg-blue-600" : "border-white bg-black/20"
                      }`}
                    >
                      {isSelected ? (
                        <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : null}
                    </span>
                  ) : null}
                </div>
                <div className="p-2.5">
                  <StockBadge inStock={product.inStock} />
                </div>
              </button>

              {!selectMode ? (
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
              ) : null}
            </div>
          );
        })}

        {!selectMode ? (
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
        ) : null}
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

      {selectMode && selectedIds.size > 0 ? (
        <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-full bg-neutral-900 px-4 py-2.5 shadow-xl">
            <span className="text-sm font-medium text-white">{selectedIds.size} item</span>
            <div className="h-4 w-px bg-white/20" />
            <button
              type="button"
              onClick={() => setConfirmBulkDelete(true)}
              disabled={bulkDeleting}
              className="flex cursor-pointer items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"
                />
              </svg>
              Hapus
            </button>
            <button
              type="button"
              onClick={handleBulkDownload}
              disabled={downloading}
              className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
                />
              </svg>
              {downloading ? "Menyiapkan..." : "Download"}
            </button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmBulkDelete}
        message={`${selectedIds.size} produk yang dipilih akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`}
        loading={bulkDeleting}
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />

    </div>
  );
}
