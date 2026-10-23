import { z } from "zod";

export const supplierIdParamsSchema = z.object({
  id: z.coerce
    .number()
    .int("El ID debe ser un número entero.")
    .positive("El ID debe ser mayor que cero."),
});

export type SupplierIdParams = z.infer<
  typeof supplierIdParamsSchema
>;

export const createSupplierSchema = z.object({
  company_name: z
    .string()
    .trim()
    .min(
      1,
      "El nombre de la empresa es obligatorio."
    )
    .max(
      200,
      "El nombre de la empresa no puede superar los 200 caracteres."
    ),

  nit: z
    .string()
    .trim()
    .min(
      1,
      "El NIT es obligatorio."
    )
    .max(
      50,
      "El NIT no puede superar los 50 caracteres."
    ),

  address: z
    .string()
    .trim()
    .min(
      1,
      "La dirección es obligatoria."
    )
    .max(
      500,
      "La dirección no puede superar los 500 caracteres."
    ),

  phone: z
    .string()
    .trim()
    .max(
      30,
      "El teléfono no puede superar los 30 caracteres."
    )
    .nullable()
    .optional(),

  email: z
    .string()
    .trim()
    .email(
      "El email no es válido."
    )
    .nullable()
    .optional(),

  active: z
    .boolean()
    .default(true),
});

export type CreateSupplierInput = z.infer<
  typeof createSupplierSchema
>;

export const updateSupplierSchema = z.object({
  company_name: z
    .string()
    .trim()
    .min(
      1,
      "El nombre de la empresa no puede estar vacío."
    )
    .max(
      200,
      "El nombre de la empresa no puede superar los 200 caracteres."
    )
    .optional(),

  nit: z
    .string()
    .trim()
    .min(
      1,
      "El NIT no puede estar vacío."
    )
    .max(
      50,
      "El NIT no puede superar los 50 caracteres."
    )
    .optional(),

  address: z
    .string()
    .trim()
    .min(
      1,
      "La dirección no puede estar vacía."
    )
    .max(
      500,
      "La dirección no puede superar los 500 caracteres."
    )
    .optional(),

  phone: z
    .string()
    .trim()
    .max(
      30,
      "El teléfono no puede superar los 30 caracteres."
    )
    .nullable()
    .optional(),

  email: z
    .string()
    .trim()
    .email(
      "El email no es válido."
    )
    .nullable()
    .optional(),

  active: z
    .boolean()
    .optional(),
});

export type UpdateSupplierInput = z.infer<
  typeof updateSupplierSchema
>;