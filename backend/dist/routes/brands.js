"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = brandRoutes;
const brandController_1 = require("../controllers/brands/brandController");
async function brandRoutes(app) {
    // GET /api/brands
    app.get("/api/brands", {
        schema: {
            tags: ["Brands"],
            summary: "Obtener marcas",
            security: [{ bearerAuth: [] }],
            description: "Devuelve todas las marcas registradas.",
        },
        preHandler: [
            app.authenticate,
            app.requirePermission("brands.view"),
        ],
    }, brandController_1.listBrands);
    // GET /api/brands/:id
    app.get("/api/brands/:id", {
        schema: {
            tags: ["Brands"],
            summary: "Obtener marca por ID",
            description: "Devuelve una marca específica.",
        },
        preHandler: [
            app.authenticate,
            app.requirePermission("brands.view"),
        ],
    }, brandController_1.getBrand);
    // POST /api/brands
    app.post("/api/brands", {
        schema: {
            tags: ["Brands"],
            summary: "Crear marca",
            description: "Registra una nueva marca.",
        },
        preHandler: [
            app.authenticate,
            app.requirePermission("brands.manage"),
        ],
    }, brandController_1.createBrandController);
    // PUT /api/brands/:id
    app.put("/api/brands/:id", {
        schema: {
            tags: ["Brands"],
            summary: "Actualizar marca",
            description: "Actualiza los datos de una marca.",
        },
        preHandler: [
            app.authenticate,
            app.requirePermission("brands.manage"),
        ],
    }, brandController_1.updateBrandController);
    // LOGO /api/brands/:id
    app.post("/api/brands/:id/logo", {
        schema: {
            tags: ["Brands"],
            summary: "Subir logo de marca",
            description: "Sube el logo de una marca.",
        },
        preHandler: [
            app.authenticate,
            app.requirePermission("brands.manage"),
        ],
    }, brandController_1.uploadBrandLogoController);
    // DELETE /api/brands/:id
    app.delete("/api/brands/:id", {
        schema: {
            tags: ["Brands"],
            summary: "Eliminar marca",
            description: "Elimina definitivamente una marca.",
        },
        preHandler: [
            app.authenticate,
            app.requirePermission("brands.manage"),
        ],
    }, brandController_1.deleteBrandController);
}
