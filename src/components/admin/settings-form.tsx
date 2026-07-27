"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_WHATSAPP_TEMPLATE } from "@/lib/whatsapp";

export function SettingsForm({
  initialNumber,
  initialTemplate,
}: {
  initialNumber: string;
  initialTemplate: string;
}) {
  const router = useRouter();
  const [whatsappNumber, setWhatsappNumber] = useState(initialNumber);
  const [whatsappMessageTemplate, setWhatsappMessageTemplate] = useState(initialTemplate);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappNumber, whatsappMessageTemplate }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan pengaturan");
        return;
      }

      setSuccess(true);
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
        <label htmlFor="whatsappNumber" className="block text-sm font-medium text-neutral-700">
          Nomor WhatsApp Admin
        </label>
        <input
          id="whatsappNumber"
          type="text"
          required
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          placeholder="6281234567890"
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Format: kode negara tanpa tanda + atau 0 di depan, mis. 62812xxxxxxx. Nomor ini
          dipakai untuk tombol &quot;Share ke WhatsApp Admin&quot; di popup produk.
        </p>
      </div>

      <div>
        <label htmlFor="whatsappMessageTemplate" className="block text-sm font-medium text-neutral-700">
          Template Pesan WhatsApp
        </label>
        <textarea
          id="whatsappMessageTemplate"
          rows={4}
          value={whatsappMessageTemplate}
          onChange={(e) => setWhatsappMessageTemplate(e.target.value)}
          placeholder={DEFAULT_WHATSAPP_TEMPLATE}
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Gunakan <code className="rounded bg-neutral-100 px-1">{"{produk}"}</code> dan{" "}
          <code className="rounded bg-neutral-100 px-1">{"{kategori}"}</code> sebagai placeholder
          yang otomatis diganti nama produk dan kategori. Kosongkan untuk pakai teks default.
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-green-600">Pengaturan tersimpan.</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {loading ? "Menyimpan..." : "Simpan Pengaturan"}
      </button>
    </form>
  );
}
