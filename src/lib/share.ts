export function filenameFromUrl(url: string, fallbackName: string): string {
  const ext = url.split(".").pop()?.split("?")[0] || "jpg";
  return `${fallbackName}.${ext}`;
}

export async function downloadFile(url: string, filename: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

/**
 * Downloads the given images (WhatsApp has no URL-based way to receive
 * files) then opens WhatsApp with a prefilled message so the user can pick
 * a chat and attach the just-downloaded image(s) themselves.
 */
export async function shareToWhatsApp(
  images: { url: string; filename: string }[],
  message: string
): Promise<void> {
  for (const img of images) {
    await downloadFile(img.url, img.filename);
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}
