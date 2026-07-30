"use client";

import { useState } from "react";
import { downloadFile } from "@/lib/share";

/**
 * Downloads several files one at a time, requiring a real tap for each.
 * iOS browsers (Safari, and Chrome-on-iOS since it's WebKit underneath)
 * only allow one download per user gesture — a loop of automatic,
 * script-triggered downloads silently drops everything after the first.
 * Making each download its own button tap keeps every file a genuine
 * user action, so it works everywhere.
 */
export function BulkDownloadDialog({
  files,
  onClose,
}: {
  files: { url: string; filename: string }[];
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const total = files.length;
  const current = files[index];
  const done = index >= total;

  function handleSave() {
    if (!current) return;
    downloadFile(current.url, current.filename);
    setIndex((i) => i + 1);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={done ? onClose : undefined}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <>
            <p className="text-lg font-semibold text-neutral-900">{total} gambar tersimpan</p>
            <p className="mt-1 text-sm text-neutral-500">Semua gambar terpilih sudah diproses.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full cursor-pointer rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Selesai
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-neutral-500">
              Gambar {index + 1} dari {total}
            </p>
            <p className="mt-1 line-clamp-1 text-base font-semibold text-neutral-900">{current.filename}</p>
            <p className="mt-3 text-sm text-neutral-500">
              Tap tombol di bawah untuk menyimpan gambar ini. Browser di iPhone hanya bisa menyimpan
              satu gambar per tap, jadi ulangi untuk tiap gambar.
            </p>
            <button
              type="button"
              onClick={handleSave}
              className="mt-5 w-full cursor-pointer rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Simpan Gambar {index + 1}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 w-full cursor-pointer rounded-full px-5 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Batal
            </button>
          </>
        )}
      </div>
    </div>
  );
}
