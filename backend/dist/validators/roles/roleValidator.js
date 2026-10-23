"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRoleSchema = exports.createRoleSchema = exports.roleIdParamsSchema = void 0;
const zod_1 = require("zod");
exports.roleIdParamsSchema = zod_1.z.object({
    id: zod_1.z.coerce
        .number()
        .int("El ID debe ser un número entero.")
        .positive("El ID debe ser mayor que cero."),
});
exports.createRoleSchema = zod_1.z.object({
    code: zod_1.z
        .string()
        .trim()
        .min(2, "El código debe tener al menos 2 caracteres.")
        .max(100, "El código no puede superar los 100 caracteres.")
        .regex(/^[a-z0-9._-]+$/, "El código solo puede contener minúsculas, números, puntos, guiones y guiones bajos."),
    name: zod_1.z
        .string()
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres.")
        .max(150, "El nombre no puede superar los 150 caracteres."),
    description: zod_1.z
        .string()
        .trim()
        .max(500, "La descripción no puede superar los 500 caracteres.")
        .nullable()
        .optional(),
    permissions: zod_1.z
        .array(zod_1.z
        .string()
        .trim()
        .min(1)
        .max(150))
        .default([]),
    active: zod_1.z.boolean().default(true),
});
exports.updateRoleSchema = exports.createRoleSchema.partial();
