import Link from "next/link";
import { prisma } from "@/lib/db";
import { DeleteButton } from "@/components/admin/delete-button";
import { ReorderButtons } from "@/components/admin/reorder-buttons";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">Kategori</h1>
        <Link
          href="/admin/kategori/baru"
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Tambah Kategori
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50">
            <tr>
              <th className="px-4 py-2 font-medium text-neutral-600">Urutan</th>
              <th className="px-4 py-2 font-medium text-neutral-600">Nama</th>
              <th className="px-4 py-2 font-medium text-neutral-600">Slug</th>
              <th className="px-4 py-2 font-medium text-neutral-600">Produk</th>
              <th className="px-4 py-2 font-medium text-neutral-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, i) => (
              <tr key={category.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-2">
                  <ReorderButtons
                    categoryId={category.id}
                    disableUp={i === 0}
                    disableDown={i === categories.length - 1}
                  />
                </td>
                <td className="px-4 py-2 text-neutral-900">{category.name}</td>
                <td className="px-4 py-2 text-neutral-500">{category.slug}</td>
                <td className="px-4 py-2 text-neutral-500">{category._count.products}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/kategori/${category.id}/edit`}
                      className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
                    >
                      Edit
                    </Link>
                    <DeleteButton
                      url={`/api/categories/${category.id}`}
                      confirmMessage={`Hapus kategori "${category.name}"? Semua produk di dalamnya juga akan terhapus.`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                  Belum ada kategori.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
