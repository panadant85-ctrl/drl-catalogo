"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRoutes = cartRoutes;
const cartController_1 = require("../controllers/cart/cartController");
async function cartRoutes(app) {
    app.get("/api/cart", {
        preHandler: [
            app.authenticate,
        ],
    }, cartController_1.getCartController);
    app.post("/api/cart", {
        preHandler: [
            app.authenticate,
        ],
    }, cartController_1.addCartItemController);
    app.patch("/api/cart", {
        preHandler: [
            app.authenticate,
        ],
    }, cartController_1.updateCartItemController);
    app.delete("/api/cart", {
        preHandler: [
            app.authenticate,
        ],
    }, cartController_1.removeCartItemController);
    app.delete("/api/cart/all", {
        preHandler: [
            app.authenticate,
        ],
    }, cartController_1.clearCartController);
}
