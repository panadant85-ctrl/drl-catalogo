"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = orderRoutes;
const orderController_1 = require("../controllers/orders/orderController");
async function orderRoutes(app) {
    /*
     * GET /api/orders
     */
    app.get("/api/orders", {
        schema: {
            tags: ["Orders"],
            summary: "Obtener pedidos",
            description: "Devuelve todos los pedidos registrados.",
        },
        preHandler: [
            app.authenticate,
            app.requireAnyPermission([
                "orders.view",
                "manager.orders.view",
            ]),
        ],
    }, orderController_1.getOrdersController);
    /*
     * GET /api/orders/:id
     */
    app.get("/api/orders/:id", {
        schema: {
            tags: ["Orders"],
            summary: "Obtener pedido",
            description: "Devuelve un pedido junto con sus items.",
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
    }, orderController_1.getOrderByIdController);
    /*
     * POST /api/orders
     */
    app.post("/api/orders", {
        schema: {
            tags: ["Orders"],
            summary: "Crear pedido",
            description: "Crea un pedido calculando precios y comisiones desde la base de datos.",
        },
        preHandler: [
            app.authenticate,
            app.requirePermission("orders.manage"),
        ],
    }, orderController_1.createOrderController);
    /*
   * POST /api/orders/pos
   */
    app.post("/api/orders/pos", {
        schema: {
            tags: ["Orders"],
            summary: "Registrar venta POS",
            description: "Registra una venta física realizada por el rol vendedor.",
        },
        preHandler: [
            app.authenticate,
            app.requirePermission("orders.create"),
        ],
    }, orderController_1.createPosOrderController);
    /*
     * PATCH /api/orders/:id/status
     */
    app.patch("/api/orders/:id/status", {
        schema: {
            tags: ["Orders"],
            summary: "Actualizar estado del pedido",
            description: "Actualiza el estado de un pedido.",
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
            app.requirePermission("orders.manage"),
        ],
    }, orderController_1.updateOrderStatusController);
    /*
     * DELETE /api/orders/:id
     */
    app.delete("/api/orders/:id", {
        schema: {
            tags: ["Orders"],
            summary: "Eliminar pedido",
            description: "Elimina un pedido y sus items asociados.",
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
            app.requirePermission("orders.manage"),
        ],
    }, orderController_1.deleteOrderController);
}
