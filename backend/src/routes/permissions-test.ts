import type { FastifyInstance } from "fastify";

export async function permissionsTestRoutes(
  app: FastifyInstance
) {
  app.get(
    "/api/admin/test",
    {
      preHandler: [
        app.authenticate,
        app.requireAdmin(),
      ],
    },
    async (request) => {
      return {
        success: true,
        message: "Acceso de administrador autorizado.",
        user: request.authenticatedUser,
      };
    }
  );

  app.get(
    "/api/manager/test",
    {
      preHandler: [
        app.authenticate,
        app.requirePermission(
          "manager.dashboard"
        ),
      ],
    },
    async (request) => {
      return {
        success: true,
        message: "Acceso de gestor autorizado.",
        user: request.authenticatedUser,
      };
    }
  );

  app.get(
    "/api/products/test",
    {
      preHandler: [
        app.authenticate,
        app.requirePermission(
          "products.view"
        ),
      ],
    },
    async (request) => {
      return {
        success: true,
        message: "Permiso products.view autorizado.",
        user: request.authenticatedUser,
      };
    }
  );
}