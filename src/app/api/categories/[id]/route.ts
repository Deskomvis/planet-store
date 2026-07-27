import { NextRequest, NextResponse } from "next/server";
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

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      imageUrl: parsed.data.imageUrl || null,
    },
  });

  return NextResponse.json({ category });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
