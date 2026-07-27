"use client";

import { useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";

function isPreviewable(value: string): boolean {
  return value.startsWith("/") || value.startsWith("https://");
}

export function ImageInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [mode, setMode] = useState<"url" | "upload">("upload");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Gagal mengunggah gambar");
        return;
      }

      onChange(data.url);
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
        <div className="flex overflow-hidden rounded border border-neutral-300 text-xs">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`px-2.5 py-1 font-medium ${
              mode === "upload"
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-2.5 py-1 font-medium ${
              mode === "url" ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            URL (opsional)
          </button>
        </div>
      </div>

      {mode === "url" ? (
        <input
          id={id}
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      ) : (
        <div className="mt-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-700 disabled:opacity-50"
          />
          {uploading ? <p className="mt-1 text-xs text-neutral-500">Mengunggah...</p> : null}
        </div>
      )}

      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}

      {isPreviewable(value) ? (
        <div className="relative mt-2 h-24 w-24 overflow-hidden rounded border border-neutral-200 bg-neutral-100">
          <Image src={value} alt="Pratinjau" fill className="object-cover" />
        </div>
      ) : null}
    </div>
  );
}
