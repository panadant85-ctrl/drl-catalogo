import { z } from "zod";

export const userIdParamsSchema = z.object({
  id: z.string().uuid(
    "El ID del usuario no es válido."
  ),
});

export type UserIdParams =
  z.infer<typeof userIdParamsSchema>;


export const createUserSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres.")
      .max(150, "El nombre no puede superar los 150 caracteres."),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("El correo electrónico no es válido."),

    phone: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),

    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .max(128, "La contraseña no puede superar los 128 caracteres."),

    confirmPassword: z
      .string()
      .min(8, "La confirmación de contraseña debe tener al menos 8 caracteres.")
      .max(128, "La confirmación de contraseña no puede superar los 128 caracteres."),

    roleId: z.coerce
      .number()
      .int("El rol debe ser un número entero.")
      .positive("El rol debe ser válido."),

    username: z.string().trim().optional().or(z.literal("")),
    carnet: z.string().trim().optional().or(z.literal("")),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Las contraseñas no coinciden.",
      path: ["confirmPassword"],
    }
  )
  .superRefine((data, ctx) => {
    if (data.roleId !== 2) return;

    const username = data.username?.trim() ?? "";
    const carnet = data.carnet?.trim() ?? "";

    if (!username) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["username"],
        message: "El nombre de usuario es obligatorio para los gestores.",
      });
    } else if (
      !/^[a-z0-9](?:[a-z0-9._-]{2,28}[a-z0-9])?$/.test(
        username.toLowerCase()
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["username"],
        message: "El nombre de usuario debe tener entre 4 y 30 caracteres y utilizar letras minúsculas, números, puntos, guiones o guiones bajos.",
      });
    }

    if (!/^[0-9]{11}$/.test(carnet)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["carnet"],
        message: "El carnet del gestor debe contener exactamente 11 dígitos.",
      });
    }
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(150, "El nombre no puede superar los 150 caracteres.")
    .optional(),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("El correo electrónico no es válido.")
    .optional(),

  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  roleId: z.coerce
    .number()
    .int("El rol debe ser un número entero.")
    .positive("El rol debe ser válido.")
    .optional(),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(128, "La contraseña no puede superar los 128 caracteres.")
    .optional()
    .or(z.literal("")),

  confirmPassword: z
    .string()
    .optional()
    .or(z.literal("")),
    
  active: z.boolean().optional(),
}).refine(
  (data) =>
    !data.password ||
    data.password === data.confirmPassword,
  {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  }
);

export type UpdateUserInput =
  z.infer<typeof updateUserSchema>;