"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { extractMapEmbedSrc } from "@/lib/google-maps";

export function SettingsForm({ initialGoogleMapsEmbed }: { initialGoogleMapsEmbed: string }) {
  const router = useRouter();
  const [googleMapsEmbed, setGoogleMapsEmbed] = useState(initialGoogleMapsEmbed);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const previewSrc = extractMapEmbedSrc(googleMapsEmbed);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (googleMapsEmbed.trim() && !previewSrc) {
      setError("Kode embed tidak valid. Pastikan Anda menyalin dari Google Maps > Bagikan > Sematkan peta.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleMapsEmbed }),
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
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div>
        <label htmlFor="googleMapsEmbed" className="block text-sm font-medium text-neutral-700">
          Google Maps Embed
        </label>
        <textarea
          id="googleMapsEmbed"
          rows={4}
          value={googleMapsEmbed}
          onChange={(e) => setGoogleMapsEmbed(e.target.value)}
          placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 font-mono text-xs focus:border-neutral-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Buka Google Maps &rarr; cari lokasi toko &rarr; Bagikan &rarr; Sematkan peta &rarr; salin
          kode HTML-nya dan tempel di sini. Peta akan tampil di halaman utama, di bawah katalog.
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-green-600">Pengaturan tersimpan.</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="cursor-pointer rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Menyimpan..." : "Simpan Pengaturan"}
      </button>

      {previewSrc ? (
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-700">Pratinjau</p>
          <iframe
            src={previewSrc}
            width="100%"
            height="300"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-lg"
          />
        </div>
      ) : null}
    </form>
  );
}
