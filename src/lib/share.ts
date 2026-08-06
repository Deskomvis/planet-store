export async function fetchAsFile(url: string, filename: string): Promise<File> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}

export function filenameFromUrl(url: string, fallbackName: string): string {
  const ext = url.split(".").pop()?.split("?")[0] || "jpg";
  return `${fallbackName}.${ext}`;
}

/**
 * Downloads a file straight to disk, no new tab. Routes through our own
 * /api/download so cross-origin images (R2, or any URL an admin pastes in)
 * don't need CORS headers for the browser to force a download instead of
 * just navigating to the image.
 */
export async function downloadFile(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Downloads all selected images in one ZIP, avoiding browser multi-download blocking. */
export async function downloadFiles(
  files: { url: string; filename: string }[],
  archiveName = "gambar-terpilih.zip"
) {
  if (files.length === 0) return;

  const response = await fetch("/api/download/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(result?.error ?? "Gagal menyiapkan file download");
  }

  const blobUrl = URL.createObjectURL(await response.blob());
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = archiveName.endsWith(".zip") ? archiveName : `${archiveName}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1_000);
}

/** Shares one or more images via the native share sheet when available. */
export async function shareImages(
  images: { url: string; filename: string }[],
  shareTitle: string
): Promise<"shared" | "cancelled" | "unsupported"> {
  if (typeof navigator === "undefined" || !navigator.share) return "unsupported";

  try {
    const files = await Promise.all(images.map((img) => fetchAsFile(img.url, img.filename)));

    if (navigator.canShare && !navigator.canShare({ files })) {
      return "unsupported";
    }

    await navigator.share({ files, title: shareTitle });
    return "shared";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
    return "unsupported";
  }
}
