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

export const testimonialSchema = z.object({
  title: z.string().trim().max(150).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  format: z.enum(["9:16", "4:5"], { message: "Format wajib dipilih" }),
  videoUrl: z.string().url("Video wajib diunggah"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const settingsSchema = z.object({
  googleMapsEmbed: z.string().trim().max(3000).optional().nullable(),
});
