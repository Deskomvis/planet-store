"use client";

import { useState } from "react";
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

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            name={product.name}
            inStock={product.inStock}
            imageUrl={product.imageUrl}
            onClick={() => setOpenIndex(i)}
          />
        ))}
      </div>

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
