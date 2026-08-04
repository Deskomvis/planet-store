import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { specialEditionSchema } from "@/lib/validation";

export async function PUT(request: NextRequest) {
  const { response } = await requireAdmin({ role: "admin" });
  if (response) return response;

  const parsed = specialEditionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 },
    );
  }

  const { blocks, ...page } = parsed.data;
  const saved = await prisma.specialEditionPage.upsert({
    where: { id: "special-edition" },
    update: {
      ...page,
      eyebrow: page.eyebrow || null,
      description: page.description || null,
      heroImageUrl: page.heroImageUrl || null,
      contentJson: JSON.stringify(blocks),
    },
    create: {
      id: "special-edition",
      ...page,
      eyebrow: page.eyebrow || null,
      description: page.description || null,
      heroImageUrl: page.heroImageUrl || null,
      contentJson: JSON.stringify(blocks),
    },
  });

  revalidatePath("/special-edition");
  revalidatePath("/admin/special-edition");
  return NextResponse.json({ page: saved });
}
