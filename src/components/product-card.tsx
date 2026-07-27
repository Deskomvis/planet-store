import Image from "next/image";
import { StockBadge } from "@/components/stock-badge";

export function ProductCard({
  name,
  inStock,
  imageUrl,
  onClick,
}: {
  name: string;
  inStock: boolean;
  imageUrl: string | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block overflow-hidden rounded-lg border border-neutral-200 bg-white text-left transition-colors hover:border-neutral-400"
    >
      <div className="relative aspect-square w-full bg-neutral-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
            Tidak ada gambar
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-neutral-900">{name}</h3>
        <div className="mt-2">
          <StockBadge inStock={inStock} />
        </div>
      </div>
    </button>
  );
}
