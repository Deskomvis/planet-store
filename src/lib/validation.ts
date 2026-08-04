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

export const bannerSchema = z.object({
  imageUrl: z.string().url("Gambar wajib diunggah"),
  link: z.union([
    z.string().url("URL tautan tidak valid"),
    z.string().regex(/^\/(?!\/)/, "Link internal harus diawali satu karakter /"),
    z.literal(""),
    z.null(),
  ]).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const settingsSchema = z.object({
  googleMapsEmbed: z.string().trim().max(3000).optional().nullable(),
});

const specialEditionBlockSchema = z.object({
  id: z.string().min(1).max(100),
  type: z.enum(["editorial", "product", "features", "variants", "cta"]),
  enabled: z.boolean(),
  eyebrow: z.string().trim().max(100).optional().default(""),
  title: z.string().trim().max(180).optional().default(""),
  body: z.string().trim().max(3000).optional().default(""),
  imageUrl: z.union([z.string().url("URL gambar tidak valid"), z.literal("")]).optional().default(""),
  linkLabel: z.string().trim().max(80).optional().default(""),
  linkUrl: z.union([z.string().url("URL tautan tidak valid"), z.string().startsWith("/"), z.literal("")]).optional().default(""),
  items: z.array(z.string().trim().max(120)).max(8).optional().default([]),
  variants: z.array(z.object({
    id: z.string().min(1).max(100),
    name: z.string().trim().max(120),
    description: z.string().trim().max(300).optional().default(""),
    imageUrl: z.union([z.string().url("URL gambar varian tidak valid"), z.literal("")]).optional().default(""),
  })).max(24).optional().default([]),
  align: z.enum(["left", "right"]).optional().default("left"),
});

export const specialEditionSchema = z.object({
  slug: z.string().trim().min(2, "Slug minimal 2 karakter").max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung"),
  title: z.string().trim().min(2, "Judul minimal 2 karakter").max(180),
  eyebrow: z.string().trim().max(100).optional().default(""),
  description: z.string().trim().max(1000).optional().default(""),
  heroImageUrl: z.union([z.string().url("URL gambar hero tidak valid"), z.literal("")]).optional().default(""),
  published: z.boolean(),
  blocks: z.array(specialEditionBlockSchema).max(20),
});

export type SpecialEditionInput = z.infer<typeof specialEditionSchema>;
export type SpecialEditionBlock = SpecialEditionInput["blocks"][number];
