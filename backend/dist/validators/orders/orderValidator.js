"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPosOrderSchema = exports.updateOrderStatusSchema = exports.createOrderSchema = exports.orderItemInputSchema = exports.orderIdParamsSchema = void 0;
const zod_1 = require("zod");
exports.orderIdParamsSchema = zod_1.z.object({
    id: zod_1.z.coerce
        .number()
        .int("El ID debe ser un número entero.")
        .positive("El ID debe ser mayor que cero."),
});
exports.orderItemInputSchema = zod_1.z.object({
    product_id: zod_1.z.coerce
        .number()
        .int("El product_id debe ser un número entero.")
        .positive("El product_id debe ser mayor que cero."),
    quantity: zod_1.z.coerce
        .number()
        .int("La cantidad debe ser un número entero.")
        .min(1, "La cantidad debe ser al menos 1."),
    variant: zod_1.z
        .string()
        .trim()
        .max(200, "La variante no puede superar los 200 caracteres.")
        .nullable()
        .optional(),
});
exports.createOrderSchema = zod_1.z.object({
    customer_id: zod_1.z.coerce
        .number()
        .int("El customer_id debe ser un número entero.")
        .positive("El customer_id debe ser mayor que cero."),
    manager_id: zod_1.z
        .string()
        .uuid("manager_id debe ser un UUID válido.")
        .nullable()
        .optional(),
    source_type: zod_1.z
        .enum(["direct", "manager"])
        .default("direct"),
    delivery: zod_1.z
        .boolean()
        .default(false),
    address: zod_1.z
        .string()
        .trim()
        .max(500, "La dirección no puede superar los 500 caracteres.")
        .nullable()
        .optional(),
    notes: zod_1.z
        .string()
        .trim()
        .max(2000, "Las observaciones no pueden superar los 2000 caracteres.")
        .nullable()
        .optional(),
    items: zod_1.z
        .array(exports.orderItemInputSchema)
        .min(1, "El pedido debe tener al menos un producto."),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        "nuevo",
        "confirmado",
        "preparando",
        "entregado",
        "cancelado",
    ]),
});
exports.createPosOrderSchema = zod_1.z.object({
    customer_id: zod_1.z.coerce
        .number()
        .int("El customer_id debe ser un número entero.")
        .positive("El customer_id debe ser mayor que cero."),
    notes: zod_1.z
        .string()
        .trim()
        .max(2000, "Las observaciones no pueden superar los 2000 caracteres.")
        .nullable()
        .optional(),
    items: zod_1.z
        .array(exports.orderItemInputSchema)
        .min(1, "La venta debe tener al menos un producto."),
});
