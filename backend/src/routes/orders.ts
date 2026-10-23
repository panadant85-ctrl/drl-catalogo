import type {
  FastifyInstance,
} from "fastify";

import {
  getOrdersController,
  getOrderByIdController,
  createOrderController,
  createPosOrderController,
  updateOrderStatusController,
  deleteOrderController,
} from "../controllers/orders/orderController";

import type {
  CreateOrderInput,
  UpdateOrderStatusInput,
} from "../validators/orders/orderValidator";

export async function orderRoutes(
  app: FastifyInstance
) {
  /*
   * GET /api/orders
   */
  app.get(
    "/api/orders",
    {
      schema: {
        tags: ["Orders"],
        summary: "Obtener pedidos",
        description:
          "Devuelve todos los pedidos registrados.",
      },

      preHandler: [
          app.authenticate,
          app.requireAnyPermission([
            "orders.view",
            "manager.orders.view",
          ]),
        ],
    },
    getOrdersController
  );

  /*
   * GET /api/orders/:id
   */
  app.get<{
    Params: {
      id: string;
    };
  }>(
    "/api/orders/:id",
    {
      schema: {
        tags: ["Orders"],
        summary: "Obtener pedido",
        description:
          "Devuelve un pedido junto con sus items.",
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
          app.requireAnyPermission([
            "orders.view",
            "manager.orders.view",
          ]),
        ],
    },
    getOrderByIdController
  );

  /*
   * POST /api/orders
   */
  app.post<{
    Body: CreateOrderInput;
  }>(
    "/api/orders",
    {
      schema: {
        tags: ["Orders"],
        summary: "Crear pedido",
        description:
          "Crea un pedido calculando precios y comisiones desde la base de datos.",
      },

      preHandler: [
        app.authenticate,
        app.requirePermission(
          "orders.manage"
        ),
      ],
    },
    createOrderController
  );

  /*
 * POST /api/orders/pos
 */
app.post<{
        Body: {
          customer_id: number;
          notes?: string | null;
          items: {
            product_id: number;
            quantity: number;
            variant?: string | null;
          }[];
        };
      }>(
  "/api/orders/pos",
  {
    schema: {
      tags: ["Orders"],
      summary: "Registrar venta POS",
      description:
        "Registra una venta física realizada por el rol vendedor.",
    },

    preHandler: [
      app.authenticate,
      app.requirePermission(
        "orders.create"
      ),
    ],
  },
  createPosOrderController
);

  /*
   * PATCH /api/orders/:id/status
   */
  app.patch<{
    Params: {
      id: string;
    };
    Body: UpdateOrderStatusInput;
  }>(
    "/api/orders/:id/status",
    {
      schema: {
        tags: ["Orders"],
        summary:
          "Actualizar estado del pedido",
        description:
          "Actualiza el estado de un pedido.",
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
          "orders.manage"
        ),
      ],
    },
    updateOrderStatusController
  );

  /*
   * DELETE /api/orders/:id
   */
  app.delete<{
    Params: {
      id: string;
    };
  }>(
    "/api/orders/:id",
    {
      schema: {
        tags: ["Orders"],
        summary: "Eliminar pedido",
        description:
          "Elimina un pedido y sus items asociados.",
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
          "orders.manage"
        ),
      ],
    },
    deleteOrderController
  );
}