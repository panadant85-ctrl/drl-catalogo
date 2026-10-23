"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateManagerSchema = exports.createManagerSchema = exports.managerIdParamsSchema = void 0;
const zod_1 = require("zod");
const optionalNullableString = (max, message) => zod_1.z
    .string()
    .trim()
    .max(max, message)
    .nullable()
    .optional();
exports.managerIdParamsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("El ID del gestor debe ser un UUID válido."),
});
exports.createManagerSchema = zod_1.z.object({
    full_name: zod_1.z
        .string()
        .trim()
        .min(2, "El nombre completo es obligatorio.")
        .max(150, "El nombre completo no puede superar los 150 caracteres."),
    email: zod_1.z
        .string()
        .trim()
        .email("El email no es válido.")
        .max(255, "El email no puede superar los 255 caracteres."),
    phone: optionalNullableString(30, "El teléfono no puede superar los 30 caracteres."),
    commission_rate: zod_1.z.coerce
        .number()
        .min(0, "La comisión no puede ser negativa.")
        .max(100, "La comisión no puede superar 100.")
        .default(0),
    active: zod_1.z.boolean().default(true),
    username: zod_1.z
        .string()
        .trim()
        .min(3, "El username debe tener al menos 3 caracteres.")
        .max(100, "El username no puede superar los 100 caracteres."),
    carnet: zod_1.z
        .string()
        .trim()
        .regex(/^\d{11}$/, "El carnet debe contener exactamente 11 dígitos.")
        .nullable()
        .optional(),
    avatar_url: optionalNullableString(1000, "La URL del avatar es demasiado larga."),
});
exports.updateManagerSchema = zod_1.z.object({
    full_name: zod_1.z
        .string()
        .trim()
        .min(2, "El nombre completo es obligatorio.")
        .max(150, "El nombre completo no puede superar los 150 caracteres.")
        .optional(),
    email: zod_1.z
        .string()
        .trim()
        .email("El email no es válido.")
        .max(255, "El email no puede superar los 255 caracteres.")
        .optional(),
    phone: optionalNullableString(30, "El teléfono no puede superar los 30 caracteres."),
    slug: zod_1.z
        .string()
        .trim()
        .min(2, "El slug es obligatorio.")
        .max(150, "El slug no puede superar los 150 caracteres.")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug solo puede contener letras minúsculas, números y guiones.")
        .optional(),
    commission_rate: zod_1.z.coerce
        .number()
        .min(0, "La comisión no puede ser negativa.")
        .max(100, "La comisión no puede superar 100.")
        .optional(),
    active: zod_1.z.boolean().optional(),
    username: zod_1.z
        .string()
        .trim()
        .min(3, "El username debe tener al menos 3 caracteres.")
        .max(100, "El username no puede superar los 100 caracteres.")
        .optional(),
    carnet: zod_1.z
        .string()
        .trim()
        .regex(/^\d{11}$/, "El carnet debe contener exactamente 11 dígitos.")
        .nullable()
        .optional(),
    avatar_url: optionalNullableString(1000, "La URL del avatar es demasiado larga."),
});
