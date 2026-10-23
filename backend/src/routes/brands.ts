import type { FastifyInstance } from "fastify";

import {
  createBrandController,
  deleteBrandController,
  getBrand,
  listBrands,
  updateBrandController,
  uploadBrandLogoController,
} from "../controllers/brands/brandController";

export default async function brandRoutes(
  app: FastifyInstance
) {
  // GET /api/brands
  app.get(
    "/api/brands",
    {
      schema: {
        tags: ["Brands"],
        summary: "Obtener marcas",
        security: [{ bearerAuth: [] }],
        description:
          "Devuelve todas las marcas registradas.",
      },

      preHandler: [
        app.authenticate,
        app.requirePermission("brands.view"),
      ],
    },
    listBrands
  );

  // GET /api/brands/:id
  app.get<{
    Params: {
      id: string;
    };
  }>(
    "/api/brands/:id",
    {
      schema: {
        tags: ["Brands"],
        summary: "Obtener marca por ID",
        description:
          "Devuelve una marca específica.",
      },

      preHandler: [
        app.authenticate,
        app.requirePermission("brands.view"),
      ],
    },
    getBrand
  );

  // POST /api/brands
  app.post(
    "/api/brands",
    {
      schema: {
        tags: ["Brands"],
        summary: "Crear marca",
        description:
          "Registra una nueva marca.",
      },

      preHandler: [
        app.authenticate,
        app.requirePermission("brands.manage"),
      ],
    },
    createBrandController
  );

  // PUT /api/brands/:id
  app.put<{
    Params: {
      id: string;
    };
  }>(
    "/api/brands/:id",
    {
      schema: {
        tags: ["Brands"],
        summary: "Actualizar marca",
        description:
          "Actualiza los datos de una marca.",
      },

      preHandler: [
        app.authenticate,
        app.requirePermission("brands.manage"),
      ],
    },
    updateBrandController
  );

  // LOGO /api/brands/:id
    app.post<{
        Params: {
            id: string;
        };
        }>(
        "/api/brands/:id/logo",
        {
            schema: {
            tags: ["Brands"],
            summary: "Subir logo de marca",
            description: "Sube el logo de una marca.",
            },
            preHandler: [
            app.authenticate,
            app.requirePermission("brands.manage"),
            ],
        },
        uploadBrandLogoController
        );

  // DELETE /api/brands/:id
  app.delete<{
    Params: {
      id: string;
    };
  }>(
    "/api/brands/:id",
    {
      schema: {
        tags: ["Brands"],
        summary: "Eliminar marca",
        description:
          "Elimina definitivamente una marca.",
      },

      preHandler: [
        app.authenticate,
        app.requirePermission("brands.manage"),
      ],
    },
    deleteBrandController
  );
}