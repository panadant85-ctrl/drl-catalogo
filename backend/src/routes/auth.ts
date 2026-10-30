import type { FastifyInstance } from "fastify";

import {  supabase,
          supabaseAdmin,
        } from "../config/supabase";
import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";

import {
  getCustomerByAuthUserId,
  createNewCustomer,
  updateCustomerProfile,
  linkCustomerToManagerByCode,
} from "../services/customers/customerService";
import {
  getOrdersByCustomerId,
  createNewOrder,
} from "../services/orders/orderService";
import {
  createOrderSchema,
} from "../validators/orders/orderValidator";

interface LoginBody {
  email?: string;
  phone?: string;
  password: string;
}

interface RegisterBody {
  email?: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

/*
|--------------------------------------------------------------------------
| TELÉFONOS PERMITIDOS
|--------------------------------------------------------------------------
| Por el momento DRL Electronik solamente acepta estos códigos de país.
*/
const ALLOWED_PHONE_COUNTRY_CODES = [
  "+53",  // Cuba
  "+1",   // Estados Unidos
  "+58",  // Venezuela
  "+507", // Panamá
  "+52",  // México
  "+34",  // España
  "+39",  // Italia
  "+33",  // Francia
  "+49",  // Alemania
  "+7",   // Rusia
  "+86",  // China
];

/*
|--------------------------------------------------------------------------
| NORMALIZAR TELÉFONO
|--------------------------------------------------------------------------
*/
function normalizePhone(value: string): string {
  return value
    .replace(/[\s\-().]/g, "")
    .trim();
}

/*
|--------------------------------------------------------------------------
| VALIDAR EMAIL
|--------------------------------------------------------------------------
*/
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/*
|--------------------------------------------------------------------------
| OBTENER CÓDIGO DE PAÍS
|--------------------------------------------------------------------------
*/
function getPhoneCountryCode(
  phone: string
): string | null {
  /*
   * Ordenamos por longitud para comprobar primero
   * códigos como +507 antes que +5.
   */
  const sortedCodes =
    [...ALLOWED_PHONE_COUNTRY_CODES].sort(
      (a, b) => b.length - a.length
    );

  const code = sortedCodes.find((countryCode) =>
    phone.startsWith(countryCode)
  );

  return code ?? null;
}

/*
|--------------------------------------------------------------------------
| VALIDAR TELÉFONO
|--------------------------------------------------------------------------
*/
function isValidInternationalPhone(
  value: string
): boolean {
  /*
   * Formato internacional:
   *
   * + seguido de 8 a 15 dígitos.
   *
   * Ejemplos:
   *
   * +5355555555
   * +17875551234
   * +584121234567
   * +50761234567
   * +525512345678
   */
  return /^\+[1-9]\d{7,14}$/.test(value);
}

/*
|--------------------------------------------------------------------------
| VALIDAR TELÉFONO PERMITIDO
|--------------------------------------------------------------------------
*/
function isAllowedPhone(
  value: string
): boolean {
  return getPhoneCountryCode(value) !== null;
}

/*
|--------------------------------------------------------------------------
| RUTAS AUTH
|--------------------------------------------------------------------------
*/
export async function authRoutes(
  app: FastifyInstance
) {
  // =========================================================
  // LOGIN
  // =========================================================

  app.post<{ Body: LoginBody }>(
    "/api/auth/login",
                {
                schema: {
                tags: ["Auth"],
                summary: "Iniciar sesión",
                description: "Inicia sesión utilizando correo electrónico o teléfono.",
                body: {
                    type: "object",
                    properties: {
                    email: {
                        type: "string",
                        format: "email",
                        description: "Correo electrónico del usuario",
                    },
                    phone: {
                        type: "string",
                        description: "Teléfono del usuario",
                    },
                    password: {
                        type: "string",
                        minLength: 1,
                        description: "Contraseña",
                    },
                    },
                    required: ["password"],
                    additionalProperties: false,
                },
                },
            },
    async (request, reply) => {
      const {
        email,
        phone,
        password,
      } = request.body;

      const normalizedEmail =
        typeof email === "string"
          ? email.trim().toLowerCase()
          : "";

      const normalizedPhone =
        typeof phone === "string"
          ? normalizePhone(phone)
          : "";

      // =====================================================
      // EXACTAMENTE UNO: EMAIL O TELÉFONO
      // =====================================================

      const hasEmail =
        Boolean(normalizedEmail);

      const hasPhone =
        Boolean(normalizedPhone);

      if (
        (!hasEmail && !hasPhone) ||
        (hasEmail && hasPhone)
      ) {
        return reply.status(400).send({
          success: false,
          statusCode: 400,
          error: "Bad Request",
          message:
            "Debes indicar un email o un número de teléfono.",
        });
      }

      // =====================================================
      // CONTRASEÑA
      // =====================================================

      if (!password) {
        return reply.status(400).send({
          success: false,
          statusCode: 400,
          error: "Bad Request",
          message:
            "La contraseña es obligatoria.",
        });
      }

      // =====================================================
      // VALIDAR EMAIL
      // =====================================================

      if (
        hasEmail &&
        !isValidEmail(normalizedEmail)
      ) {
        return reply.status(400).send({
          success: false,
          statusCode: 400,
          error: "Bad Request",
          message:
            "El correo electrónico no tiene un formato válido.",
        });
      }

      // =====================================================
      // VALIDAR TELÉFONO
      // =====================================================

      if (
        hasPhone &&
        !isValidInternationalPhone(
          normalizedPhone
        )
      ) {
        return reply.status(400).send({
          success: false,
          statusCode: 400,
          error: "Bad Request",
          message:
            "El número de teléfono debe estar en formato internacional. Ejemplo: +5355555555.",
        });
      }

      /*
       * En el LOGIN no vamos a bloquear países.
       *
       * Esto es intencional.
       *
       * Si un usuario antiguo ya existe con otro código
       * de país, debe poder seguir entrando.
       */

      try {
        const authResult = hasEmail
          ? await supabase.auth.signInWithPassword({
              email: normalizedEmail,
              password,
            })
          : await supabase.auth.signInWithPassword({
              phone: normalizedPhone,
              password,
            });

        const {
          data,
          error,
        } = authResult;

        if (
          error ||
          !data.session ||
          !data.user
        ) {
          request.log.warn(
            {
              email: hasEmail
                ? normalizedEmail
                : undefined,

              phone: hasPhone
                ? normalizedPhone
                : undefined,

              error: error?.message,
            },
            "Login fallido"
          );

          return reply.status(401).send({
            success: false,
            statusCode: 401,
            error: "Unauthorized",
            message:
              "Los datos de acceso son incorrectos.",
          });
        }

        return {
          success: true,

          user: {
            id: data.user.id,

            email:
              data.user.email ?? null,

            phone:
              data.user.phone ?? null,

            user_metadata:
              data.user.user_metadata ?? {},
          },

          session: {
            accessToken:
              data.session.access_token,

            refreshToken:
              data.session.refresh_token,

            expiresAt:
              data.session.expires_at ?? null,

            expiresIn:
              data.session.expires_in,
          },
        };
      } catch (error) {
        request.log.error(
          error,
          "Error durante el login"
        );

        return reply.status(401).send({
          success: false,
          statusCode: 401,
          error: "Unauthorized",
          message:
            "No se pudo iniciar sesión.",
        });
      }
    }
  );

  // =========================================================
  // REGISTRO
  // =========================================================

  app.post<{ Body: RegisterBody }>(
    "/api/auth/register",
    async (request, reply) => {
      const {
        email,
        phone,
        password,
        confirmPassword,
      } = request.body;

     
      // =====================================================
      // NORMALIZAR
      // =====================================================

      const normalizedEmail =
        typeof email === "string"
          ? email.trim().toLowerCase()
          : "";

      const normalizedPhone =
        typeof phone === "string"
          ? normalizePhone(phone)
          : "";

      const hasEmail =
        Boolean(normalizedEmail);

      const hasPhone =
        Boolean(normalizedPhone);

      // =====================================================
      // EXACTAMENTE UNO
      // =====================================================

      if (
        (!hasEmail && !hasPhone) ||
        (hasEmail && hasPhone)
      ) {
        return reply.status(400).send({
          success: false,
          statusCode: 400,
          error: "Bad Request",
          message:
            "Debes registrarte utilizando un email o un número de teléfono.",
        });
      }

      // =====================================================
      // VALIDAR EMAIL
      // =====================================================

      if (
        hasEmail &&
        !isValidEmail(normalizedEmail)
      ) {
        return reply.status(400).send({
          success: false,
          statusCode: 400,
          error: "Bad Request",
          message:
            "El correo electrónico no tiene un formato válido.",
        });
      }

      // =====================================================
      // VALIDAR TELÉFONO
      // =====================================================

      if (hasPhone) {
        if (
          !isValidInternationalPhone(
            normalizedPhone
          )
        ) {
          return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "Bad Request",
            message:
              "El número de teléfono debe estar en formato internacional. Ejemplo: +5355555555.",
          });
        }

        if (
          !isAllowedPhone(
            normalizedPhone
          )
        ) {
          return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "Bad Request",
            message:
              "Por el momento solo aceptamos teléfonos de Cuba, Estados Unidos, Venezuela, Panamá, México, España, Italia, Francia, Alemania, Rusia y China.",
          });
        }
      }

      // =====================================================
      // VALIDAR CONTRASEÑA
      // =====================================================

      if (!password) {
        return reply.status(400).send({
          success: false,
          statusCode: 400,
          error: "Bad Request",
          message:
            "La contraseña es obligatoria.",
        });
      }

      if (password.length < 8) {
        return reply.status(400).send({
          success: false,
          statusCode: 400,
          error: "Bad Request",
          message:
            "La contraseña debe tener al menos 8 caracteres.",
        });
      }

      if (!confirmPassword) {
        return reply.status(400).send({
          success: false,
          statusCode: 400,
          error: "Bad Request",
          message:
            "Debes confirmar la contraseña.",
        });
      }

      if (
        password !== confirmPassword
      ) {
        return reply.status(400).send({
          success: false,
          statusCode: 400,
          error: "Bad Request",
          message:
            "Las contraseñas no coinciden.",
        });
      }

      try {
        // ===================================================
        // CREAR USUARIO EN SUPABASE AUTH
        // ===================================================

        const authResult = hasEmail
          ? await supabase.auth.signUp({
              email: normalizedEmail,

              password,

              options: {
                data: {
                        registration_method: "email",
                        account_type: "customer",
                      },
              },
            })
          : await supabase.auth.signUp({
              phone: normalizedPhone,

              password,

              options: {
                data: {
                        registration_method: "phone",
                        account_type: "customer",
                      },
              },
            });

        const {
          data: authData,
          error: authError,
        } = authResult;

        // ===================================================
        // ERROR SUPABASE AUTH
        // ===================================================

        if (
          authError ||
          !authData.user
        ) {
          request.log.warn(
            {
              email: hasEmail
                ? normalizedEmail
                : undefined,

              phone: hasPhone
                ? normalizedPhone
                : undefined,

              error:
                authError?.message,
            },
            "Registro fallido en Supabase Auth"
          );

          return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "RegistrationError",
            message:
              authError?.message ||
              "No se pudo crear la cuenta.",
          });
        }

        // ===================================================
        // CREAR CLIENTE
        // ===================================================
        //
        // IMPORTANTE:
        //
        // Puede existir un trigger de Supabase que cree
        // automáticamente el cliente cuando se crea
        // auth.users.
        //
        // Por eso PRIMERO comprobamos si ya existe.
        //
        // Así evitamos duplicados y errores de registro.
        // ===================================================

        let customer =
          await getCustomerByAuthUserId(
            authData.user.id
          );

        
          if (!customer) {
            customer = await createNewCustomer({
              first_name: "Cliente",
              last_name_1: "pendiente",
              last_name_2: "de completar",
              full_name: "Cliente pendiente de completar",
              identification: `PEND-${authData.user.id}`,
              email: hasEmail ? normalizedEmail : null,
              phone: hasPhone ? normalizedPhone : null,
              province: null,
              municipality: null,
              address: null,
              auth_user_id: authData.user.id,
              manager_id: null,
              source_type: "direct",
            });
          }

        // ===================================================
        // RESPUESTA
        // ===================================================

        return reply.status(201).send({
          success: true,

          message:
            "Cuenta creada correctamente.",

          user: {
            id: authData.user.id,

            email:
              authData.user.email ??
              null,

            phone:
              authData.user.phone ??
              null,

            user_metadata:
              authData.user.user_metadata ??
              {},
          },

          session: authData.session
            ? {
                accessToken:
                  authData.session
                    .access_token,

                refreshToken:
                  authData.session
                    .refresh_token,

                expiresAt:
                  authData.session
                    .expires_at ??
                  null,

                expiresIn:
                  authData.session
                    .expires_in,
              }
            : null,

          customer: customer
            ? {
                id: customer.id,
              }
            : null,
        });
      } catch (error) {
        console.error(
          "========== ERROR REAL DEL REGISTRO =========="
        );

        console.error(error);

        console.error(
          "============================================="
        );

        request.log.error(
          error,
          "Error completando el registro"
        );

        return reply.status(400).send({
          success: false,
          statusCode: 400,
          error: "RegistrationError",
          message:
            error instanceof Error
              ? error.message
              : "No se pudo completar el registro.",
        });
      }
    }
  );

  // =========================================================
  // USUARIO AUTENTICADO
  // =========================================================

  app.get(
    "/api/auth/me",
    {
      preHandler:
        app.authenticate,
    },
    async (request, reply) => {
      const authUserId =
        request.authenticatedUser?.id;

      if (!authUserId) {
        return reply.status(401).send({
          success: false,
          message:
            "No se pudo identificar al usuario.",
        });
      }

      const customer =
        await getCustomerByAuthUserId(
          authUserId
        );

      if (!customer) {
        return reply.status(404).send({
          success: false,
          message:
            "No existe un perfil de cliente asociado a este usuario.",
        });
      }

      return reply.send({
        success: true,
        data: customer,
      });
    }
  );

  
  // =========================================================
  // PEDIDOS DEL CLIENTE AUTENTICADO
  // =========================================================

  app.get(
    "/api/auth/me/orders",
    {
      preHandler: app.authenticate,
    },
    async (request, reply) => {
      const authUserId =
        request.authenticatedUser?.id;

      if (!authUserId) {
        return reply.status(401).send({
          success: false,
          message: "No se pudo identificar al usuario.",
        });
      }

      try {
        // Obtener el perfil asociado a la sesión autenticada.
        const customer =
          await getCustomerByAuthUserId(authUserId);

        if (!customer) {
          return reply.status(404).send({
            success: false,
            message:
              "No existe un perfil de cliente asociado a este usuario.",
          });
        }

        // El ID procede del perfil verificado en el servidor,
        // nunca de un parámetro enviado por el navegador.
        const orders =
          await getOrdersByCustomerId(customer.id);

        return reply.send({
          success: true,
          data: orders,
        });
      } catch (error) {
        request.log.error(
          error,
          "Error obteniendo los pedidos del cliente"
        );

        return reply.status(500).send({
          success: false,
          message: "No se pudieron obtener tus pedidos.",
        });
      }
    }
  );

  
  // =========================================================
  // CREAR PEDIDO DESDE EL CATÁLOGO ONLINE
  // =========================================================

  app.post(
    "/api/auth/me/orders",
    {
      preHandler: app.authenticate,
    },
    async (request, reply) => {
      const authUserId =
        request.authenticatedUser?.id;

      if (!authUserId) {
        return reply.status(401).send({
          success: false,
          message: "Debes iniciar sesión para crear un pedido.",
        });
      }

      try {
        // El cliente se obtiene de la sesión autenticada.
        const customer =
          await getCustomerByAuthUserId(authUserId);

        if (!customer) {
          return reply.status(404).send({
            success: false,
            message:
              "No existe un perfil de cliente asociado a esta cuenta.",
          });
        }

        const body =
          request.body &&
          typeof request.body === "object" &&
          !Array.isArray(request.body)
            ? request.body as Record<string, unknown>
            : {};

        // Los datos de cliente y gestor se determinan
        // en el servidor, nunca desde el navegador.
        const bodyResult = createOrderSchema.safeParse({
          ...body,
          customer_id: customer.id,
          manager_id: customer.manager_id ?? null,
          source_type: customer.manager_id
            ? "manager"
            : "direct",
        });

        if (!bodyResult.success) {
          return reply.status(400).send({
            success: false,
            message: "Los datos del pedido no son válidos.",
            details: bodyResult.error.issues,
          });
        }

        const result = await createNewOrder(
          bodyResult.data
        );

        return reply.status(201).send({
          success: true,
          message: "Pedido creado correctamente.",
          data: result.order,
          items: result.items,
        });
      } catch (error) {
        request.log.error(
          error,
          "Error creando un pedido del catálogo online"
        );

        return reply.status(400).send({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "No se pudo crear el pedido.",
        });
      }
    }
  );

  // =========================================================
  // ACTUALIZAR PERFIL
  // =========================================================

