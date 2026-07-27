"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductLightbox, type LightboxProduct } from "@/components/product-lightbox";

export function CategoryProductGrid({
  products,
  categoryName,
  whatsappNumber,
  whatsappMessageTemplate,
}: {
  products: LightboxProduct[];
  categoryName: string;
  whatsappNumber: string | null;
  whatsappMessageTemplate: string | null;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";

  const filtered = q
    ? products.filter((product) => product.name.toLowerCase().includes(q))
    : products;

  return (
    <>
      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">Produk tidak ditemukan.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              inStock={product.inStock}
              imageUrl={product.imageUrl}
              onClick={() => setOpenIndex(products.indexOf(product))}
            />
          ))}
        </div>
      )}

      {openIndex !== null ? (
        <ProductLightbox
          products={products}
          index={openIndex}
          categoryName={categoryName}
          whatsappNumber={whatsappNumber}
          whatsappMessageTemplate={whatsappMessageTemplate}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      ) : null}
    </>
  );
}
