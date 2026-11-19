import { z } from 'zod';

const imagePath = z
  .string()
  .max(240)
  .refine(
    (value) => value === '' || /^\/img\/[\w.-]+\.(svg|png|jpe?g|webp)$/i.test(value),
    'Gunakan path gambar lokal /img/nama-file.svg.',
  );

export const productInputSchema = z
  .object({
    nama: z.string().trim().min(2).max(60),
    kategori: z.string().trim().min(1).max(24),
    harga: z.number().int().min(0).max(100_000_000),
    stok: z.number().int().min(0).max(100_000),
    deskripsi: z.string().trim().max(280),
    imageUrl: imagePath,
    unggulan: z.boolean(),
  })
  .strict();

export const importItemSchema = productInputSchema
  .extend({ id: z.string().trim().min(1).max(120).optional() })
  .strict();

export const importRequestSchema = z
  .object({
    products: z.array(importItemSchema).min(1).max(100),
  })
  .strict()
  .superRefine(({ products }, context) => {
    const seenIds = new Set();
    products.forEach((product, index) => {
      if (!product.id) return;
      if (seenIds.has(product.id)) {
        context.addIssue({
          code: 'custom',
          path: ['products', index, 'id'],
          message: 'ID produk lokal duplikat.',
        });
      }
      seenIds.add(product.id);
    });
  });

export function safeProduct(value) {
  const parsed = productInputSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function toProductRecord(row) {
  return {
    id: row.id,
    nama: row.nama,
    kategori: row.kategori,
    harga: row.harga,
    stok: row.stok,
    deskripsi: row.deskripsi,
    imageUrl: row.image_url ?? '',
    unggulan: row.unggulan,
  };
}

export function validationDetails(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}
