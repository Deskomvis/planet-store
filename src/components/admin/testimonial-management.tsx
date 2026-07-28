"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VideoInput } from "@/components/admin/video-input";
import { DeleteButton } from "@/components/admin/delete-button";

export type ManagedTestimonial = {
  id: string;
  title: string | null;
  description: string | null;
  format: "9:16" | "4:5";
  videoUrl: string;
};

type Filter = "all" | "9:16" | "4:5";

function TestimonialForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: ManagedTestimonial;
  onSaved: (testimonial: ManagedTestimonial) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [format, setFormat] = useState<"9:16" | "4:5">(initial?.format ?? "9:16");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(initial);

  async function handleSubmit() {
    setError(null);
    if (!videoUrl) {
      setError("Video wajib diunggah");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(isEdit ? `/api/testimonials/${initial!.id}` : "/api/testimonials", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || null,
          description: description.trim() || null,
          format,
          videoUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan testimoni");
        return;
      }
      onSaved(data.testimonial);
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
        <h1 className="text-xl font-bold text-neutral-900">{isEdit ? "Edit Testimoni" : "Tambah Testimoni"}</h1>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 cursor-pointer rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Batal
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="testimonial-title" className="block text-sm font-medium text-neutral-700">
            Judul (Opsional)
          </label>
          <input
            id="testimonial-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="contoh: Barangnya bagus banget!"
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="testimonial-description" className="block text-sm font-medium text-neutral-700">
            Deskripsi (Opsional)
          </label>
          <textarea
            id="testimonial-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ceritakan pengalaman pelanggan..."
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Format Ukuran Video <span className="text-red-600">*</span>
          </label>
          <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setFormat("9:16")}
              className={`cursor-pointer rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                format === "9:16" ? "border-neutral-900 bg-neutral-50" : "border-neutral-300 hover:border-neutral-400"
              }`}
            >
              <p className="text-sm font-semibold text-neutral-900">Format 9:16</p>
              <p className="text-xs text-neutral-500">TikTok / Reels (Vertikal)</p>
            </button>
            <button
              type="button"
              onClick={() => setFormat("4:5")}
              className={`cursor-pointer rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                format === "4:5" ? "border-neutral-900 bg-neutral-50" : "border-neutral-300 hover:border-neutral-400"
              }`}
            >
              <p className="text-sm font-semibold text-neutral-900">Format 4:5</p>
              <p className="text-xs text-neutral-500">Feed / Post (Potret)</p>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Video Testimoni <span className="text-red-600">*</span>{" "}
            <span className="font-normal text-neutral-500">Format {format}</span>
          </label>
          <div className="mt-1">
            <VideoInput value={videoUrl} onChange={setVideoUrl} format={format} />
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {loading ? "Menyimpan..." : "Simpan Testimoni"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TestimonialManagement({ initialTestimonials }: { initialTestimonials: ManagedTestimonial[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [mode, setMode] = useState<"list" | "add" | ManagedTestimonial>(
    searchParams.get("new") ? "add" : "list"
  );
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = filter === "all" ? testimonials : testimonials.filter((t) => t.format === filter);

  if (mode === "add" || typeof mode === "object") {
    const initial = typeof mode === "object" ? mode : undefined;
    return (
      <TestimonialForm
        initial={initial}
        onCancel={() => setMode("list")}
        onSaved={(saved) => {
          setTestimonials((prev) =>
            initial ? prev.map((t) => (t.id === saved.id ? saved : t)) : [saved, ...prev]
          );
          setMode("list");
          router.refresh();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4">
        <h1 className="text-xl font-bold text-neutral-900">Tambah Testimoni</h1>
        <button
          type="button"
          onClick={() => setMode("add")}
          className="flex items-center gap-2 cursor-pointer rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Testimoni
        </button>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Daftar Testimoni</h2>
            <span className="mt-1 inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
              {testimonials.length} Video
            </span>
          </div>

          <div className="flex overflow-hidden rounded-full border border-neutral-300 text-xs">
            {(
              [
                ["all", "Semua"],
                ["9:16", "9:16 (Reels)"],
                ["4:5", "4:5 (Feed)"],
              ] as [Filter, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`cursor-pointer px-3 py-1.5 font-medium transition-colors ${
                  filter === value ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-8 py-8 text-center text-sm text-neutral-500">Belum ada testimoni untuk format ini.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {filtered.map((testimonial) => (
              <div
                key={testimonial.id}
                className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-black"
              >
                <button
                  type="button"
                  onClick={() => setMode(testimonial)}
                  className={`block w-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                    testimonial.format === "9:16" ? "aspect-[9/16]" : "aspect-[4/5]"
                  }`}
                >
                  <video src={testimonial.videoUrl} muted preload="metadata" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-2">
                    <p className="line-clamp-2 text-left text-xs font-medium text-white">
                      {testimonial.title || "Tanpa judul"}
                    </p>
                  </div>
                </button>

                <DeleteButton
                  url={`/api/testimonials/${testimonial.id}`}
                  confirmMessage={`Testimoni "${testimonial.title || "ini"}" akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`}
                  onDeleted={() => {
                    setTestimonials((prev) => prev.filter((t) => t.id !== testimonial.id));
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
          </div>
        )}
      </div>
    </div>
  );
}
