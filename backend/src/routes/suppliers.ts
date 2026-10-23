import type { FastifyInstance } from "fastify";

import {
  getSuppliersController,
  getSupplierByIdController,
  createSupplierController,
  updateSupplierController,
  deleteSupplierController,
} from "../controllers/suppliers/supplierController";

import type {
  CreateSupplierInput,
  UpdateSupplierInput,
} from "../validators/suppliers/supplierValidator";

export async function supplierRoutes(
  app: FastifyInstance
) {
  // GET /api/suppliers
  app.get(
    "/api/suppliers",
    {
      schema: {
        tags: ["Suppliers"],
        summary: "Obtener proveedores",
        security: [{ bearerAuth: [] }],
        description:
          "Devuelve todos los proveedores registrados.",
      },

      preHandler: [
        app.authenticate,
        app.requirePermission(
          "suppliers.view"
        ),
      ],
    },
    getSuppliersController
  );

  // GET /api/suppliers/:id
  app.get<{
    Params: {
      id: string;
    };
  }>(
    "/api/suppliers/:id",
    {
      schema: {
        tags: ["Suppliers"],
        summary: "Obtener proveedor por ID",
        description:
          "Devuelve un proveedor específico.",
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
        app.requirePermission(
          "suppliers.view"
        ),
      ],
    },
    getSupplierByIdController
  );

  // POST /api/suppliers
  app.post<{
    Body: CreateSupplierInput;
  }>(
    "/api/suppliers",
    {
      schema: {
        tags: ["Suppliers"],
        summary: "Crear proveedor",
        description:
          "Registra un nuevo proveedor.",
      },

      preHandler: [
        app.authenticate,
        app.requirePermission(
          "suppliers.manage"
        ),
      ],
    },
    createSupplierController
  );

  // PUT /api/suppliers/:id
  app.put<{
    Params: {
      id: string;
    };
    Body: UpdateSupplierInput;
  }>(
    "/api/suppliers/:id",
    {
      schema: {
        tags: ["Suppliers"],
        summary: "Actualizar proveedor",
        description:
          "Actualiza los datos de un proveedor.",
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
        app.requirePermission(
          "suppliers.manage"
        ),
      ],
    },
    updateSupplierController
  );

  // DELETE /api/suppliers/:id
  app.delete<{
    Params: {
      id: string;
    };
  }>(
    "/api/suppliers/:id",
    {
      schema: {
        tags: ["Suppliers"],
        summary: "Eliminar proveedor",
        description:
          "Elimina definitivamente un proveedor.",
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
        app.requirePermission(
          "suppliers.manage"
        ),
      ],
    },
    deleteSupplierController
  );
}
