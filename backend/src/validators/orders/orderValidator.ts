import { z } from "zod";

export const orderIdParamsSchema = z.object({
  id: z.coerce
    .number()
    .int("El ID debe ser un número entero.")
    .positive("El ID debe ser mayor que cero."),
});

export type OrderIdParams = z.infer<
  typeof orderIdParamsSchema
>;

export const orderItemInputSchema = z.object({
  product_id: z.coerce
    .number()
    .int("El product_id debe ser un número entero.")
    .positive("El product_id debe ser mayor que cero."),

  quantity: z.coerce
    .number()
    .int("La cantidad debe ser un número entero.")
    .min(
      1,
      "La cantidad debe ser al menos 1."
    ),

  variant: z
    .string()
    .trim()
    .max(
      200,
      "La variante no puede superar los 200 caracteres."
    )
    .nullable()
    .optional(),
});

export type OrderItemInput = z.infer<
  typeof orderItemInputSchema
>;

export const createOrderSchema = z.object({
  customer_id: z.coerce
    .number()
    .int("El customer_id debe ser un número entero.")
    .positive("El customer_id debe ser mayor que cero."),

  manager_id: z
    .string()
    .uuid("manager_id debe ser un UUID válido.")
    .nullable()
    .optional(),

  source_type: z
    .enum(["direct", "manager"])
    .default("direct"),

  delivery: z
    .boolean()
    .default(false),

  address: z
    .string()
    .trim()
    .max(
      500,
      "La dirección no puede superar los 500 caracteres."
    )
    .nullable()
    .optional(),

  notes: z
    .string()
    .trim()
    .max(
      2000,
      "Las observaciones no pueden superar los 2000 caracteres."
    )
    .nullable()
    .optional(),

  items: z
    .array(orderItemInputSchema)
    .min(
      1,
      "El pedido debe tener al menos un producto."
    ),
});

export type CreateOrderInput = z.infer<
  typeof createOrderSchema
>;

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "nuevo",
    "confirmado",
    "preparando",
    "entregado",
    "cancelado",
  ]),
});

export const createPosOrderSchema = z.object({
  customer_id: z.coerce
    .number()
    .int("El customer_id debe ser un número entero.")
    .positive("El customer_id debe ser mayor que cero."),

  notes: z
    .string()
    .trim()
    .max(
      2000,
      "Las observaciones no pueden superar los 2000 caracteres."
    )
    .nullable()
    .optional(),

  items: z
    .array(orderItemInputSchema)
    .min(
      1,
      "La venta debe tener al menos un producto."
    ),
});

export type CreatePosOrderInput = z.infer<
  typeof createPosOrderSchema
>;

export type UpdateOrderStatusInput = z.infer<
  typeof updateOrderStatusSchema
>;