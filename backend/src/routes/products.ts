import type { FastifyInstance } from "fastify";

import {
  getProductsController,
  getAllProductsController,
  getProductByIdController,
  createProductController,
  updateProductController,
  updateProductStatusController,
  deleteProductController,
} from "../controllers/products/productController";

import {
  uploadProductImageController,
} from "../controllers/products/productImageController";

import type {
  CreateProductInput,
} from "../validators/products/productValidator";

export async function productRoutes(
  app: FastifyInstance
) {
  // =========================================================
  // PRODUCTOS ACTIVOS - CATÁLOGO PÚBLICO
  // =========================================================

  app.get(
    "/api/products",
    {
      schema: {
        tags: ["Products"],
        summary: "Obtener productos activos",
        description:
          "Devuelve todos los productos activos del catálogo.",
      },
    },
    getProductsController
  );

  // =========================================================
  // PRODUCTOS - VISTA ADMINISTRATIVA
  // Los usuarios con products.view pueden consultar.
  // =========================================================

  app.get(
    "/api/products/admin",
    {
      schema: {
        tags: ["Products"],
        summary:
          "Obtener todos los productos para administración",
        description:
          "Devuelve todos los productos, activos e inactivos, para el panel administrativo.",
      },

      preHandler: [
        app.authenticate,
        app.requirePermission(
          "products.view"
        ),
      ],
    },
    getAllProductsController
  );

 
  app.post<{
    Params: {
      id: string;
    };
  }>(
    "/api/products/:id/images",
    {
      preHandler: [
        app.authenticate,
        app.requirePermission("products.manage"),
      ],
    },
    uploadProductImageController
  );


  // =========================================================
  // PRODUCTO POR ID
  // =========================================================

  app.get(
    "/api/products/:id",
    {
      schema: {
        tags: ["Products"],
        summary: "Obtener producto por ID",
        description:
          "Devuelve la información de un producto específico.",
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
          },
          required: ["id"],
        },
      },
    },
    getProductByIdController
  );

  // =========================================================
  // CREAR PRODUCTO
  // Se mantiene products.manage
  // =========================================================

  app.post<{ Body: CreateProductInput }>(
    "/api/products",
    {
      schema: {
        tags: ["Products"],
        summary: "Crear producto",
        description:
          "Crea un nuevo producto en el catálogo.",
      },

      preHandler: [
        app.authenticate,
        app.requirePermission(
          "products.manage"
        ),
      ],
    },
    createProductController
  );

  // =========================================================
  // ACTUALIZAR PRODUCTO
  // SOLO ADMINISTRADOR
  // =========================================================

  app.put<{
    Params: {
      id: string;
    };
    Body: CreateProductInput;
  }>(
    "/api/products/:id",
    {
      schema: {
        tags: ["Products"],
        summary: "Actualizar producto",
        description:
          "Actualiza los datos de un producto existente. Solo administradores.",
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
          },
          required: ["id"],
        },
      },

      preHandler: [
        app.authenticate,
        app.requireAdmin(),
      ],
    },
    updateProductController
  );

  // =========================================================
  // ACTIVAR / DESACTIVAR PRODUCTO
  // SOLO ADMINISTRADOR
  // =========================================================

  app.patch<{
    Params: {
      id: string;
    };
    Body: {
      active: boolean;
    };
  }>(
    "/api/products/:id/status",
    {
      schema: {
        tags: ["Products"],
        summary:
          "Activar o desactivar producto",
        description:
          "Cambia únicamente el estado activo de un producto. Solo administradores.",
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
          },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            active: {
              type: "boolean",
            },
          },
          required: ["active"],
          additionalProperties: false,
        },
      },

      preHandler: [
        app.authenticate,
        app.requireAdmin(),
      ],
    },
    updateProductStatusController
  );

  // =========================================================
  // ELIMINAR PRODUCTO
  // SOLO ADMINISTRADOR
  // =========================================================

  app.delete<{
    Params: {
      id: string;
    };
  }>(
    "/api/products/:id",
    {
      schema: {
        tags: ["Products"],
        summary: "Eliminar producto",
        description:
          "Elimina definitivamente un producto del catálogo. Solo administradores.",
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
          },
          required: ["id"],
        },
      },

      preHandler: [
        app.authenticate,
        app.requireAdmin(),
      ],
    },
    deleteProductController
  );
}