app.patch(
  "/api/auth/me",
  {
    preHandler: app.authenticate,
  },
  async (request, reply) => {
    const authUserId =
      request.authenticatedUser?.id;

    if (!authUserId) {
      return reply.status(401).send({
        success: false,
        message: "No se pudo identificar al usuario.",
      });
    }

    const {
      first_name,
      last_name_1,
      last_name_2,
      full_name,
      identification,
      email,
      phone,
      province,
      municipality,
      address,
    } = request.body as {
      first_name?: string;
      last_name_1?: string;
      last_name_2?: string;
      full_name?: string;
      identification?: string | null;
      email?: string | null;
      phone?: string | null;
      province?: string | null;
      municipality?: string | null;
      address?: string | null;
    };

    try {
      const customer = await updateCustomerProfile(
        authUserId,
        {
          ...(typeof first_name === "string"
            ? { first_name }
            : {}),
          ...(typeof last_name_1 === "string"
            ? { last_name_1 }
            : {}),
          ...(typeof last_name_2 === "string"
            ? { last_name_2 }
            : {}),
          ...(typeof full_name === "string"
            ? { full_name }
            : {}),
          ...(typeof identification === "string" ||
          identification === null
            ? { identification }
            : {}),
          email,
          phone,
          province,
          municipality,
          address,
        }
      );

      if (!customer) {
        return reply.status(404).send({
          success: false,
          message:
            "No existe un perfil de cliente asociado a este usuario.",
        });
      }

      return reply.send({
        success: true,
        message: "Datos actualizados correctamente.",
        data: customer,
      });
    } catch (error) {
      request.log.error(
        error,
        "Error actualizando el perfil del cliente"
      );

      return reply.status(400).send({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "No se pudieron actualizar los datos.",
      });
    }
  }
);

  
  
