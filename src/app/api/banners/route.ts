import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { bannerSchema } from "@/lib/validation";

export async function GET() {
  const banners = await prisma.banner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ banners });
}

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin({ role: "admin" });
  if (response) return response;

  const body = await request.json().catch(() => null);
  const parsed = bannerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 }
    );
  }

  const { _min } = await prisma.banner.aggregate({ _min: { sortOrder: true } });
  const sortOrder = (_min.sortOrder ?? 0) - 10;

  const banner = await prisma.banner.create({
    data: {
      imageUrl: parsed.data.imageUrl,
      link: parsed.data.link || null,
      sortOrder,
    },
  });

  revalidatePath("/");

  return NextResponse.json({ banner }, { status: 201 });
}
