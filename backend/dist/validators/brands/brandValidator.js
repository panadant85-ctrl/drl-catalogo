"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBrandSchema = exports.createBrandSchema = exports.brandIdSchema = void 0;
const zod_1 = require("zod");
exports.brandIdSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive(),
});
exports.createBrandSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(1, "El nombre de la marca es obligatorio.")
        .max(200, "El nombre de la marca no puede superar los 200 caracteres."),
    description: zod_1.z
        .string()
        .trim()
        .max(1000, "La descripción no puede superar los 1000 caracteres.")
        .nullable()
        .optional(),
    logo_url: zod_1.z
        .string()
        .trim()
        .url("El logo debe ser una URL válida.")
        .nullable()
        .optional(),
    active: zod_1.z.boolean().optional().default(true),
});
exports.updateBrandSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(1, "El nombre de la marca es obligatorio.")
        .max(200, "El nombre de la marca no puede superar los 200 caracteres.")
        .optional(),
    description: zod_1.z
        .string()
        .trim()
        .max(1000, "La descripción no puede superar los 1000 caracteres.")
        .nullable()
        .optional(),
    logo_url: zod_1.z
        .string()
        .trim()
        .url("El logo debe ser una URL válida.")
        .nullable()
        .optional(),
    active: zod_1.z.boolean().optional(),
});