app.post(
  "/api/auth/me/manager",
  {
    preHandler: app.authenticate,
  },
  async (request, reply) => {
    const authUserId = request.authenticatedUser?.id;

    if (!authUserId) {
      return reply.status(401).send({
        success: false,
        message: "No se pudo identificar al usuario.",
      });
    }

    const body = request.body as {
      manager_code?: string;
    };

    if (
      typeof body?.manager_code !== "string" ||
      !body.manager_code.trim()
    ) {
      return reply.status(400).send({
        success: false,
        message: "Debes introducir el código del gestor.",
      });
    }

    try {
      const result = await linkCustomerToManagerByCode(
        authUserId,
        body.manager_code
      );

      return reply.send({
        success: true,
        message: "Gestor vinculado correctamente.",
        data: result,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo vincular el gestor.";

      request.log.error(
        error,
        "Error vinculando el cliente con un gestor"
      );

      return reply.status(400).send({
        success: false,
        message,
      });
    }
  }
);

    // =========================================================
  // VERIFICAR ACCESO ADMINISTRATIVO
  // =========================================================

    // =========================================================
  // VERIFICAR ACCESO ADMINISTRATIVO
  // =========================================================

  app.get(
    "/api/auth/admin",
    {
      preHandler: app.authenticate,
    },
    async (request, reply) => {
      try {
        const userId =
          request.authenticatedUser?.id;

        if (!userId) {
          return reply.status(401).send({
            success: false,
            statusCode: 401,
            error: "Unauthorized",
            message:
              "No se pudo identificar al usuario.",
          });
        }

        // =====================================================
        // 1. COMPROBAR SI ES ADMINISTRADOR
        // =====================================================

        const authenticatedSupabase =
          createClient(
            env.SUPABASE_URL,
            env.SUPABASE_ANON_KEY,
            {
              auth: {
                persistSession: false,
                autoRefreshToken: false,
              },
              accessToken: async () => {
                const authorization =
                  request.headers.authorization;

                if (!authorization) {
                  return "";
                }

                return authorization
                  .replace(/^Bearer\s+/i, "")
                  .trim();
              },
            }
          );

        const {
          data: isAdminData,
          error: isAdminError,
        } =
          await authenticatedSupabase.rpc(
            "is_admin"
          );

        if (isAdminError) {
          request.log.error(
            {
              error: isAdminError.message,
              code: isAdminError.code,
              details: isAdminError.details,
              hint: isAdminError.hint,
              userId,
            },
            "Error verificando administrador"
          );

          return reply.status(500).send({
            success: false,
            statusCode: 500,
            error: "AdminCheckError",
            message:
              "No se pudo verificar el acceso administrativo.",
          });
        }

        const isAdmin =
          Boolean(isAdminData);

        // =====================================================
        // 2. OBTENER ROL DEL USUARIO
        // =====================================================

        const {
          data: userRole,
          error: userRoleError,
        } = await supabaseAdmin
          .from("user_roles")
          .select(`
            role_id,
            roles (
              id,
              code,
              name,
              description,
              permissions,
              active
            )
          `)
          .eq("user_id", userId)
          .maybeSingle();

        if (userRoleError) {
          request.log.error(
            {
              error:
                userRoleError.message,
              code:
                userRoleError.code,
              details:
                userRoleError.details,
              hint:
                userRoleError.hint,
              userId,
            },
            "Error obteniendo el rol del usuario"
          );

          return reply.status(500).send({
            success: false,
            statusCode: 500,
            error: "RoleCheckError",
            message:
              "No se pudo obtener el rol del usuario.",
          });
        }

        const role = Array.isArray(
          userRole?.roles
        )
          ? userRole.roles[0] ?? null
          : userRole?.roles ?? null;

        const roleIsActive =
          Boolean(role?.active);

        // =====================================================
        // 3. DETERMINAR ACCESO AL PANEL
        // =====================================================

        const hasAdminAccess =
          isAdmin ||
          (
            roleIsActive &&
            (
              role?.code === "admin" ||
              role?.code === "manager" ||
              role?.code === "vendedor"
            )
          );

        // =====================================================
        // 4. SI NO TIENE ACCESO
        // =====================================================

        if (!hasAdminAccess) {
          return reply.send({
            success: true,
            isAdmin,
            hasAdminAccess: false,
            role: null,
            permissions: [],
          });
        }

        // =====================================================
        // 5. RESPUESTA
        // =====================================================

        return reply.send({
          success: true,

          // Administrador real
          isAdmin,

          // Cualquier usuario interno autorizado
          hasAdminAccess,

          role: role
            ? {
                id: role.id,
                code: role.code,
                name: role.name,
                description:
                  role.description ?? null,
                active:
                  Boolean(role.active),
              }
            : null,

          permissions:
            Array.isArray(
              role?.permissions
            )
              ? role.permissions
              : [],
        });
      } catch (error) {
        request.log.error(
          error,
          "Error comprobando acceso administrativo"
        );

        return reply.status(500).send({
          success: false,
          statusCode: 500,
          error: "AdminCheckError",
          message:
            "No se pudo verificar el acceso administrativo.",
        });
      }
    }
  );
}