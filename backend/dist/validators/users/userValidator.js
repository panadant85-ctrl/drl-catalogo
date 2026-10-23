"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = exports.userIdParamsSchema = void 0;
const zod_1 = require("zod");
exports.userIdParamsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("El ID del usuario no es válido."),
});
exports.createUserSchema = zod_1.z
    .object({
    fullName: zod_1.z
        .string()
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres.")
        .max(150, "El nombre no puede superar los 150 caracteres."),
    email: zod_1.z
        .string()
        .trim()
        .toLowerCase()
        .email("El correo electrónico no es válido."),
    phone: zod_1.z
        .string()
        .trim()
        .optional()
        .or(zod_1.z.literal("")),
    password: zod_1.z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres.")
        .max(128, "La contraseña no puede superar los 128 caracteres."),
    confirmPassword: zod_1.z
        .string()
        .min(8, "La confirmación de contraseña debe tener al menos 8 caracteres.")
        .max(128, "La confirmación de contraseña no puede superar los 128 caracteres."),
    roleId: zod_1.z.coerce
        .number()
        .int("El rol debe ser un número entero.")
        .positive("El rol debe ser válido."),
    username: zod_1.z.string().trim().optional().or(zod_1.z.literal("")),
    carnet: zod_1.z.string().trim().optional().or(zod_1.z.literal("")),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
})
    .superRefine((data, ctx) => {
    if (data.roleId !== 2)
        return;
    const username = data.username?.trim() ?? "";
    const carnet = data.carnet?.trim() ?? "";
    if (!username) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["username"],
            message: "El nombre de usuario es obligatorio para los gestores.",
        });
    }
    else if (!/^[a-z0-9](?:[a-z0-9._-]{2,28}[a-z0-9])?$/.test(username.toLowerCase())) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["username"],
            message: "El nombre de usuario debe tener entre 4 y 30 caracteres y utilizar letras minúsculas, números, puntos, guiones o guiones bajos.",
        });
    }
    if (!/^[0-9]{11}$/.test(carnet)) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["carnet"],
            message: "El carnet del gestor debe contener exactamente 11 dígitos.",
        });
    }
});
exports.updateUserSchema = zod_1.z.object({
    fullName: zod_1.z
        .string()
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres.")
        .max(150, "El nombre no puede superar los 150 caracteres.")
        .optional(),
    email: zod_1.z
        .string()
        .trim()
        .toLowerCase()
        .email("El correo electrónico no es válido.")
        .optional(),
    phone: zod_1.z
        .string()
        .trim()
        .optional()
        .or(zod_1.z.literal("")),
    roleId: zod_1.z.coerce
        .number()
        .int("El rol debe ser un número entero.")
        .positive("El rol debe ser válido.")
        .optional(),
    password: zod_1.z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres.")
        .max(128, "La contraseña no puede superar los 128 caracteres.")
        .optional()
        .or(zod_1.z.literal("")),
    confirmPassword: zod_1.z
        .string()
        .optional()
        .or(zod_1.z.literal("")),
    active: zod_1.z.boolean().optional(),
}).refine((data) => !data.password ||
    data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
});
