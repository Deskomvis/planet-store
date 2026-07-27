import Image from "next/image";
import Link from "next/link";

export function CategoryCard({
  name,
  slug,
  description,
  imageUrl,
}: {
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
}) {
  return (
    <Link
      href={`/kategori/${slug}`}
      className="block overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-colors hover:border-neutral-400"
    >
      <div className="relative aspect-[4/5] w-full bg-neutral-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
            Tidak ada gambar
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-bold uppercase tracking-tight text-neutral-900">{name}</h2>
          <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
            Produk
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">{description || "Tidak ada deskripsi."}</p>
      </div>
    </Link>
  );
}
