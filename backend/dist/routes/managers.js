"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.managerRoutes = managerRoutes;
const managerController_1 = require("../controllers/managers/managerController");
async function managerRoutes(app) {
    app.get("/api/managers", {
        preHandler: [
            app.authenticate,
            app.requirePermission("managers.view"),
        ],
    }, managerController_1.getManagersController);
    app.get("/api/managers/me", {
        preHandler: [app.authenticate],
    }, managerController_1.getMyManagerProfileController);
    app.get("/api/managers/me/customers", {
        preHandler: [app.authenticate],
    }, managerController_1.getMyManagerCustomersController);
    app.get("/api/managers/me/customers/:customerId/orders", {
        preHandler: [app.authenticate],
    }, managerController_1.getMyManagerCustomerOrdersController);
    app.get("/api/managers/:id", {
        preHandler: [
            app.authenticate,
            app.requirePermission("managers.view"),
        ],
    }, managerController_1.getManagerByIdController);
    app.post("/api/managers", {
        preHandler: [
            app.authenticate,
            app.requirePermission("managers.manage"),
        ],
    }, managerController_1.createManagerController);
    app.put("/api/managers/:id", {
        preHandler: [
            app.authenticate,
            app.requirePermission("managers.manage"),
        ],
    }, managerController_1.updateManagerController);
    app.delete("/api/managers/:id", {
        preHandler: [
            app.authenticate,
            app.requirePermission("managers.manage"),
        ],
    }, managerController_1.deleteManagerController);
}
