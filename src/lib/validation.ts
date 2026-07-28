import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Nama kategori minimal 2 karakter").max(100),
  description: z.string().trim().max(2000).optional().nullable(),
  imageUrl: z.union([z.string().url("URL gambar tidak valid"), z.literal(""), z.null()]).optional(),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Nama produk minimal 2 karakter").max(150),
  description: z.string().trim().max(2000).optional().nullable(),
  inStock: z.boolean().optional().default(true),
  imageUrl: z.union([z.string().url("URL gambar tidak valid"), z.literal(""), z.null()]).optional(),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const settingsSchema = z.object({
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{8,15}$/, "Nomor WhatsApp harus angka saja, format 62xxxxxxxxxx"),
  whatsappMessageTemplate: z.string().trim().max(1000).optional().nullable(),
});
