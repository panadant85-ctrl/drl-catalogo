"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoutes = productRoutes;
const productController_1 = require("../controllers/products/productController");
const productImageController_1 = require("../controllers/products/productImageController");
async function productRoutes(app) {
    // =========================================================
    // PRODUCTOS ACTIVOS - CATÁLOGO PÚBLICO
    // =========================================================
    app.get("/api/products", {
        schema: {
            tags: ["Products"],
            summary: "Obtener productos activos",
            description: "Devuelve todos los productos activos del catálogo.",
        },
    }, productController_1.getProductsController);
    // =========================================================
    // PRODUCTOS - VISTA ADMINISTRATIVA
    // Los usuarios con products.view pueden consultar.
    // =========================================================
    app.get("/api/products/admin", {
        schema: {
            tags: ["Products"],
            summary: "Obtener todos los productos para administración",
            description: "Devuelve todos los productos, activos e inactivos, para el panel administrativo.",
        },
        preHandler: [
            app.authenticate,
            app.requirePermission("products.view"),
        ],
    }, productController_1.getAllProductsController);
    app.post("/api/products/:id/images", {
        preHandler: [
            app.authenticate,
            app.requirePermission("products.manage"),
        ],
    }, productImageController_1.uploadProductImageController);
    // =========================================================
    // PRODUCTO POR ID
    // =========================================================
    app.get("/api/products/:id", {
        schema: {
            tags: ["Products"],
            summary: "Obtener producto por ID",
            description: "Devuelve la información de un producto específico.",
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
    }, productController_1.getProductByIdController);
    // =========================================================
    // CREAR PRODUCTO
    // Se mantiene products.manage
    // =========================================================
    app.post("/api/products", {
        schema: {
            tags: ["Products"],
            summary: "Crear producto",
            description: "Crea un nuevo producto en el catálogo.",
        },
        preHandler: [
            app.authenticate,
            app.requirePermission("products.manage"),
        ],
    }, productController_1.createProductController);
    // =========================================================
    // ACTUALIZAR PRODUCTO
    // SOLO ADMINISTRADOR
    // =========================================================
    app.put("/api/products/:id", {
        schema: {
            tags: ["Products"],
            summary: "Actualizar producto",
            description: "Actualiza los datos de un producto existente. Solo administradores.",
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
    }, productController_1.updateProductController);
    // =========================================================
    // ACTIVAR / DESACTIVAR PRODUCTO
    // SOLO ADMINISTRADOR
    // =========================================================
    app.patch("/api/products/:id/status", {
        schema: {
            tags: ["Products"],
            summary: "Activar o desactivar producto",
            description: "Cambia únicamente el estado activo de un producto. Solo administradores.",
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
    }, productController_1.updateProductStatusController);
    // =========================================================
    // ELIMINAR PRODUCTO
    // SOLO ADMINISTRADOR
    // =========================================================
    app.delete("/api/products/:id", {
        schema: {
            tags: ["Products"],
            summary: "Eliminar producto",
            description: "Elimina definitivamente un producto del catálogo. Solo administradores.",
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
    }, productController_1.deleteProductController);
}
