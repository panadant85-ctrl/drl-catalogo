"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
exports.default = (0, fastify_plugin_1.default)(async (app) => {
    await app.register(rate_limit_1.default, {
        max: 120,
        timeWindow: "1 minute",
        errorResponseBuilder: (_request, context) => {
            return {
                success: false,
                error: "Too Many Requests",
                message: `Demasiadas solicitudes. Intenta nuevamente en ${context.after}.`,
                retryAfter: context.after,
            };
        },
    });
}, {
    name: "rate-limit",
    fastify: "5.x",
});
