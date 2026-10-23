"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
exports.default = (0, fastify_plugin_1.default)(async (app) => {
    await app.register(swagger_1.default, {
        openapi: {
            info: {
                title: "DRL Electronik API",
                description: "API principal del sistema ecommerce DRL Electronik",
                version: "1.0.0",
            },
            servers: [
                {
                    url: "http://localhost:4000",
                    description: "Servidor local",
                },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                    },
                },
            },
            tags: [
                {
                    name: "Auth",
                    description: "Autenticación y sesiones",
                },
                {
                    name: "Products",
                    description: "Gestión de productos",
                },
                {
                    name: "Categories",
                    description: "Categorías de productos",
                },
                {
                    name: "Customers",
                    description: "Gestión de clientes",
                },
                {
                    name: "Managers",
                    description: "Gestores comerciales",
                },
                {
                    name: "Orders",
                    description: "Pedidos y órdenes",
                },
                {
                    name: "Dashboard",
                    description: "Indicadores del sistema",
                },
                {
                    name: "Reports",
                    description: "Reportes y estadísticas",
                },
                {
                    name: "Roles",
                    description: "Roles y permisos",
                },
                {
                    name: "Settings",
                    description: "Configuración del sistema",
                },
            ],
        },
    });
    await app.register(swagger_ui_1.default, {
        routePrefix: "/docs",
    });
});
