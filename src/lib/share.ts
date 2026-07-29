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

/**
 * Downloads several files at once as a single .zip. Safari on iOS only
 * allows one download per user action — triggering several sequential
 * anchor-click downloads (even staggered) silently drops all but the
 * first — so multi-select download has to ship as one file instead of
 * one download per image.
 */
export async function downloadFiles(files: { url: string; filename: string }[], zipName = "produk") {
  if (files.length === 0) return;
  if (files.length === 1) {
    await downloadFile(files[0].url, files[0].filename);
    return;
  }

  const res = await fetch("/api/download/zip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files, zipName }),
  });
  if (!res.ok) return;

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = `${zipName}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
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
