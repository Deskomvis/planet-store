import Link from "next/link";
import { prisma } from "@/lib/db";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">Produk</h1>
        <Link
          href="/admin/produk/baru"
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Tambah Produk
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50">
            <tr>
              <th className="px-4 py-2 font-medium text-neutral-600">Nama</th>
              <th className="px-4 py-2 font-medium text-neutral-600">Kategori</th>
              <th className="px-4 py-2 font-medium text-neutral-600">Stok</th>
              <th className="px-4 py-2 font-medium text-neutral-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-2 text-neutral-900">{product.name}</td>
                <td className="px-4 py-2 text-neutral-500">{product.category.name}</td>
                <td className="px-4 py-2 text-neutral-500">
                  {product.inStock ? "Tersedia" : "Habis"}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/produk/${product.id}/edit`}
                      className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
                    >
                      Edit
                    </Link>
                    <DeleteButton
                      url={`/api/products/${product.id}`}
                      confirmMessage={`Hapus produk "${product.name}"?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">
                  Belum ada produk.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
