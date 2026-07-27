import { CategoryForm } from "@/components/admin/category-form";

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900">Tambah Kategori</h1>
      <div className="mt-6">
        <CategoryForm />
      </div>
    </div>
  );
}
