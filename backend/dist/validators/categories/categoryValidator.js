"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategorySchema = exports.createCategorySchema = exports.categoryIdSchema = void 0;
const zod_1 = require("zod");
exports.categoryIdSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive(),
});
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(1, "El nombre de la categoría es obligatorio.")
        .max(200, "El nombre de la categoría no puede superar los 200 caracteres."),
    slug: zod_1.z
        .string()
        .trim()
        .min(1, "El slug de la categoría es obligatorio.")
        .max(200, "El slug no puede superar los 200 caracteres.")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug solo puede contener letras minúsculas, números y guiones."),
    description: zod_1.z
        .string()
        .trim()
        .max(1000, "La descripción no puede superar los 1000 caracteres.")
        .nullable()
        .optional(),
    parent_id: zod_1.z
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),
    active: zod_1.z
        .boolean()
        .optional()
        .default(true),
    position: zod_1.z
        .number()
        .int()
        .min(0, "La posición no puede ser negativa.")
        .optional()
        .default(0),
});
exports.updateCategorySchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(1, "El nombre de la categoría es obligatorio.")
        .max(200, "El nombre de la categoría no puede superar los 200 caracteres.")
        .optional(),
    slug: zod_1.z
        .string()
        .trim()
        .min(1, "El slug de la categoría es obligatorio.")
        .max(200, "El slug no puede superar los 200 caracteres.")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug solo puede contener letras minúsculas, números y guiones.")
        .optional(),
    description: zod_1.z
        .string()
        .trim()
        .max(1000, "La descripción no puede superar los 1000 caracteres.")
        .nullable()
        .optional(),
    parent_id: zod_1.z
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),
    active: zod_1.z
        .boolean()
        .optional(),
    position: zod_1.z
        .number()
        .int()
        .min(0, "La posición no puede ser negativa.")
        .optional(),
});
