"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const supabase_1 = require("../config/supabase");
async function authenticate(request, reply) {
    const authorization = request.headers.authorization;
    if (!authorization) {
        return reply.status(401).send({
            success: false,
            statusCode: 401,
            error: "Unauthorized",
            message: "Falta el token de autenticación.",
        });
    }
    const [scheme, token] = authorization.split(" ");
    if (scheme?.toLowerCase() !== "bearer" ||
        !token) {
        return reply.status(401).send({
            success: false,
            statusCode: 401,
            error: "Unauthorized",
            message: "El formato del token no es válido.",
        });
    }
    const { data: { user }, error, } = await supabase_1.supabase.auth.getUser(token);
    if (error || !user) {
        request.log.warn({
            error: error?.message,
            method: request.method,
            url: request.url,
        }, "Invalid authentication token");
        return reply.status(401).send({
            success: false,
            statusCode: 401,
            error: "Unauthorized",
            message: "La sesión no es válida o ha expirado.",
        });
    }
    request.authenticatedUser = {
        id: user.id,
        email: user.email ?? null,
    };
}
exports.default = (0, fastify_plugin_1.default)(async (app) => {
    app.decorateRequest("authenticatedUser", null);
    app.decorate("authenticate", authenticate);
}, {
    name: "authentication",
    fastify: "5.x",
});
