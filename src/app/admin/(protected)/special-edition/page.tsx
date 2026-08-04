import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { SpecialEditionEditor } from "@/components/admin/special-edition-editor";
import { specialEditionSchema, type SpecialEditionBlock } from "@/lib/validation";

const starterBlocks: SpecialEditionBlock[] = [
  { id: "story", type: "editorial", enabled: true, eyebrow: "THE STORY", title: "Dibuat berbeda. Dirilis terbatas.", body: "Sebuah koleksi yang merayakan material, karakter, dan detail yang tidak ditemukan pada rilisan reguler.", imageUrl: "", linkLabel: "", linkUrl: "", items: [], align: "left" },
  { id: "details", type: "features", enabled: true, eyebrow: "SIGNATURE DETAILS", title: "Lebih dari sekadar edisi baru", body: "Setiap elemen dipilih untuk memberi pengalaman yang lebih personal.", imageUrl: "", linkLabel: "", linkUrl: "", items: ["Material pilihan", "Produksi dalam jumlah terbatas", "Detail eksklusif"], align: "left" },
  { id: "closing", type: "cta", enabled: true, eyebrow: "AVAILABLE NOW", title: "Miliki sebelum koleksi berakhir.", body: "Ketersediaan dapat berubah tanpa pemberitahuan.", imageUrl: "", linkLabel: "Jelajahi koleksi", linkUrl: "/", items: [], align: "left" },
];

export default async function SpecialEditionAdminPage() {
  const session = await getSession();
  if (session?.role !== "admin") notFound();

  const page = await prisma.specialEditionPage.findUnique({ where: { id: "special-edition" } });
  let blocks: SpecialEditionBlock[] = starterBlocks;
  if (page?.contentJson) {
    try { blocks = JSON.parse(page.contentJson); } catch { blocks = starterBlocks; }
  }
  const parsed = specialEditionSchema.safeParse({
    title: page?.title ?? "Special Edition",
    eyebrow: page?.eyebrow ?? "LIMITED RELEASE / 2026",
    description: page?.description ?? "Koleksi pilihan untuk mereka yang mencari sesuatu yang tidak biasa.",
    heroImageUrl: page?.heroImageUrl ?? "",
    published: page?.published ?? false,
    blocks,
  });

  return <SpecialEditionEditor initialValue={parsed.success ? parsed.data : { title: "Special Edition", eyebrow: "", description: "", heroImageUrl: "", published: false, blocks: starterBlocks }} />;
}
