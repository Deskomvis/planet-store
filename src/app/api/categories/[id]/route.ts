import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { categorySchema } from "@/lib/validation";
import { slugify } from "@/lib/slug";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 }
    );
  }

  const slug = slugify(parsed.data.name);

  const conflict = await prisma.category.findFirst({
    where: { slug, NOT: { id } },
  });
  if (conflict) {
    return NextResponse.json({ error: "Kategori dengan nama serupa sudah ada" }, { status: 409 });
  }

  const existing = await prisma.category.findUnique({ where: { id }, select: { slug: true } });

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      imageUrl: parsed.data.imageUrl || null,
    },
  });

  revalidatePath("/");
  if (existing) revalidatePath(`/kategori/${existing.slug}`);
  if (existing && existing.slug !== slug) revalidatePath(`/kategori/${slug}`);

  return NextResponse.json({ category });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const existing = await prisma.category.findUnique({ where: { id }, select: { slug: true } });
  await prisma.category.delete({ where: { id } });

  revalidatePath("/");
  if (existing) revalidatePath(`/kategori/${existing.slug}`);

  return NextResponse.json({ ok: true });
}
