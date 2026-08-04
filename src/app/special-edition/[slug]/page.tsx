import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SpecialEditionView } from "@/app/special-edition/page";

export const revalidate = 3600;

export async function generateStaticParams() {
  const pages = await prisma.specialEditionPage.findMany({ where: { published: true }, select: { slug: true } });
  return pages.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.specialEditionPage.findUnique({ where: { slug }, select: { title: true, description: true } });
  return page ? { title: `${page.title} | Gudang Planet`, description: page.description } : {};
}

export default async function SpecialEditionSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await prisma.specialEditionPage.findUnique({ where: { slug } });
  if (!page?.published) notFound();
  return <SpecialEditionView page={page} />;
}
