import fp from "fastify-plugin";
import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";
import {
  createClient,
} from "@supabase/supabase-js";

import {
  getAuthenticatedSupabase,
} from "../config/authenticatedSupabase";

import { env } from "../config/env";


export async function isAdmin(
  request: FastifyRequest
): Promise<boolean> {
  const authenticatedSupabase =
    getAuthenticatedSupabase(request);

  if (!authenticatedSupabase) {
    return false;
  }

  const { data, error } =
    await authenticatedSupabase.rpc(
      "is_admin"
    );

  if (error) {
    request.log.error(
      {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      },
      "Error verificando administrador"
    );

    return false;
  }

  return Boolean(data);
}

function requireAdmin() {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    if (!request.authenticatedUser) {
      return reply.status(401).send({
        success: false,
        statusCode: 401,
        error: "Unauthorized",
        message: "Debes iniciar sesión.",
      });
    }

    const admin = await isAdmin(request);

    if (!admin) {
      return reply.status(403).send({
        success: false,
        statusCode: 403,
        error: "Forbidden",
        message:
          "No tienes permisos de administrador.",
      });
    }
  };
}

function requirePermission(
  permission: string
) {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    if (!request.authenticatedUser) {
      return reply.status(401).send({
        success: false,
        statusCode: 401,
        error: "Unauthorized",
        message: "Debes iniciar sesión.",
      });
    }

    const authenticatedSupabase =
      getAuthenticatedSupabase(request);

    if (!authenticatedSupabase) {
      return reply.status(401).send({
        success: false,
        statusCode: 401,
        error: "Unauthorized",
        message:
          "No se pudo obtener el token de autenticación.",
      });
    }

    const admin = await isAdmin(request);

    if (admin) {
      return;
    }

    const { data, error } =
      await authenticatedSupabase.rpc(
        "has_permission",
        {
          p_permission: permission,
        }
      );

    if (error) {
      request.log.error(
        {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          permission,
          userId:
            request.authenticatedUser.id,
        },
        "Error verificando permiso"
      );

      return reply.status(500).send({
        success: false,
        statusCode: 500,
        error: "PermissionCheckError",
        message:
          "No se pudo verificar el permiso.",
      });
    }

    if (!data) {
      return reply.status(403).send({
        success: false,
        statusCode: 403,
        error: "Forbidden",
        message:
          "No tienes permisos para realizar esta acción.",
        permission,
      });
    }
  };
}


function requireAnyPermission(
  permissions: string[]
) {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    if (!request.authenticatedUser) {
      return reply.status(401).send({
        success: false,
        statusCode: 401,
        error: "Unauthorized",
        message: "Debes iniciar sesión.",
      });
    }

    const authenticatedSupabase =
      getAuthenticatedSupabase(request);

    if (!authenticatedSupabase) {
      return reply.status(401).send({
        success: false,
        statusCode: 401,
        error: "Unauthorized",
        message:
          "No se pudo obtener el token de autenticación.",
      });
    }

    const admin = await isAdmin(request);

    if (admin) {
      return;
    }

    for (const permission of permissions) {
      const { data, error } =
        await authenticatedSupabase.rpc(
          "has_permission",
          {
            p_permission: permission,
          }
        );

      if (error) {
        request.log.error(
          {
            error: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            permission,
            userId: request.authenticatedUser.id,
          },
          "Error verificando permisos alternativos"
        );

        return reply.status(500).send({
          success: false,
          statusCode: 500,
          error: "PermissionCheckError",
          message:
            "No se pudieron verificar los permisos.",
        });
      }

      if (data) {
        return;
      }
    }

    return reply.status(403).send({
      success: false,
      statusCode: 403,
      error: "Forbidden",
      message:
        "No tienes permisos para consultar estos pedidos.",
      permissions,
    });
  };
}

export default fp(
  async (app) => {
    app.decorate(
      "requireAdmin",
      requireAdmin
    );

    app.decorate(
      "requirePermission",
      requirePermission
    );
    app.decorate(
      "requireAnyPermission",
      requireAnyPermission
    );
  },
  {
    name: "permissions",
    fastify: "5.x",
    dependencies: ["authentication"],
  }
);

declare module "fastify" {
  interface FastifyInstance {
    requireAdmin: () => (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<unknown>;

    requirePermission: (
      permission: string
    ) => (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<unknown>;
    requireAnyPermission: (
      permissions: string[]
    ) => (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<unknown>;
  }
}