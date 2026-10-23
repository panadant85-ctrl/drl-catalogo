import { z } from "zod";

export const categoryIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      1,
      "El nombre de la categoría es obligatorio."
    )
    .max(
      200,
      "El nombre de la categoría no puede superar los 200 caracteres."
    ),

  slug: z
    .string()
    .trim()
    .min(
      1,
      "El slug de la categoría es obligatorio."
    )
    .max(
      200,
      "El slug no puede superar los 200 caracteres."
    )
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "El slug solo puede contener letras minúsculas, números y guiones."
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

  parent_id: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  active: z
    .boolean()
    .optional()
    .default(true),

  position: z
    .number()
    .int()
    .min(
      0,
      "La posición no puede ser negativa."
    )
    .optional()
    .default(0),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      1,
      "El nombre de la categoría es obligatorio."
    )
    .max(
      200,
      "El nombre de la categoría no puede superar los 200 caracteres."
    )
    .optional(),

  slug: z
    .string()
    .trim()
    .min(
      1,
      "El slug de la categoría es obligatorio."
    )
    .max(
      200,
      "El slug no puede superar los 200 caracteres."
    )
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "El slug solo puede contener letras minúsculas, números y guiones."
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

  parent_id: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  active: z
    .boolean()
    .optional(),

  position: z
    .number()
    .int()
    .min(
      0,
      "La posición no puede ser negativa."
    )
    .optional(),
});

export type CreateCategoryInput =
  z.infer<typeof createCategorySchema>;

export type UpdateCategoryInput =
  z.infer<typeof updateCategorySchema>;