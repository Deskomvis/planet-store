import type { Metadata } from "next";
import "./globals.css";

const siteName = "Gudang Planet";
const siteDescription =
  "Katalog produk Gudang Planet: kain, koko dewasa, gamis anak, dan perlengkapan sholat. Cek kategori dan produk terbaru kami.";

// Falls back to Vercel's own production-domain env var so this doesn't need
// to be hardcoded or kept in sync manually when the domain changes. The
// final fallback is the planned cataloggudang.id domain.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://cataloggudang.id");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Katalog Produk`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  // og:title / og:description and twitter:title / twitter:description fall
  // back to the fields above automatically per route, so pages that set
  // their own `title`/`description` (e.g. /kategori/[slug]) get correct
  // social previews without repeating themselves here.
  openGraph: {
    siteName,
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        {children}
      </body>
    </html>
  );
}
