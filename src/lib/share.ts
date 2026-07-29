export async function fetchAsFile(url: string, filename: string): Promise<File> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}

export function filenameFromUrl(url: string, fallbackName: string): string {
  const ext = url.split(".").pop()?.split("?")[0] || "jpg";
  return `${fallbackName}.${ext}`;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Downloads a file straight to disk, no new tab. Routes through our own
 * /api/download so cross-origin images (R2, or any URL an admin pastes in)
 * don't need CORS headers for the browser to force a download instead of
 * just navigating to the image. Fetches the bytes first (instead of just
 * pointing an anchor at the URL) so the caller can actually wait for this
 * file to finish downloading before starting the next one.
 */
export async function downloadFile(url: string, filename: string) {
  const res = await fetch(`/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`);
  if (!res.ok) return;

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoking too soon can cancel the save on some browsers before they've
  // actually read the blob.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
}

/**
 * Downloads several files straight to disk, one at a time: each file's
 * bytes are fully fetched before its save is triggered, and there's a
 * pause after each save so the browser's download/save UI has time to
 * settle before the next one starts — some mobile browsers silently drop
 * a save that's triggered while the previous one is still being handled.
 */
export async function downloadFiles(files: { url: string; filename: string }[]) {
  for (const [i, file] of files.entries()) {
    if (i > 0) await wait(1200);
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
