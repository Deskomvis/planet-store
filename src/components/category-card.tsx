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
      className="group block cursor-pointer overflow-hidden rounded-lg border border-neutral-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:rounded-2xl"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
            Tidak ada gambar
          </div>
        )}
      </div>
      <div className="p-1.5 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="line-clamp-1 text-xs font-bold uppercase tracking-tight text-neutral-900 sm:text-base">
            {name}
          </h2>
          <span className="hidden shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 sm:inline-block">
            Produk
          </span>
        </div>
        <p className="mt-1 hidden text-sm text-neutral-500 sm:block">
          {description || "Tidak ada deskripsi."}
        </p>
      </div>
    </Link>
  );
}
