"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fastify_1 = __importDefault(require("fastify"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const products_1 = require("./routes/products");
const customers_1 = require("./routes/customers");
const auth_1 = require("./routes/auth");
const permissions_test_1 = require("./routes/permissions-test");
const orders_1 = require("./routes/orders");
const managers_1 = require("./routes/managers");
const roles_1 = require("./routes/roles");
const cart_1 = require("./routes/cart");
const suppliers_1 = require("./routes/suppliers");
const brands_1 = __importDefault(require("./routes/brands"));
const categories_1 = __importDefault(require("./routes/categories"));
const users_1 = require("./routes/users");
const security_1 = __importDefault(require("./plugins/security"));
const swagger_1 = __importDefault(require("./plugins/swagger"));
const rateLimit_1 = __importDefault(require("./plugins/rateLimit"));
const errorHandler_1 = __importDefault(require("./plugins/errorHandler"));
const auth_2 = __importDefault(require("./middlewares/auth"));
const permissions_1 = __importDefault(require("./middlewares/permissions"));
const env_1 = require("./config/env");
const app = (0, fastify_1.default)({
    logger: true,
});
async function start() {
    await app.register(security_1.default);
    await app.register(rateLimit_1.default);
    await app.register(swagger_1.default);
    await app.register(errorHandler_1.default);
    await app.register(auth_2.default);
    await app.register(permissions_1.default);
    await app.register(users_1.userRoutes);
    await app.register(multipart_1.default, {
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    });
    await app.register(auth_1.authRoutes);
    await app.register(permissions_test_1.permissionsTestRoutes);
    await app.register(products_1.productRoutes);
    await app.register(customers_1.customerRoutes);
    await app.register(orders_1.orderRoutes);
    await app.register(cart_1.cartRoutes);
    await app.register(managers_1.managerRoutes);
    await app.register(roles_1.roleRoutes);
    await app.register(suppliers_1.supplierRoutes);
    await app.register(brands_1.default);
    await app.register(categories_1.default);
    app.get("/api/health", {
        config: {
            rateLimit: false,
        },
    }, async () => {
        return {
            success: true,
            service: "DRL Electronik API",
            status: "online",
            timestamp: new Date().toISOString(),
        };
    });
    try {
        await app.listen({
            port: env_1.env.PORT,
            host: "0.0.0.0",
        });
        console.log("======================================");
        console.log(" DRL ELECTRONIK API");
        console.log(` Backend: http://localhost:${env_1.env.PORT}`);
        console.log(` Health:  http://localhost:${env_1.env.PORT}/api/health`);
        console.log(` Swagger: http://localhost:${env_1.env.PORT}/docs`);
        console.log("======================================");
    }
    catch (error) {
        app.log.error(error);
        process.exit(1);
    }
}
start();
