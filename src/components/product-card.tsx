import Image from "next/image";
import { StockBadge } from "@/components/stock-badge";

export function ProductCard({
  name,
  inStock,
  imageUrl,
  onClick,
  selectMode = false,
  selected = false,
}: {
  name: string;
  inStock: boolean;
  imageUrl: string | null;
  onClick: () => void;
  selectMode?: boolean;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group block w-full cursor-pointer overflow-hidden rounded-lg border border-neutral-200 bg-white text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 33vw, 25vw"
            className={`object-cover transition-transform duration-300 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
              selectMode ? "" : "group-hover:scale-105"
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
            Tidak ada gambar
          </div>
        )}

        {selectMode ? (
          <>
            <div className={`absolute inset-0 transition-colors ${selected ? "bg-black/30" : "bg-black/0"}`} />
            <span
              className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                selected ? "border-white bg-blue-600" : "border-white bg-black/20"
              }`}
            >
              {selected ? (
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : null}
            </span>
          </>
        ) : null}
      </div>
      <div className="p-1.5 sm:p-3">
        <StockBadge inStock={inStock} />
      </div>
    </button>
  );
}
