import type { FastifyInstance } from "fastify";

import {
  getRolesController,
  getRoleByIdController,
  createRoleController,
  updateRoleController,
  deleteRoleController,
} from "../controllers/roles/roleController";

export async function roleRoutes(
  app: FastifyInstance
) {
  app.get(
    "/api/roles",
    {
      preHandler: [
        app.authenticate,
        app.requirePermission("roles.view"),
      ],
    },
    getRolesController
  );

  app.get(
    "/api/roles/:id",
    {
      preHandler: [
        app.authenticate,
        app.requirePermission("roles.view"),
      ],
    },
    getRoleByIdController
  );

  app.post(
    "/api/roles",
    {
      preHandler: [
        app.authenticate,
        app.requirePermission("roles.manage"),
      ],
    },
    createRoleController
  );

  app.put(
    "/api/roles/:id",
    {
      preHandler: [
        app.authenticate,
        app.requirePermission("roles.manage"),
      ],
    },
    updateRoleController
  );

  app.delete(
    "/api/roles/:id",
    {
      preHandler: [
        app.authenticate,
        app.requirePermission("roles.manage"),
      ],
    },
    deleteRoleController
  );
}