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
