import { z } from "zod";

const optionalNullableString = (
  max: number,
  message: string
) =>
  z
    .string()
    .trim()
    .max(max, message)
    .nullable()
    .optional();

export const managerIdParamsSchema = z.object({
  id: z.string().uuid("El ID del gestor debe ser un UUID válido."),
});

export type ManagerIdParams = z.infer<
  typeof managerIdParamsSchema
>;

export const createManagerSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "El nombre completo es obligatorio.")
    .max(
      150,
      "El nombre completo no puede superar los 150 caracteres."
    ),

  email: z
    .string()
    .trim()
    .email("El email no es válido.")
    .max(
      255,
      "El email no puede superar los 255 caracteres."
    ),

  phone: optionalNullableString(
    30,
    "El teléfono no puede superar los 30 caracteres."
  ),

  commission_rate: z.coerce
    .number()
    .min(0, "La comisión no puede ser negativa.")
    .max(
      100,
      "La comisión no puede superar 100."
    )
    .default(0),

  active: z.boolean().default(true),

  username: z
    .string()
    .trim()
    .min(3, "El username debe tener al menos 3 caracteres.")
    .max(
      100,
      "El username no puede superar los 100 caracteres."
    ),

  carnet: z
    .string()
    .trim()
    .regex(
      /^\d{11}$/,
      "El carnet debe contener exactamente 11 dígitos."
    )
    .nullable()
    .optional(),

  avatar_url: optionalNullableString(
    1000,
    "La URL del avatar es demasiado larga."
  ),
});

export type CreateManagerInput = z.infer<
  typeof createManagerSchema
>;

export const updateManagerSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "El nombre completo es obligatorio.")
    .max(
      150,
      "El nombre completo no puede superar los 150 caracteres."
    )
    .optional(),

  email: z
    .string()
    .trim()
    .email("El email no es válido.")
    .max(
      255,
      "El email no puede superar los 255 caracteres."
    )
    .optional(),

  phone: optionalNullableString(
    30,
    "El teléfono no puede superar los 30 caracteres."
  ),

  slug: z
    .string()
    .trim()
    .min(2, "El slug es obligatorio.")
    .max(
      150,
      "El slug no puede superar los 150 caracteres."
    )
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "El slug solo puede contener letras minúsculas, números y guiones."
    )
    .optional(),

  commission_rate: z.coerce
    .number()
    .min(0, "La comisión no puede ser negativa.")
    .max(
      100,
      "La comisión no puede superar 100."
    )
    .optional(),

  active: z.boolean().optional(),

  username: z
    .string()
    .trim()
    .min(3, "El username debe tener al menos 3 caracteres.")
    .max(
      100,
      "El username no puede superar los 100 caracteres."
    )
    .optional(),

  carnet: z
    .string()
    .trim()
    .regex(
      /^\d{11}$/,
      "El carnet debe contener exactamente 11 dígitos."
    )
    .nullable()
    .optional(),

  avatar_url: optionalNullableString(
    1000,
    "La URL del avatar es demasiado larga."
  ),
});

export type UpdateManagerInput = z.infer<
  typeof updateManagerSchema
>;