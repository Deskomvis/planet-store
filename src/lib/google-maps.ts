/**
 * Admins paste either a full Google Maps "Embed a map" <iframe> snippet or
 * just the map URL. We only ever pull the src out and render our own
 * <iframe> with fixed attributes — never the pasted HTML directly — so a
 * bad paste can't inject arbitrary markup/script into the page.
 */
export function extractMapEmbedSrc(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  const iframeMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const src = iframeMatch ? iframeMatch[1] : trimmed;

  try {
    const url = new URL(src);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
