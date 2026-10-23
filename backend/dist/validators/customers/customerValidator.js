"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerSchema = exports.createCustomerSchema = exports.customerIdParamsSchema = void 0;
const zod_1 = require("zod");
exports.customerIdParamsSchema = zod_1.z.object({
    id: zod_1.z.coerce
        .number()
        .int("El ID debe ser un número entero.")
        .positive("El ID debe ser mayor que cero."),
});
/**
 * Esquema para crear clientes.
 *
 * El cliente introduce:
 * - Nombre
 * - Primer apellido
 * - Segundo apellido
 *
 * full_name se mantiene para compatibilidad
 * con el sistema actual.
 */
exports.createCustomerSchema = zod_1.z
    .object({
    first_name: zod_1.z
        .string()
        .trim()
        .min(1, "El nombre es obligatorio.")
        .max(100, "El nombre no puede superar los 100 caracteres."),
    last_name_1: zod_1.z
        .string()
        .trim()
        .min(1, "El primer apellido es obligatorio.")
        .max(100, "El primer apellido no puede superar los 100 caracteres."),
    last_name_2: zod_1.z
        .string()
        .trim()
        .min(1, "El segundo apellido es obligatorio.")
        .max(100, "El segundo apellido no puede superar los 100 caracteres."),
    /**
     * Se mantiene temporalmente para compatibilidad
     * con clientes/código antiguo.
     *
     * Si viene desde el frontend, posteriormente
     * podremos ignorarlo y construirlo automáticamente.
     */
    full_name: zod_1.z
        .string()
        .trim()
        .max(200, "El nombre completo no puede superar los 200 caracteres.")
        .optional(),
    identification: zod_1.z
        .string()
        .trim()
        .min(1, "La identificación es obligatoria.")
        .max(50, "La identificación no puede superar los 50 caracteres."),
    email: zod_1.z
        .string()
        .trim()
        .email("El email no es válido.")
        .nullable()
        .optional(),
    phone: zod_1.z
        .string()
        .trim()
        .max(30, "El teléfono no puede superar los 30 caracteres.")
        .nullable()
        .optional(),
    province: zod_1.z
        .string()
        .trim()
        .max(100, "La provincia no puede superar los 100 caracteres.")
        .nullable()
        .optional(),
    municipality: zod_1.z
        .string()
        .trim()
        .max(150, "El municipio no puede superar los 150 caracteres.")
        .nullable()
        .optional(),
    address: zod_1.z
        .string()
        .trim()
        .max(500, "La dirección no puede superar los 500 caracteres.")
        .nullable()
        .optional(),
    auth_user_id: zod_1.z
        .string()
        .uuid("auth_user_id debe ser un UUID válido.")
        .nullable()
        .optional(),
    manager_id: zod_1.z
        .string()
        .uuid("manager_id debe ser un UUID válido.")
        .nullable()
        .optional(),
    source_type: zod_1.z
        .enum(["direct", "manager"])
        .default("direct"),
})
    .transform((data) => {
    const fullName = [
        data.first_name,
        data.last_name_1,
        data.last_name_2,
    ]
        .filter(Boolean)
        .join(" ");
    return {
        ...data,
        full_name: fullName,
    };
});
exports.updateCustomerSchema = zod_1.z
    .object({
    first_name: zod_1.z
        .string()
        .trim()
        .min(1, "El nombre no puede estar vacío.")
        .max(100, "El nombre no puede superar los 100 caracteres.")
        .optional(),
    last_name_1: zod_1.z
        .string()
        .trim()
        .min(1, "El primer apellido no puede estar vacío.")
        .max(100, "El primer apellido no puede superar los 100 caracteres.")
        .optional(),
    last_name_2: zod_1.z
        .string()
        .trim()
        .min(1, "El segundo apellido no puede estar vacío.")
        .max(100, "El segundo apellido no puede superar los 100 caracteres.")
        .optional(),
    full_name: zod_1.z
        .string()
        .trim()
        .max(200, "El nombre completo no puede superar los 200 caracteres.")
        .optional(),
    identification: zod_1.z
        .string()
        .trim()
        .min(1, "La identificación es obligatoria.")
        .max(50, "La identificación no puede superar los 50 caracteres.")
        .nullable()
        .optional(),
    email: zod_1.z.string().trim().email("El email no es válido.").nullable().optional(),
    phone: zod_1.z.string().trim().max(30, "El teléfono no puede superar los 30 caracteres.").nullable().optional(),
    province: zod_1.z.string().trim().max(100, "La provincia no puede superar los 100 caracteres.").nullable().optional(),
    municipality: zod_1.z.string().trim().max(150, "El municipio no puede superar los 150 caracteres.").nullable().optional(),
    address: zod_1.z.string().trim().max(500, "La dirección no puede superar los 500 caracteres.").nullable().optional(),
    auth_user_id: zod_1.z.string().uuid("auth_user_id debe ser un UUID válido.").nullable().optional(),
    manager_id: zod_1.z.string().uuid("manager_id debe ser un UUID válido.").nullable().optional(),
    source_type: zod_1.z.enum(["direct", "manager"]).optional(),
})
    .transform((data) => {
    const hasNameFields = data.first_name !== undefined ||
        data.last_name_1 !== undefined ||
        data.last_name_2 !== undefined;
    if (!hasNameFields) {
        return data;
    }
    return {
        ...data,
        full_name: [
            data.first_name,
            data.last_name_1,
            data.last_name_2,
        ]
            .filter((part) => part !== undefined && part.length > 0)
            .join(" "),
    };
});
