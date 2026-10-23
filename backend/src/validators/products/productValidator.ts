import { z } from "zod";

export const productIdParamsSchema = z.object({
  id: z.coerce
    .number()
    .int("El ID debe ser un número entero.")
    .positive("El ID debe ser mayor que cero."),
});

export type ProductIdParams = z.infer<
  typeof productIdParamsSchema
>;

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre del producto es obligatorio.")
    .max(
      200,
      "El nombre no puede superar los 200 caracteres."
    ),

  brand: z
    .string()
    .trim()
    .max(
      100,
      "La marca no puede superar los 100 caracteres."
    )
    .nullable()
    .optional(),

  model: z
    .string()
    .trim()
    .max(
      100,
      "El modelo no puede superar los 100 caracteres."
    )
    .nullable()
    .optional(),


  sku: z
    .string()
    .trim()
    .max(
      100,
      "El SKU no puede superar los 100 caracteres."
    )
    .nullable()
    .optional(),

  barcode: z
    .string()
    .trim()
    .max(
      100,
      "El código de barras no puede superar los 100 caracteres."
    )
    .nullable()
    .optional(),

  brand_id: z
    .coerce
    .number()
    .int("brand_id debe ser un número entero.")
    .positive("brand_id debe ser mayor que cero."),

  supplier_id: z
    .coerce
    .number()
    .int("supplier_id debe ser un número entero.")
    .positive("supplier_id debe ser mayor que cero."),

  category_id: z
    .coerce
    .number()
    .int("category_id debe ser un número entero.")
    .positive("category_id debe ser mayor que cero."),

  category: z
    .string()
    .trim()
    .max(
      150,
      "La categoría no puede superar los 150 caracteres."
    )
    .nullable()
    .optional(),

  price: z
    .coerce
    .number()
    .finite(
      "El precio debe ser un número válido."
    )
    .min(
      0,
      "El precio no puede ser negativo."
    ),
     cost: z
    .coerce
    .number()
    .finite(
      "El costo debe ser un número válido."
    )
    .min(
      0,
      "El costo no puede ser negativo."
    ),

  vip_price: z
    .coerce
    .number()
    .finite(
      "El precio VIP debe ser un número válido."
    )
    .min(
      0,
      "El precio VIP no puede ser negativo."
    )
    .nullable()
    .optional(),

  stock: z
    .coerce
    .number()
    .int(
      "El stock debe ser un número entero."
    )
    .min(
      0,
      "El stock no puede ser negativo."
    ),

  description: z
    .string()
    .trim()
    .max(
      5000,
      "La descripción no puede superar los 5000 caracteres."
    )
    .nullable()
    .optional(),

  features: z
    .record(z.string(), z.unknown())
    .nullable()
    .optional(),
  
    technical_specs: z
    .record(z.string(), z.unknown())
    .nullable()
    .optional(),
    
  images: z
    .array(
      z.string().url(
        "Cada imagen debe tener una URL válida."
      )
    )
    .nullable()
    .optional(),

  family_id: z
    .coerce
    .number()
    .int(
      "family_id debe ser un número entero."
    )
    .positive(
      "family_id debe ser mayor que cero."
    )
    .nullable()
    .optional(),

  variant: z
    .string()
    .trim()
    .max(
      200,
      "La variante no puede superar los 200 caracteres."
    )
    .nullable()
    .optional(),

  active: z
    .boolean()
    .default(true),

  manager_commission: z
    .coerce
    .number()
    .finite(
      "La comisión debe ser un número válido."
    )
    .min(
      0,
      "La comisión no puede ser negativa."
    )
    .default(0),
});

export type CreateProductInput = z.infer<
  typeof createProductSchema
>;
export const updateProductSchema = createProductSchema.partial();

export type UpdateProductInput = z.infer<
  typeof updateProductSchema
>;
export const updateProductStatusSchema = z.object({
  active: z.boolean(),
});

export type UpdateProductStatusInput = z.infer<
  typeof updateProductStatusSchema
>;