
import type { FastifyInstance } from "fastify";

import {
  getUsersController,
  getUserByIdController,
  getUserRolesController,
  createUserController,
  updateUserController,
  updateUserStatusController,
  deleteUserController,
} from "../controllers/users/userController";

export async function userRoutes(app: FastifyInstance) {
  // Listar usuarios administrativos
  app.get(
    "/api/users",
    {
      preHandler: [
        app.authenticate,
        app.requirePermission("users.view"),
      ],
    },
    getUsersController
  );

  // Crear usuario administrativo
  app.post(
    "/api/users",
    {
      preHandler: [
        app.authenticate,
        app.requirePermission("users.manage"),
      ],
    },
    createUserController
  );

  // Obtener roles disponibles para usuarios.
  // Debe declararse antes de /:id.
  app.get(
    "/api/users/roles",
    {
      preHandler: [
        app.authenticate,
        app.requirePermission("users.view"),
      ],
    },
    getUserRolesController
  );

  // Obtener un usuario administrativo
  app.get<{ Params: { id: string } }>(
    "/api/users/:id",
    {
      preHandler: [
        app.authenticate,
        app.requirePermission("users.view"),
      ],
    },
    getUserByIdController
  );

  // Actualizar usuario administrativo
  app.put<{ Params: { id: string } }>(
    "/api/users/:id",
    {
      preHandler: [
        app.authenticate,
        app.requirePermission("users.manage"),
      ],
    },
    updateUserController
  );

  // Actualizar estado activo/inactivo del usuario
  app.put(
    "/api/users/:id/status",
    {
      preHandler: [
        app.authenticate,
        app.requirePermission("users.manage"),
      ],
    },
    updateUserStatusController
  );

  // Eliminar usuario administrativo
  app.delete<{ Params: { id: string } }>(
    "/api/users/:id",
    {
      preHandler: [
        app.authenticate,
        app.requirePermission("users.manage"),
      ],
    },
    deleteUserController
  );
}
