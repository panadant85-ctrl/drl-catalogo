import { z } from "zod";

export const roleIdParamsSchema = z.object({
  id: z.coerce
    .number()
    .int("El ID debe ser un número entero.")
    .positive("El ID debe ser mayor que cero."),
});

export type RoleIdParams = z.infer<
  typeof roleIdParamsSchema
>;

export const createRoleSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "El código debe tener al menos 2 caracteres.")
    .max(100, "El código no puede superar los 100 caracteres.")
    .regex(
      /^[a-z0-9._-]+$/,
      "El código solo puede contener minúsculas, números, puntos, guiones y guiones bajos."
    ),

  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(150, "El nombre no puede superar los 150 caracteres."),

  description: z
    .string()
    .trim()
    .max(
      500,
      "La descripción no puede superar los 500 caracteres."
    )
    .nullable()
    .optional(),

  permissions: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(150)
    )
    .default([]),

  active: z.boolean().default(true),
});

export type CreateRoleInput = z.infer<
  typeof createRoleSchema
>;

export const updateRoleSchema =
  createRoleSchema.partial();

export type UpdateRoleInput = z.infer<
  typeof updateRoleSchema
>;