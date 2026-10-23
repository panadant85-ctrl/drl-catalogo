"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = categoryRoutes;
const categoryController_1 = require("../controllers/categories/categoryController");
async function categoryRoutes(app) {
    app.get("/api/categories", {
        schema: {
            tags: ["Categories"],
            summary: "Obtener categorías",
            description: "Devuelve todas las categorías registradas.",
            security: [
                {
                    bearerAuth: [],
                },
            ],
        },
        preHandler: [
            app.authenticate,
            app.requirePermission("categories.view"),
        ],
    }, categoryController_1.listCategories);
    app.get("/api/categories/:id", {
        schema: {
            tags: ["Categories"],
            summary: "Obtener categoría por ID",
            description: "Devuelve una categoría específica.",
            security: [
                {
                    bearerAuth: [],
                },
            ],
        },
        preHandler: [
            app.authenticate,
            app.requirePermission("categories.view"),
        ],
    }, categoryController_1.getCategory);
    app.post("/api/categories", {
        schema: {
            tags: ["Categories"],
            summary: "Crear categoría",
            description: "Registra una nueva categoría.",
            security: [
                {
                    bearerAuth: [],
                },
            ],
        },
        preHandler: [
            app.authenticate,
            app.requirePermission("categories.manage"),
        ],
    }, categoryController_1.createCategoryController);
    app.put("/api/categories/:id", {
        schema: {
            tags: ["Categories"],
            summary: "Actualizar categoría",
            description: "Actualiza los datos de una categoría.",
            security: [
                {
                    bearerAuth: [],
                },
            ],
        },
        preHandler: [
            app.authenticate,
            app.requirePermission("categories.manage"),
        ],
    }, categoryController_1.updateCategoryController);
    app.delete("/api/categories/:id", {
        schema: {
            tags: ["Categories"],
            summary: "Eliminar categoría",
            description: "Elimina una categoría.",
            security: [
                {
                    bearerAuth: [],
                },
            ],
        },
        preHandler: [
            app.authenticate,
            app.requirePermission("categories.manage"),
        ],
    }, categoryController_1.deleteCategoryController);
}
