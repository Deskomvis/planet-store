import { prisma } from "@/lib/db";
import { SpecialEditionManagement } from "@/components/admin/special-edition-management";

export default async function SpecialEditionAdminPage() {
  const pages = await prisma.specialEditionPage.findMany({ orderBy: { updatedAt: "desc" } });
  return <SpecialEditionManagement initialPages={pages.map((page) => ({ ...page, updatedAt: page.updatedAt.toISOString() }))} />;
}
