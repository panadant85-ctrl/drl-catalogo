"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductStatusSchema = exports.updateProductSchema = exports.createProductSchema = exports.productIdParamsSchema = void 0;
const zod_1 = require("zod");
exports.productIdParamsSchema = zod_1.z.object({
    id: zod_1.z.coerce
        .number()
        .int("El ID debe ser un número entero.")
        .positive("El ID debe ser mayor que cero."),
});
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(1, "El nombre del producto es obligatorio.")
        .max(200, "El nombre no puede superar los 200 caracteres."),
    brand: zod_1.z
        .string()
        .trim()
        .max(100, "La marca no puede superar los 100 caracteres.")
        .nullable()
        .optional(),
    model: zod_1.z
        .string()
        .trim()
        .max(100, "El modelo no puede superar los 100 caracteres.")
        .nullable()
        .optional(),
    sku: zod_1.z
        .string()
        .trim()
        .max(100, "El SKU no puede superar los 100 caracteres.")
        .nullable()
        .optional(),
    barcode: zod_1.z
        .string()
        .trim()
        .max(100, "El código de barras no puede superar los 100 caracteres.")
        .nullable()
        .optional(),
    brand_id: zod_1.z
        .coerce
        .number()
        .int("brand_id debe ser un número entero.")
        .positive("brand_id debe ser mayor que cero."),
    supplier_id: zod_1.z
        .coerce
        .number()
        .int("supplier_id debe ser un número entero.")
        .positive("supplier_id debe ser mayor que cero."),
    category_id: zod_1.z
        .coerce
        .number()
        .int("category_id debe ser un número entero.")
        .positive("category_id debe ser mayor que cero."),
    category: zod_1.z
        .string()
        .trim()
        .max(150, "La categoría no puede superar los 150 caracteres.")
        .nullable()
        .optional(),
    price: zod_1.z
        .coerce
        .number()
        .finite("El precio debe ser un número válido.")
        .min(0, "El precio no puede ser negativo."),
    cost: zod_1.z
        .coerce
        .number()
        .finite("El costo debe ser un número válido.")
        .min(0, "El costo no puede ser negativo."),
    vip_price: zod_1.z
        .coerce
        .number()
        .finite("El precio VIP debe ser un número válido.")
        .min(0, "El precio VIP no puede ser negativo.")
        .nullable()
        .optional(),
    stock: zod_1.z
        .coerce
        .number()
        .int("El stock debe ser un número entero.")
        .min(0, "El stock no puede ser negativo."),
    description: zod_1.z
        .string()
        .trim()
        .max(5000, "La descripción no puede superar los 5000 caracteres.")
        .nullable()
        .optional(),
    features: zod_1.z
        .record(zod_1.z.string(), zod_1.z.unknown())
        .nullable()
        .optional(),
    technical_specs: zod_1.z
        .record(zod_1.z.string(), zod_1.z.unknown())
        .nullable()
        .optional(),
    images: zod_1.z
        .array(zod_1.z.string().url("Cada imagen debe tener una URL válida."))
        .nullable()
        .optional(),
    family_id: zod_1.z
        .coerce
        .number()
        .int("family_id debe ser un número entero.")
        .positive("family_id debe ser mayor que cero.")
        .nullable()
        .optional(),
    variant: zod_1.z
        .string()
        .trim()
        .max(200, "La variante no puede superar los 200 caracteres.")
        .nullable()
        .optional(),
    active: zod_1.z
        .boolean()
        .default(true),
    manager_commission: zod_1.z
        .coerce
        .number()
        .finite("La comisión debe ser un número válido.")
        .min(0, "La comisión no puede ser negativa.")
        .default(0),
});
exports.updateProductSchema = exports.createProductSchema.partial();
exports.updateProductStatusSchema = zod_1.z.object({
    active: zod_1.z.boolean(),
});
