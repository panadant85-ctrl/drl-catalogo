"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supplierRoutes = supplierRoutes;
const supplierController_1 = require("../controllers/suppliers/supplierController");
async function supplierRoutes(app) {
    // GET /api/suppliers
    app.get("/api/suppliers", {
        schema: {
            tags: ["Suppliers"],
            summary: "Obtener proveedores",
            security: [{ bearerAuth: [] }],
            description: "Devuelve todos los proveedores registrados.",
        },
        preHandler: [
            app.authenticate,
            app.requirePermission("suppliers.view"),
        ],
    }, supplierController_1.getSuppliersController);
    // GET /api/suppliers/:id
    app.get("/api/suppliers/:id", {
        schema: {
            tags: ["Suppliers"],
            summary: "Obtener proveedor por ID",
            description: "Devuelve un proveedor específico.",
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
            app.requirePermission("suppliers.view"),
        ],
    }, supplierController_1.getSupplierByIdController);
    // POST /api/suppliers
    app.post("/api/suppliers", {
        schema: {
            tags: ["Suppliers"],
            summary: "Crear proveedor",
            description: "Registra un nuevo proveedor.",
        },
        preHandler: [
            app.authenticate,
            app.requirePermission("suppliers.manage"),
        ],
    }, supplierController_1.createSupplierController);
    // PUT /api/suppliers/:id
    app.put("/api/suppliers/:id", {
        schema: {
            tags: ["Suppliers"],
            summary: "Actualizar proveedor",
            description: "Actualiza los datos de un proveedor.",
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
            app.requirePermission("suppliers.manage"),
        ],
    }, supplierController_1.updateSupplierController);
    // DELETE /api/suppliers/:id
    app.delete("/api/suppliers/:id", {
        schema: {
            tags: ["Suppliers"],
            summary: "Eliminar proveedor",
            description: "Elimina definitivamente un proveedor.",
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
            app.requirePermission("suppliers.manage"),
        ],
    }, supplierController_1.deleteSupplierController);
}
