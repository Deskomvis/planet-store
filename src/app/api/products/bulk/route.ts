import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const schema = z.object({
  categoryId: z.string().min(1),
  ids: z.array(z.string().min(1)).min(1),
  changes: z.object({
    price: z.number().int().min(0).max(2147483647).nullable().optional(),
    originalPrice: z.number().int().min(0).max(2147483647).nullable().optional(),
    description: z.string().trim().max(2000).nullable().optional(),
  }).strict().refine((value) => Object.keys(value).length > 0, "Pilih setidaknya satu kolom"),
});

export async function PATCH(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" }, { status: 400 });
  const { categoryId, ids, changes } = parsed.data;
  const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { slug: true } });
  if (!category) return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
  const uniqueIds = [...new Set(ids)];
  const result = await prisma.product.updateMany({ where: { id: { in: uniqueIds }, categoryId }, data: changes });
  revalidatePath(`/kategori/${category.slug}`);
  revalidatePath("/katalog-harga");
  return NextResponse.json({ count: result.count });
}
