export const DEFAULT_WHATSAPP_TEMPLATE =
  'Halo, saya tertarik dengan produk "{produk}" ({kategori}). Apakah masih tersedia?';

export function buildWhatsappMessage(
  template: string | null | undefined,
  vars: { produk: string; kategori: string }
): string {
  const text = template && template.trim() !== "" ? template : DEFAULT_WHATSAPP_TEMPLATE;
  return text.replaceAll("{produk}", vars.produk).replaceAll("{kategori}", vars.kategori);
}
