"use client";

import { useState } from "react";

type Changes = { price?: number | null; originalPrice?: number | null; description?: string | null };

export function BulkProductDialog({ categoryId, ids, onClose, onSaved }: { categoryId: string; ids: string[]; onClose: () => void; onSaved: (changes: Changes, count: number) => void }) {
  const [enabled, setEnabled] = useState({ price: false, originalPrice: false, description: false });
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function save() {
    const changes: Changes = {};
    if (enabled.price) changes.price = price === "" ? null : Number(price);
    if (enabled.originalPrice) changes.originalPrice = originalPrice === "" ? null : Number(originalPrice);
    if (enabled.description) changes.description = description.trim() || null;
    if (!Object.keys(changes).length) { setError("Pilih setidaknya satu kolom untuk diubah."); return; }
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/products/bulk", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ categoryId, ids, changes }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error ?? "Gagal menyimpan perubahan."); return; }
      onSaved(changes, data.count);
    } catch { setError("Terjadi kesalahan jaringan."); } finally { setLoading(false); }
  }
  return <div role="dialog" aria-modal="true" aria-labelledby="bulk-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
      <h2 id="bulk-title" className="text-lg font-bold">Edit {ids.length} produk</h2>
      <p className="mt-2 text-sm text-neutral-600">Centang kolom yang ingin diubah. Kosongkan nilai untuk menghapus isinya pada produk terpilih.</p>
      <div className="mt-5 space-y-4">
        {([ ["price", "Harga (Rp)", price, setPrice], ["originalPrice", "Harga awal (Rp)", originalPrice, setOriginalPrice] ] as const).map(([key, label, value, setValue]) => <div key={key}>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={enabled[key]} onChange={(e) => setEnabled({ ...enabled, [key]: e.target.checked })} />{label}</label>
          <input aria-label={label} type="number" min="0" max="2147483647" step="1" disabled={!enabled[key]} value={value} onChange={(e) => setValue(e.target.value)} className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 disabled:bg-neutral-100" />
        </div>)}
        <div><label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={enabled.description} onChange={(e) => setEnabled({ ...enabled, description: e.target.checked })} />Keterangan</label><textarea aria-label="Keterangan" disabled={!enabled.description} maxLength={2000} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 disabled:bg-neutral-100" /></div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-3"><button type="button" onClick={onClose} disabled={loading} className="rounded px-4 py-2 text-sm">Batal</button><button type="button" onClick={save} disabled={loading} className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{loading ? "Menyimpan..." : "Simpan perubahan"}</button></div>
      </div>
    </div>
  </div>;
}
