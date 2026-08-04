import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SpecialEditionEditor } from "@/components/admin/special-edition-editor";
import { specialEditionSchema } from "@/lib/validation";
import { starterSpecialEditionBlocks } from "@/lib/special-edition";

export default async function EditSpecialEditionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await prisma.specialEditionPage.findUnique({ where: { id } });
  if (!page) notFound();
  let blocks: unknown = starterSpecialEditionBlocks;
  try { blocks = JSON.parse(page.contentJson); } catch {}
  const parsed = specialEditionSchema.safeParse({ ...page, eyebrow: page.eyebrow ?? "", description: page.description ?? "", heroImageUrl: page.heroImageUrl ?? "", blocks });
  if (!parsed.success) notFound();
  return <SpecialEditionEditor initialValue={parsed.data} pageId={page.id} />;
}
