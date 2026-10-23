"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
function normalizeError(error) {
    if (error instanceof Error) {
        const fastifyError = error;
        return {
            name: fastifyError.name,
            message: fastifyError.message,
            statusCode: fastifyError.statusCode,
            validation: fastifyError.validation,
        };
    }
    if (typeof error === "object" && error !== null) {
        const value = error;
        return {
            name: typeof value.name === "string"
                ? value.name
                : undefined,
            message: typeof value.message === "string"
                ? value.message
                : undefined,
            statusCode: typeof value.statusCode === "number"
                ? value.statusCode
                : undefined,
            validation: value.validation,
        };
    }
    return {
        name: "UnknownError",
        message: String(error),
    };
}
exports.default = (0, fastify_plugin_1.default)(async (app) => {
    app.setErrorHandler((error, request, reply) => {
        const normalized = normalizeError(error);
        const statusCode = typeof normalized.statusCode === "number" &&
            normalized.statusCode >= 400
            ? normalized.statusCode
            : 500;
        /*
         * Errores controlados:
         * validación, autenticación, permisos,
         * recursos inexistentes, etc.
         */
        if (statusCode < 500 ||
            normalized.validation) {
            request.log.warn({
                statusCode,
                error: normalized.message,
                method: request.method,
                url: request.url,
            }, "Request error");
            return reply.status(statusCode).send({
                success: false,
                statusCode,
                error: normalized.name ||
                    "RequestError",
                message: normalized.message ||
                    "La solicitud no pudo ser procesada.",
            });
        }
        /*
         * Error inesperado.
         *
         * Registramos todos los detalles
         * en el servidor, pero no los enviamos
         * al cliente.
         */
        request.log.error({
            err: error,
            method: request.method,
            url: request.url,
        }, "Unhandled server error");
        return reply.status(500).send({
            success: false,
            statusCode: 500,
            error: "Internal Server Error",
            message: "Ha ocurrido un error interno en el servidor.",
        });
    });
    app.setNotFoundHandler((request, reply) => {
        return reply.status(404).send({
            success: false,
            statusCode: 404,
            error: "Not Found",
            message: `La ruta ${request.method} ${request.url} no existe.`,
        });
    });
}, {
    name: "error-handler",
    fastify: "5.x",
});
