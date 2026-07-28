import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { testimonialSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = testimonialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 }
    );
  }

  const testimonial = await prisma.testimonial.update({
    where: { id },
    data: {
      title: parsed.data.title || null,
      description: parsed.data.description || null,
      format: parsed.data.format,
      videoUrl: parsed.data.videoUrl,
    },
  });

  revalidatePath("/testimoni");

  return NextResponse.json({ testimonial });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  await prisma.testimonial.delete({ where: { id } });

  revalidatePath("/testimoni");

  return NextResponse.json({ ok: true });
}
