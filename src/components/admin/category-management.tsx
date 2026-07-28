import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { DeleteButton } from "@/components/admin/delete-button";
import { ReorderButtons } from "@/components/admin/reorder-buttons";

export async function CategoryManagement() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4">
        <h1 className="text-xl font-bold text-neutral-900">Tambah Kategori</h1>
        <Link
          href="/admin/kategori/baru"
          className="flex items-center gap-2 cursor-pointer rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Kategori
        </Link>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">Daftar Kategori</h2>
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
            {categories.length} Kategori
          </span>
        </div>

        <div className="mt-4 divide-y divide-neutral-100">
          {categories.map((category, i) => (
            <div key={category.id} className="flex items-center gap-3 py-4">
              <ReorderButtons
                categoryId={category.id}
                disableUp={i === 0}
                disableDown={i === categories.length - 1}
              />

              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-neutral-100">
                {category.imageUrl ? (
                  <Image src={category.imageUrl} alt={category.name} fill sizes="56px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-300">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold uppercase text-neutral-900">{category.name}</p>
                <p className="truncate text-sm text-neutral-500">
                  {category.description || `${category._count.products} produk`}
                </p>
              </div>

              <Link
                href={`/admin/kategori/${category.id}/edit`}
                aria-label={`Edit kategori ${category.name}`}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </Link>

              <DeleteButton
                url={`/api/categories/${category.id}`}
                confirmMessage={`Kategori "${category.name}" beserta ${category._count.products} produk di dalamnya akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"
                  />
                </svg>
              </DeleteButton>
            </div>
          ))}

          {categories.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-500">Belum ada kategori.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
