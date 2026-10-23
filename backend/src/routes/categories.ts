import type { FastifyInstance } from "fastify";

import {
  createCategoryController,
  deleteCategoryController,
  getCategory,
  listCategories,
  updateCategoryController,
} from "../controllers/categories/categoryController";

export default async function categoryRoutes(
  app: FastifyInstance
) {
  app.get(
    "/api/categories",
    {
      schema: {
        tags: ["Categories"],
        summary: "Obtener categorías",
        description:
          "Devuelve todas las categorías registradas.",
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      preHandler: [
        app.authenticate,
        app.requirePermission(
          "categories.view"
        ),
      ],
    },
    listCategories
  );

  app.get<{
    Params: {
      id: string;
    };
  }>(
    "/api/categories/:id",
    {
      schema: {
        tags: ["Categories"],
        summary:
          "Obtener categoría por ID",
        description:
          "Devuelve una categoría específica.",
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      preHandler: [
        app.authenticate,
        app.requirePermission(
          "categories.view"
        ),
      ],
    },
    getCategory
  );

  app.post(
    "/api/categories",
    {
      schema: {
        tags: ["Categories"],
        summary: "Crear categoría",
        description:
          "Registra una nueva categoría.",
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      preHandler: [
        app.authenticate,
        app.requirePermission(
          "categories.manage"
        ),
      ],
    },
    createCategoryController
  );

  app.put<{
    Params: {
      id: string;
    };
  }>(
    "/api/categories/:id",
    {
      schema: {
        tags: ["Categories"],
        summary:
          "Actualizar categoría",
        description:
          "Actualiza los datos de una categoría.",
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      preHandler: [
        app.authenticate,
        app.requirePermission(
          "categories.manage"
        ),
      ],
    },
    updateCategoryController
  );

  app.delete<{
    Params: {
      id: string;
    };
  }>(
    "/api/categories/:id",
    {
      schema: {
        tags: ["Categories"],
        summary:
          "Eliminar categoría",
        description:
          "Elimina una categoría.",
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      preHandler: [
        app.authenticate,
        app.requirePermission(
          "categories.manage"
        ),
      ],
    },
    deleteCategoryController
  );
}