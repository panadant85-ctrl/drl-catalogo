"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleRoutes = roleRoutes;
const roleController_1 = require("../controllers/roles/roleController");
async function roleRoutes(app) {
    app.get("/api/roles", {
        preHandler: [
            app.authenticate,
            app.requirePermission("roles.view"),
        ],
    }, roleController_1.getRolesController);
    app.get("/api/roles/:id", {
        preHandler: [
            app.authenticate,
            app.requirePermission("roles.view"),
        ],
    }, roleController_1.getRoleByIdController);
    app.post("/api/roles", {
        preHandler: [
            app.authenticate,
            app.requirePermission("roles.manage"),
        ],
    }, roleController_1.createRoleController);
    app.put("/api/roles/:id", {
        preHandler: [
            app.authenticate,
            app.requirePermission("roles.manage"),
        ],
    }, roleController_1.updateRoleController);
    app.delete("/api/roles/:id", {
        preHandler: [
            app.authenticate,
            app.requirePermission("roles.manage"),
        ],
    }, roleController_1.deleteRoleController);
}
