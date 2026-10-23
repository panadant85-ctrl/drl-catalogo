"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRolesController = getRolesController;
exports.getRoleByIdController = getRoleByIdController;
exports.createRoleController = createRoleController;
exports.updateRoleController = updateRoleController;
exports.deleteRoleController = deleteRoleController;
const roleValidator_1 = require("../../validators/roles/roleValidator");
const roleService_1 = require("../../services/roles/roleService");
async function getRolesController(request, reply) {
    try {
        const roles = await (0, roleService_1.getRoles)();
        return reply.send({
            success: true,
            data: roles,
        });
    }
    catch (error) {
        request.log.error(error, "Error obteniendo roles");
        return reply.status(500).send({
            success: false,
            statusCode: 500,
            error: "Internal Server Error",
            message: "No se pudieron obtener los roles.",
        });
    }
}
async function getRoleByIdController(request, reply) {
    const parsedParams = roleValidator_1.roleIdParamsSchema.safeParse(request.params);
    if (!parsedParams.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "Bad Request",
            message: parsedParams.error.issues[0]?.message ??
                "ID de rol inválido.",
        });
    }
    try {
        const role = await (0, roleService_1.getRoleById)(parsedParams.data.id);
        if (!role) {
            return reply.status(404).send({
                success: false,
                statusCode: 404,
                error: "Not Found",
                message: "El rol no existe.",
            });
        }
        return reply.send({
            success: true,
            data: role,
        });
    }
    catch (error) {
        request.log.error(error, "Error obteniendo rol");
        return reply.status(500).send({
            success: false,
            statusCode: 500,
            error: "Internal Server Error",
            message: "No se pudo obtener el rol.",
        });
    }
}
async function createRoleController(request, reply) {
    const parsedBody = roleValidator_1.createRoleSchema.safeParse(request.body);
    if (!parsedBody.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "Bad Request",
            message: parsedBody.error.issues[0]?.message ??
                "Datos del rol inválidos.",
        });
    }
    try {
        const role = await (0, roleService_1.createNewRole)(parsedBody.data);
        return reply.status(201).send({
            success: true,
            data: role,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "No se pudo crear el rol.";
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "RoleCreationError",
            message,
        });
    }
}
async function updateRoleController(request, reply) {
    const parsedParams = roleValidator_1.roleIdParamsSchema.safeParse(request.params);
    if (!parsedParams.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "Bad Request",
            message: parsedParams.error.issues[0]?.message ??
                "ID de rol inválido.",
        });
    }
    const parsedBody = roleValidator_1.updateRoleSchema.safeParse(request.body);
    if (!parsedBody.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "Bad Request",
            message: parsedBody.error.issues[0]?.message ??
                "Datos del rol inválidos.",
        });
    }
    try {
        const role = await (0, roleService_1.updateExistingRole)(parsedParams.data.id, parsedBody.data);
        return reply.send({
            success: true,
            data: role,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "No se pudo actualizar el rol.";
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "RoleUpdateError",
            message,
        });
    }
}
async function deleteRoleController(request, reply) {
    const parsedParams = roleValidator_1.roleIdParamsSchema.safeParse(request.params);
    if (!parsedParams.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "Bad Request",
            message: parsedParams.error.issues[0]?.message ??
                "ID de rol inválido.",
        });
    }
    try {
        await (0, roleService_1.removeRole)(parsedParams.data.id);
        return reply.send({
            success: true,
            message: "Rol eliminado correctamente.",
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "No se pudo eliminar el rol.";
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "RoleDeletionError",
            message,
        });
    }
}
