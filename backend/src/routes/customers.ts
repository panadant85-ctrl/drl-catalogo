import type { FastifyInstance } from "fastify";

import {
  getCustomersController,
  getCustomerByIdController,
  createCustomerController,
  updateCustomerController,
  deleteCustomerController,
  changeCustomerPasswordController,
} from "../controllers/customers/customerController";

import {
  getCustomerDetailsController,
} from "../controllers/customers/customerDetailsController";

import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../validators/customers/customerValidator";

export async function customerRoutes(
  app: FastifyInstance
) {
  // GET /api/customers
  app.get(
    "/api/customers",
    {
      schema: {
        tags: ["Customers"],
        summary: "Obtener clientes",
        description:
          "Devuelve todos los clientes registrados.",
      },

      preHandler: [
        app.authenticate,
        app.requirePermission(
          "customers.view"
        ),
      ],
    },
    getCustomersController
  );

  // GET /api/customers/:id
    app.get<{
        Params: {
            id: string;
        };
        }>(
        "/api/customers/:id",
        {
            schema: {
            tags: ["Customers"],
            summary: "Obtener cliente por ID",
            description:
                "Devuelve un cliente específico.",
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
                "customers.view"
            ),
            ],
        },
        getCustomerByIdController
        );

  // POST /api/customers
  app.post<{
    Body: CreateCustomerInput;
  }>(
    "/api/customers",
    {
      schema: {
        tags: ["Customers"],
        summary: "Crear cliente",
        description:
          "Registra un nuevo cliente.",
      },

      preHandler: [
        app.authenticate,
        app.requirePermission(
          "customers.create"
        ),
      ],
    },
    createCustomerController
  );

  // PUT /api/customers/:id
  app.put<{
    Params: {
      id: string;
    };
    Body: UpdateCustomerInput;
   }>(
    "/api/customers/:id",
    {
      schema: {
        tags: ["Customers"],
        summary: "Actualizar cliente",
        description:
          "Actualiza los datos de un cliente.",
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
          "customers.update"
        ),
      ],
    },
    updateCustomerController
  );

  
  // PATCH /api/customers/:id/password
  app.patch<{
    Params: {
      id: string;
    };
    Body: {
      password: string;
    };
  }>(
    "/api/customers/:id/password",
    {
      schema: {
        tags: ["Customers"],
        summary: "Cambiar contraseña de cliente",
        description:
          "Actualiza la contraseña de la cuenta asociada al cliente.",
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            password: {
              type: "string",
              minLength: 8,
            },
          },
          required: ["password"],
          additionalProperties: false,
        },
      },
      preHandler: [
        app.authenticate,
        app.requirePermission("customers.update"),
      ],
    },
    changeCustomerPasswordController
  );

    // DELETE /api/customers/:id
    app.delete<{
        Params: {
        id: string;
        };
    }>(
        "/api/customers/:id",
        {
        schema: {
            tags: ["Customers"],
            summary: "Eliminar cliente",
            description:
            "Elimina definitivamente un cliente.",
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
            "customers.delete"
            ),
        ],
        },
        deleteCustomerController
    );
// GET /api/customers/:id/details
  app.get<{
    Params: {
      id: string;
    };
  }>(
    "/api/customers/:id/details",
    {
      schema: {
        tags: ["Customers"],
        summary:
          "Obtener detalle completo del cliente",
        description:
          "Devuelve el cliente, resumen de compras, pedidos, productos comprados y evolución de compras.",
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
          "customers.view"
        ),
      ],
    },
    getCustomerDetailsController
  );

}


  