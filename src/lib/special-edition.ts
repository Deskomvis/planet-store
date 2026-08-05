import type { SpecialEditionBlock, SpecialEditionInput } from "@/lib/validation";

export const starterSpecialEditionBlocks: SpecialEditionBlock[] = [
  { id: "story", type: "editorial", enabled: true, eyebrow: "THE STORY", title: "Dibuat berbeda. Dirilis terbatas.", body: "Sebuah koleksi yang merayakan material, karakter, dan detail yang tidak ditemukan pada rilisan reguler.", imageUrl: "", linkLabel: "", linkUrl: "", items: [], variants: [], align: "left" },
  { id: "variants", type: "variants", enabled: true, eyebrow: "", title: "", body: "", imageUrl: "", linkLabel: "", linkUrl: "", items: [], variants: [], align: "left" },
  { id: "closing", type: "cta", enabled: true, eyebrow: "AVAILABLE NOW", title: "Miliki sebelum koleksi berakhir.", body: "Ketersediaan dapat berubah tanpa pemberitahuan.", imageUrl: "", linkLabel: "Jelajahi koleksi", linkUrl: "/", items: [], variants: [], align: "left" },
];

export function newSpecialEditionValue(): SpecialEditionInput {
  return { slug: "koleksi-baru", title: "Koleksi Baru", eyebrow: "LIMITED RELEASE", description: "Koleksi khusus dalam jumlah terbatas.", heroImageUrl: "", published: false, blocks: starterSpecialEditionBlocks };
}
