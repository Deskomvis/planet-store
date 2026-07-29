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
 * Downloads several files straight to disk, one by one. A short delay
 * between each click is needed because browsers throttle/block a burst of
 * same-tick downloads as a "multiple downloads" popup rather than saving
 * them all.
 */
export async function downloadFiles(files: { url: string; filename: string }[]) {
  for (const [i, file] of files.entries()) {
    if (i > 0) await new Promise((resolve) => setTimeout(resolve, 300));
    await downloadFile(file.url, file.filename);
  }
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
