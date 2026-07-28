import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { testimonialSchema } from "@/lib/validation";

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ testimonials });
}

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await request.json().catch(() => null);
  const parsed = testimonialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 }
    );
  }

  const { _min } = await prisma.testimonial.aggregate({ _min: { sortOrder: true } });
  const sortOrder = (_min.sortOrder ?? 0) - 10;

  const testimonial = await prisma.testimonial.create({
    data: {
      title: parsed.data.title || null,
      description: parsed.data.description || null,
      format: parsed.data.format,
      videoUrl: parsed.data.videoUrl,
      sortOrder,
    },
  });

  revalidatePath("/testimoni");

  return NextResponse.json({ testimonial }, { status: 201 });
}
