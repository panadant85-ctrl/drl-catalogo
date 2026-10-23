"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRoutes = customerRoutes;
const customerController_1 = require("../controllers/customers/customerController");
const customerDetailsController_1 = require("../controllers/customers/customerDetailsController");
async function customerRoutes(app) {
    // GET /api/customers
    app.get("/api/customers", {
        schema: {
            tags: ["Customers"],
            summary: "Obtener clientes",
            description: "Devuelve todos los clientes registrados.",
        },
        preHandler: [
            app.authenticate,
            app.requirePermission("customers.view"),
        ],
    }, customerController_1.getCustomersController);
    // GET /api/customers/:id
    app.get("/api/customers/:id", {
        schema: {
            tags: ["Customers"],
            summary: "Obtener cliente por ID",
            description: "Devuelve un cliente específico.",
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
            app.requirePermission("customers.view"),
        ],
    }, customerController_1.getCustomerByIdController);
    // POST /api/customers
    app.post("/api/customers", {
        schema: {
            tags: ["Customers"],
            summary: "Crear cliente",
            description: "Registra un nuevo cliente.",
        },
        preHandler: [
            app.authenticate,
            app.requirePermission("customers.create"),
        ],
    }, customerController_1.createCustomerController);
    // PUT /api/customers/:id
    app.put("/api/customers/:id", {
        schema: {
            tags: ["Customers"],
            summary: "Actualizar cliente",
            description: "Actualiza los datos de un cliente.",
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
            app.requirePermission("customers.update"),
        ],
    }, customerController_1.updateCustomerController);
    // PATCH /api/customers/:id/password
    app.patch("/api/customers/:id/password", {
        schema: {
            tags: ["Customers"],
            summary: "Cambiar contraseña de cliente",
            description: "Actualiza la contraseña de la cuenta asociada al cliente.",
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
    }, customerController_1.changeCustomerPasswordController);
    // DELETE /api/customers/:id
    app.delete("/api/customers/:id", {
        schema: {
            tags: ["Customers"],
            summary: "Eliminar cliente",
            description: "Elimina definitivamente un cliente.",
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
            app.requirePermission("customers.delete"),
        ],
    }, customerController_1.deleteCustomerController);
    // GET /api/customers/:id/details
    app.get("/api/customers/:id/details", {
        schema: {
            tags: ["Customers"],
            summary: "Obtener detalle completo del cliente",
            description: "Devuelve el cliente, resumen de compras, pedidos, productos comprados y evolución de compras.",
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
            app.requirePermission("customers.view"),
        ],
    }, customerDetailsController_1.getCustomerDetailsController);
}
