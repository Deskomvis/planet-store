import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { specialEditionSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = specialEditionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 },
    );
  }

  const existing = await prisma.specialEditionPage.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "Slug sudah digunakan halaman lain" }, { status: 409 });

  const { blocks, ...page } = parsed.data;
  const saved = await prisma.specialEditionPage.create({ data: {
    ...page,
    eyebrow: page.eyebrow || null,
    description: page.description || null,
    heroImageUrl: page.heroImageUrl || null,
    contentJson: JSON.stringify(blocks),
  }});

  revalidatePath("/special-edition");
  return NextResponse.json({ page: saved });
}
