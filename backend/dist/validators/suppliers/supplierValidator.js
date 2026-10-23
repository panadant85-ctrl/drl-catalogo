"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSupplierSchema = exports.createSupplierSchema = exports.supplierIdParamsSchema = void 0;
const zod_1 = require("zod");
exports.supplierIdParamsSchema = zod_1.z.object({
    id: zod_1.z.coerce
        .number()
        .int("El ID debe ser un número entero.")
        .positive("El ID debe ser mayor que cero."),
});
exports.createSupplierSchema = zod_1.z.object({
    company_name: zod_1.z
        .string()
        .trim()
        .min(1, "El nombre de la empresa es obligatorio.")
        .max(200, "El nombre de la empresa no puede superar los 200 caracteres."),
    nit: zod_1.z
        .string()
        .trim()
        .min(1, "El NIT es obligatorio.")
        .max(50, "El NIT no puede superar los 50 caracteres."),
    address: zod_1.z
        .string()
        .trim()
        .min(1, "La dirección es obligatoria.")
        .max(500, "La dirección no puede superar los 500 caracteres."),
    phone: zod_1.z
        .string()
        .trim()
        .max(30, "El teléfono no puede superar los 30 caracteres.")
        .nullable()
        .optional(),
    email: zod_1.z
        .string()
        .trim()
        .email("El email no es válido.")
        .nullable()
        .optional(),
    active: zod_1.z
        .boolean()
        .default(true),
});
exports.updateSupplierSchema = zod_1.z.object({
    company_name: zod_1.z
        .string()
        .trim()
        .min(1, "El nombre de la empresa no puede estar vacío.")
        .max(200, "El nombre de la empresa no puede superar los 200 caracteres.")
        .optional(),
    nit: zod_1.z
        .string()
        .trim()
        .min(1, "El NIT no puede estar vacío.")
        .max(50, "El NIT no puede superar los 50 caracteres.")
        .optional(),
    address: zod_1.z
        .string()
        .trim()
        .min(1, "La dirección no puede estar vacía.")
        .max(500, "La dirección no puede superar los 500 caracteres.")
        .optional(),
    phone: zod_1.z
        .string()
        .trim()
        .max(30, "El teléfono no puede superar los 30 caracteres.")
        .nullable()
        .optional(),
    email: zod_1.z
        .string()
        .trim()
        .email("El email no es válido.")
        .nullable()
        .optional(),
    active: zod_1.z
        .boolean()
        .optional(),
});
