import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { productSchema } from "@/lib/validation";
import { slugify } from "@/lib/slug";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 }
    );
  }

  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) {
    return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({
    where: { id },
    select: { category: { select: { slug: true } } },
  });

  const baseSlug = slugify(parsed.data.name);
  let slug = baseSlug;
  let suffix = 1;
  while (
    await prisma.product.findFirst({ where: { slug, NOT: { id } } })
  ) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      inStock: parsed.data.inStock ?? true,
      imageUrl: parsed.data.imageUrl || null,
      categoryId: parsed.data.categoryId,
    },
  });

  revalidatePath(`/kategori/${category.slug}`);
  if (existing && existing.category.slug !== category.slug) {
    revalidatePath(`/kategori/${existing.category.slug}`);
  }

  return NextResponse.json({ product });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const existing = await prisma.product.findUnique({
    where: { id },
    select: { category: { select: { slug: true } } },
  });
  await prisma.product.delete({ where: { id } });

  if (existing) revalidatePath(`/kategori/${existing.category.slug}`);

  return NextResponse.json({ ok: true });
}
