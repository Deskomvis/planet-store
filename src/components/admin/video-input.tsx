"use client";

import { useRef, useState, type ChangeEvent } from "react";

const MAX_SIZE_BYTES = 100 * 1024 * 1024;

export function VideoInput({
  value,
  onChange,
  format,
}: {
  value: string;
  onChange: (url: string) => void;
  format: "9:16" | "4:5";
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.type !== "video/mp4") {
      setError("Video harus format MP4");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError("Ukuran video maksimal 100MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const presignRes = await fetch("/api/upload-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, size: file.size }),
      });
      const presignData = await presignRes.json();
      if (!presignRes.ok) {
        setError(presignData.error ?? "Gagal menyiapkan upload");
        return;
      }

      const putRes = await fetch(presignData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) {
        setError("Gagal mengunggah video ke penyimpanan");
        return;
      }

      onChange(presignData.publicUrl);
    } catch {
      setError("Terjadi kesalahan jaringan saat mengunggah video");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (value) {
    return (
      <div>
        <video
          src={value}
          controls
          className={`rounded-lg bg-black ${format === "9:16" ? "aspect-[9/16] max-h-96" : "aspect-[4/5] max-h-96"}`}
        />
        <button
          type="button"
          onClick={() => onChange("")}
          className="mt-2 cursor-pointer text-sm font-medium text-red-600 transition-colors hover:text-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Ganti video
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-300 px-4 py-10 text-center transition-colors hover:border-neutral-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg className="h-8 w-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.5 4h-5L7 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1h-3l-2.5-3z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l3 2-3 2v-4z" />
        </svg>
        <span className="text-sm font-semibold text-neutral-900">
          {uploading ? "Mengunggah..." : `Pilih Video (${format})`}
        </span>
        <span className="text-xs text-neutral-500">MP4 &middot; Rasio {format} &middot; Maks 100MB</span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />

      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
