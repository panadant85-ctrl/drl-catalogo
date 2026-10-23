"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = userRoutes;
const userController_1 = require("../controllers/users/userController");
async function userRoutes(app) {
    // Listar usuarios administrativos
    app.get("/api/users", {
        preHandler: [
            app.authenticate,
            app.requirePermission("users.view"),
        ],
    }, userController_1.getUsersController);
    // Crear usuario administrativo
    app.post("/api/users", {
        preHandler: [
            app.authenticate,
            app.requirePermission("users.manage"),
        ],
    }, userController_1.createUserController);
    // Obtener roles disponibles para usuarios.
    // Debe declararse antes de /:id.
    app.get("/api/users/roles", {
        preHandler: [
            app.authenticate,
            app.requirePermission("users.view"),
        ],
    }, userController_1.getUserRolesController);
    // Obtener un usuario administrativo
    app.get("/api/users/:id", {
        preHandler: [
            app.authenticate,
            app.requirePermission("users.view"),
        ],
    }, userController_1.getUserByIdController);
    // Actualizar usuario administrativo
    app.put("/api/users/:id", {
        preHandler: [
            app.authenticate,
            app.requirePermission("users.manage"),
        ],
    }, userController_1.updateUserController);
    // Actualizar estado activo/inactivo del usuario
    app.put("/api/users/:id/status", {
        preHandler: [
            app.authenticate,
            app.requirePermission("users.manage"),
        ],
    }, userController_1.updateUserStatusController);
    // Eliminar usuario administrativo
    app.delete("/api/users/:id", {
        preHandler: [
            app.authenticate,
            app.requirePermission("users.manage"),
        ],
    }, userController_1.deleteUserController);
}
