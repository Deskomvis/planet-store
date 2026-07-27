export function StockBadge({ inStock }: { inStock: boolean }) {
  return (
    <span
      className={
        "inline-block rounded px-2 py-0.5 text-xs font-medium " +
        (inStock
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700")
      }
    >
      {inStock ? "Stok tersedia" : "Stok habis"}
    </span>
  );
}
