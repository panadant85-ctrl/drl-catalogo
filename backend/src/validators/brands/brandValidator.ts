import { z } from "zod";

export const brandIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre de la marca es obligatorio.")
    .max(
      200,
      "El nombre de la marca no puede superar los 200 caracteres."
    ),

  description: z
    .string()
    .trim()
    .max(
      1000,
      "La descripción no puede superar los 1000 caracteres."
    )
    .nullable()
    .optional(),

  logo_url: z
    .string()
    .trim()
    .url("El logo debe ser una URL válida.")
    .nullable()
    .optional(),

  active: z.boolean().optional().default(true),
});

export const updateBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre de la marca es obligatorio.")
    .max(
      200,
      "El nombre de la marca no puede superar los 200 caracteres."
    )
    .optional(),

  description: z
    .string()
    .trim()
    .max(
      1000,
      "La descripción no puede superar los 1000 caracteres."
    )
    .nullable()
    .optional(),

  logo_url: z
    .string()
    .trim()
    .url("El logo debe ser una URL válida.")
    .nullable()
    .optional(),

  active: z.boolean().optional(),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;