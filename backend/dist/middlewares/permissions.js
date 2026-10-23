"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = isAdmin;
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const authenticatedSupabase_1 = require("../config/authenticatedSupabase");
async function isAdmin(request) {
    const authenticatedSupabase = (0, authenticatedSupabase_1.getAuthenticatedSupabase)(request);
    if (!authenticatedSupabase) {
        return false;
    }
    const { data, error } = await authenticatedSupabase.rpc("is_admin");
    if (error) {
        request.log.error({
            error: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        }, "Error verificando administrador");
        return false;
    }
    return Boolean(data);
}
function requireAdmin() {
    return async (request, reply) => {
        if (!request.authenticatedUser) {
            return reply.status(401).send({
                success: false,
                statusCode: 401,
                error: "Unauthorized",
                message: "Debes iniciar sesión.",
            });
        }
        const admin = await isAdmin(request);
        if (!admin) {
            return reply.status(403).send({
                success: false,
                statusCode: 403,
                error: "Forbidden",
                message: "No tienes permisos de administrador.",
            });
        }
    };
}
function requirePermission(permission) {
    return async (request, reply) => {
        if (!request.authenticatedUser) {
            return reply.status(401).send({
                success: false,
                statusCode: 401,
                error: "Unauthorized",
                message: "Debes iniciar sesión.",
            });
        }
        const authenticatedSupabase = (0, authenticatedSupabase_1.getAuthenticatedSupabase)(request);
        if (!authenticatedSupabase) {
            return reply.status(401).send({
                success: false,
                statusCode: 401,
                error: "Unauthorized",
                message: "No se pudo obtener el token de autenticación.",
            });
        }
        const admin = await isAdmin(request);
        if (admin) {
            return;
        }
        const { data, error } = await authenticatedSupabase.rpc("has_permission", {
            p_permission: permission,
        });
        if (error) {
            request.log.error({
                error: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
                permission,
                userId: request.authenticatedUser.id,
            }, "Error verificando permiso");
            return reply.status(500).send({
                success: false,
                statusCode: 500,
                error: "PermissionCheckError",
                message: "No se pudo verificar el permiso.",
            });
        }
        if (!data) {
            return reply.status(403).send({
                success: false,
                statusCode: 403,
                error: "Forbidden",
                message: "No tienes permisos para realizar esta acción.",
                permission,
            });
        }
    };
}
function requireAnyPermission(permissions) {
    return async (request, reply) => {
        if (!request.authenticatedUser) {
            return reply.status(401).send({
                success: false,
                statusCode: 401,
                error: "Unauthorized",
                message: "Debes iniciar sesión.",
            });
        }
        const authenticatedSupabase = (0, authenticatedSupabase_1.getAuthenticatedSupabase)(request);
        if (!authenticatedSupabase) {
            return reply.status(401).send({
                success: false,
                statusCode: 401,
                error: "Unauthorized",
                message: "No se pudo obtener el token de autenticación.",
            });
        }
        const admin = await isAdmin(request);
        if (admin) {
            return;
        }
        for (const permission of permissions) {
            const { data, error } = await authenticatedSupabase.rpc("has_permission", {
                p_permission: permission,
            });
            if (error) {
                request.log.error({
                    error: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint,
                    permission,
                    userId: request.authenticatedUser.id,
                }, "Error verificando permisos alternativos");
                return reply.status(500).send({
                    success: false,
                    statusCode: 500,
                    error: "PermissionCheckError",
                    message: "No se pudieron verificar los permisos.",
                });
            }
            if (data) {
                return;
            }
        }
        return reply.status(403).send({
            success: false,
            statusCode: 403,
            error: "Forbidden",
            message: "No tienes permisos para consultar estos pedidos.",
            permissions,
        });
    };
}
exports.default = (0, fastify_plugin_1.default)(async (app) => {
    app.decorate("requireAdmin", requireAdmin);
    app.decorate("requirePermission", requirePermission);
    app.decorate("requireAnyPermission", requireAnyPermission);
}, {
    name: "permissions",
    fastify: "5.x",
    dependencies: ["authentication"],
});
