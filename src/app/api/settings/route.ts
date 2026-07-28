import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { settingsSchema } from "@/lib/validation";

export async function GET() {
  const settings = await prisma.storeSettings.findUnique({ where: { id: "settings" } });
  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await request.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 }
    );
  }

  const googleMapsEmbed = parsed.data.googleMapsEmbed?.trim() || null;

  const settings = await prisma.storeSettings.upsert({
    where: { id: "settings" },
    update: { googleMapsEmbed },
    create: { id: "settings", googleMapsEmbed },
  });

  revalidatePath("/");

  return NextResponse.json({ settings });
}
