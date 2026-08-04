import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { specialEditionSchema } from "@/lib/validation";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id } = await context.params;
  const parsed = specialEditionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" }, { status: 400 });

  const conflict = await prisma.specialEditionPage.findFirst({ where: { slug: parsed.data.slug, id: { not: id } } });
  if (conflict) return NextResponse.json({ error: "Slug sudah digunakan halaman lain" }, { status: 409 });
  const previous = await prisma.specialEditionPage.findUnique({ where: { id } });
  if (!previous) return NextResponse.json({ error: "Halaman tidak ditemukan" }, { status: 404 });

  const { blocks, ...page } = parsed.data;
  const saved = await prisma.specialEditionPage.update({ where: { id }, data: {
    ...page,
    eyebrow: page.eyebrow || null,
    description: page.description || null,
    heroImageUrl: page.heroImageUrl || null,
    contentJson: JSON.stringify(blocks),
  }});
  revalidatePath("/special-edition");
  revalidatePath(`/special-edition/${previous.slug}`);
  revalidatePath(`/special-edition/${saved.slug}`);
  return NextResponse.json({ page: saved });
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id } = await context.params;
  const page = await prisma.specialEditionPage.findUnique({ where: { id } });
  if (!page) return NextResponse.json({ error: "Halaman tidak ditemukan" }, { status: 404 });
  await prisma.specialEditionPage.delete({ where: { id } });
  revalidatePath("/special-edition");
  revalidatePath(`/special-edition/${page.slug}`);
  return NextResponse.json({ ok: true });
}
