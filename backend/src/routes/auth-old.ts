import type { FastifyInstance } from "fastify";
import { supabase } from "../config/supabase";
import { env } from "../config/env";
import { createClient } from "@supabase/supabase-js";

import {
  getCustomerByAuthUserId,
  createNewCustomer,
  updateCustomerProfile,
} from "../services/customers/customerService";

interface LoginBody {
  email: string;
  password: string;
}

interface RegisterBody {
  firstName: string;
  lastName1: string;
  lastName2: string;
  identification: string;
  email: string;
  phone: string;
  province: string;
  municipality: string;
  address: string;
  password: string;
  confirmPassword: string;
}

export async function authRoutes(
  app: FastifyInstance
) {
  // =========================================================
  // REFRESH SESSION
  // =========================================================

  app.post(
    "/api/auth/refresh",
    async (request, reply) => {
      try {
        const {
          refreshToken,
        } = request.body as {
          refreshToken?: string;
        };

        if (!refreshToken) {
          return reply.status(400).send({
            success: false,
            message:
              "El refreshToken es obligatorio.",
          });
        }

        const authClient = createClient(
          env.SUPABASE_URL,
          env.SUPABASE_ANON_KEY,
          {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
          }
        );

        const {
          data,
          error,
        } =
          await authClient.auth.refreshSession({
            refresh_token: refreshToken,
          });

        if (
          error ||
          !data.session ||
          !data.user
        ) {
          request.log.warn(
            {
              error: error?.message,
            },
            "No se pudo renovar la sesión"
          );

          return reply.status(401).send({
            success: false,
            message:
              "La sesión ya no puede renovarse. Debes iniciar sesión nuevamente.",
          });
        }

        return reply.send({
          success: true,

          user: {
            id: data.user.id,
            email:
              data.user.email ?? null,
            user_metadata:
              data.user.user_metadata ?? {},
          },

          session: {
            accessToken:
              data.session.access_token,

            refreshToken:
              data.session.refresh_token,

            expiresAt:
              data.session.expires_at ??
              null,

            expiresIn:
              data.session.expires_in,
          },
        });
      } catch (error) {
        request.log.error(
          error,
          "Error renovando la sesión"
        );

        return reply.status(401).send({
          success: false,
          message:
            "No se pudo renovar la sesión.",
        });
      }
    }
  );

  // =========================================================
  // LOGIN
  // =========================================================

  app.post<{ Body: LoginBody }>(
    "/api/auth/login",
    async (request, reply) => {
      console.log(
        "========== BODY LOGIN =========="
      );

      console.log(request.body);

      console.log(
        "================================"
      );

      const {
        email,
        password,
      } = request.body;

      if (!email || !password) {
        return reply.status(400).send({
          success: false,
          statusCode: 400,
          error: "Bad Request",
          message:
            "El email y la contraseña son obligatorios.",
        });
      }

      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (
        error ||
        !data.session ||
        !data.user
      ) {
        request.log.warn(
          {
            email,
            error: error?.message,
          },
          "Login fallido"
        );

        return reply.status(401).send({
          success: false,
          statusCode: 401,
          error: "Unauthorized",
          message:
            "Email o contraseña incorrectos.",
        });
      }

      return {
        success: true,

        user: {
          id: data.user.id,
          email:
            data.user.email ?? null,
          user_metadata:
            data.user.user_metadata ?? {},
        },

        session: {
          accessToken:
            data.session.access_token,

          refreshToken:
            data.session.refresh_token,

          expiresAt:
            data.session.expires_at ??
            null,

          expiresIn:
            data.session.expires_in,
        },
      };
    }
  );

  // =========================================================
  // REGISTRO DE CLIENTE
  // =========================================================

  app.post<{ Body: RegisterBody }>(
    "/api/auth/register",
    async (request, reply) => {
      const {
        firstName,
        lastName1,
        lastName2,
        identification,
        email,
        phone,
        province,
        municipality,
        address,
        password,
        confirmPassword,
      } = request.body;

      console.log(
        "========== BODY REGISTRO =========="
      );

      console.log(request.body);

      console.log(
        "===================================="
      );

      // -----------------------------------------------------
      // Validaciones obligatorias
      // -----------------------------------------------------

      if (
        !firstName ||
        !lastName1 ||
        !lastName2 ||
        !identification ||
        !email ||
        !phone ||
        !municipality ||
        !address ||
        !password ||
        !confirmPassword
      ) {
        return reply.status(400).send({
          success: false,
          statusCode: 400,
          error: "Bad Request",
          message:
            "Todos los campos obligatorios deben completarse.",
        });
      }

      // -----------------------------------------------------
      // Identificación
      // -----------------------------------------------------

      if (!/^\d{11}$/.test(
        identification
      )) {
        return reply.status(400).send({
          success: false,
          statusCode: 400,
          error: "Bad Request",
          message:
            "El carnet de identidad debe tener exactamente 11 dígitos.",
        });
      }

      // -----------------------------------------------------
      // Teléfono
      // -----------------------------------------------------

      const normalizedPhone =
        phone.replace(
          /[\s-]/g,
          ""
        );

      if (
        !/^5\d{7}$/.test(
          normalizedPhone
        )
      ) {
        return reply.status(400).send({
          success: false,
          statusCode: 400,
          error: "Bad Request",
          message:
            "El teléfono debe tener 8 dígitos y comenzar con 5.",
        });
      }

      // -----------------------------------------------------
      // Contraseña
      // -----------------------------------------------------

      if (password.length < 8) {
        return reply.status(400).send({
          success: false,
          statusCode: 400,
          error: "Bad Request",
          message:
            "La contraseña debe tener al menos 8 caracteres.",
        });
      }

      if (
        password !==
        confirmPassword
      ) {
        return reply.status(400).send({
          success: false,
          statusCode: 400,
          error: "Bad Request",
          message:
            "Las contraseñas no coinciden.",
        });
      }

      // -----------------------------------------------------
      // Normalización del nombre
      // -----------------------------------------------------

      const normalizedFirstName =
        firstName.trim();

      const normalizedLastName1 =
        lastName1.trim();

      const normalizedLastName2 =
        lastName2.trim();

      const fullName = [
        normalizedFirstName,
        normalizedLastName1,
        normalizedLastName2,
      ]
        .filter(Boolean)
        .join(" ");

      const normalizedEmail =
        email.trim().toLowerCase();

      const normalizedProvince =
        province?.trim() ||
        "La Habana";

      const normalizedMunicipality =
        municipality.trim();

      const normalizedAddress =
        address.trim();

      const normalizedIdentification =
        identification.trim();

      try {
        // ---------------------------------------------------
        // Crear usuario en Supabase Auth
        // ---------------------------------------------------

        const {
          data: authData,
          error: authError,
        } =
          await supabase.auth.signUp({
            email:
              normalizedEmail,

            password,

            options: {
              data: {
                first_name:
                  normalizedFirstName,

                last_name_1:
                  normalizedLastName1,

                last_name_2:
                  normalizedLastName2,

                full_name:
                  fullName,

                carnet:
                  normalizedIdentification,

                phone:
                  normalizedPhone,

                province:
                  normalizedProvince,

                municipality:
                  normalizedMunicipality,

                address:
                  normalizedAddress,
              },
            },
          });

        // ---------------------------------------------------
        // Error de Supabase Auth
        // ---------------------------------------------------

        if (
          authError ||
          !authData.user
        ) {
          request.log.warn(
            {
              email:
                normalizedEmail,

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

        // ---------------------------------------------------
        // Crear perfil en customers
        // ---------------------------------------------------

        const customer =
          await createNewCustomer({
            first_name:
              normalizedFirstName,

            last_name_1:
              normalizedLastName1,

            last_name_2:
              normalizedLastName2,

            full_name:
              fullName,

            identification:
              normalizedIdentification,

            email:
              normalizedEmail,

            phone:
              normalizedPhone,

            province:
              normalizedProvince,

            municipality:
              normalizedMunicipality,

            address:
              normalizedAddress,

            auth_user_id:
              authData.user.id,

            manager_id:
              null,

            source_type:
              "direct",
          });

        // ---------------------------------------------------
        // Respuesta
        // ---------------------------------------------------

        return reply
          .status(201)
          .send({
            success: true,

            message:
              authData.session
                ? "Cuenta creada correctamente."
                : "Cuenta creada correctamente. Revisa tu correo para confirmar la cuenta.",

            user: {
              id:
                authData.user.id,

              email:
                authData.user.email ??
                normalizedEmail,
            },

            customer,

            session:
              authData.session
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
  // DATOS DEL CLIENTE AUTENTICADO
  // =========================================================

  app.get(
    "/api/auth/me",
    {
      preHandler:
        app.authenticate,
    },
    async (
      request,
      reply
    ) => {
      const authUserId =
        request
          .authenticatedUser
          ?.id;

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
  // ACTUALIZAR PERFIL DEL CLIENTE
  // =========================================================

  app.patch(
    "/api/auth/me",
    {
      preHandler:
        app.authenticate,
    },
    async (
      request,
      reply
    ) => {
      const authUserId =
        request
          .authenticatedUser
          ?.id;

      if (!authUserId) {
        return reply.status(401).send({
          success: false,
          message:
            "No se pudo identificar al usuario.",
        });
      }

      const {
        first_name,
        last_name_1,
        last_name_2,
        full_name,
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
        email?: string | null;
        phone?: string | null;
        province?: string | null;
        municipality?: string | null;
        address?: string | null;
      };

      try {
        // ---------------------------------------------------
        // Construir full_name si vienen los campos separados
        // ---------------------------------------------------

        const hasNameFields =
          first_name !== undefined ||
          last_name_1 !== undefined ||
          last_name_2 !== undefined;

        let normalizedFullName =
          full_name;

        if (hasNameFields) {
          normalizedFullName = [
            first_name?.trim(),
            last_name_1?.trim(),
            last_name_2?.trim(),
          ]
            .filter(Boolean)
            .join(" ");
        }

        const customer =
          await updateCustomerProfile(
            authUserId,
            {
              first_name:
                first_name?.trim(),

              last_name_1:
                last_name_1?.trim(),

              last_name_2:
                last_name_2?.trim(),

              full_name:
                normalizedFullName,

              email:
                email?.trim(),

              phone:
                phone?.trim(),

              province:
                province?.trim(),

              municipality:
                municipality?.trim(),

              address:
                address?.trim(),
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

          message:
            "Datos actualizados correctamente.",

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
}
