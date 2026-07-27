import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Planet Store — Katalog Produk",
    template: "%s | Planet Store",
  },
  description:
    "Katalog produk Planet Store: kain, koko dewasa, gamis anak, dan perlengkapan sholat. Cek kategori dan produk terbaru kami.",
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
