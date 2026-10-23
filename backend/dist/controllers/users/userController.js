"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersController = getUsersController;
exports.getUserByIdController = getUserByIdController;
exports.getUserRolesController = getUserRolesController;
exports.getUserRoleController = getUserRoleController;
exports.createUserController = createUserController;
exports.updateUserController = updateUserController;
exports.deleteUserController = deleteUserController;
exports.updateUserStatusController = updateUserStatusController;
const userService_1 = require("../../services/users/userService");
const userValidator_1 = require("../../validators/users/userValidator");
async function getUsersController(_request, reply) {
    try {
        const users = await (0, userService_1.getAdminUsers)();
        return reply.send({
            success: true,
            data: users,
        });
    }
    catch (error) {
        console.error("Error obteniendo usuarios administrativos:", error);
        return reply.status(500).send({
            success: false,
            message: "No se pudieron obtener los usuarios.",
        });
    }
}
async function getUserByIdController(request, reply) {
    try {
        const { id } = request.params;
        const user = await (0, userService_1.getAdminUserById)(id);
        return reply.send({
            success: true,
            data: user,
        });
    }
    catch (error) {
        console.error("Error obteniendo usuario administrativo:", error);
        if (error instanceof Error &&
            error.message ===
                "Usuario no encontrado.") {
            return reply.status(404).send({
                success: false,
                message: "Usuario no encontrado.",
            });
        }
        return reply.status(500).send({
            success: false,
            message: "No se pudo obtener el usuario.",
        });
    }
}
async function getUserRolesController(_request, reply) {
    try {
        const roles = await (0, userService_1.getAvailableRoles)();
        return reply.send({
            success: true,
            data: roles,
        });
    }
    catch (error) {
        console.error("Error obteniendo roles disponibles:", error);
        return reply.status(500).send({
            success: false,
            message: "No se pudieron obtener los roles.",
        });
    }
}
async function getUserRoleController(request, reply) {
    try {
        const { id } = request.params;
        const role = await (0, userService_1.getUserRole)(id);
        return reply.send({
            success: true,
            data: role,
        });
    }
    catch (error) {
        console.error("Error obteniendo rol del usuario:", error);
        return reply.status(500).send({
            success: false,
            message: "No se pudo obtener el rol del usuario.",
        });
    }
}
async function createUserController(request, reply) {
    try {
        const validation = userValidator_1.createUserSchema.safeParse(request.body);
        if (!validation.success) {
            return reply.status(400).send({
                success: false,
                message: "Los datos del usuario no son válidos.",
                errors: validation.error.flatten(),
            });
        }
        const user = await (0, userService_1.createAdminUser)(validation.data);
        return reply.status(201).send({
            success: true,
            message: "Usuario creado correctamente.",
            data: user,
        });
    }
    catch (error) {
        console.error("Error creando usuario administrativo:", error);
        const message = error instanceof Error
            ? error.message
            : "No se pudo crear el usuario.";
        if (message ===
            "El rol seleccionado no existe." ||
            message ===
                "El rol seleccionado está inactivo." ||
            message ===
                "No se pudo asignar el rol al usuario. El usuario no fue creado.") {
            return reply.status(400).send({
                success: false,
                message,
            });
        }
        if (message
            .toLowerCase()
            .includes("already registered") ||
            message
                .toLowerCase()
                .includes("already exists")) {
            return reply.status(409).send({
                success: false,
                message: "Ya existe un usuario con ese correo.",
            });
        }
        return reply.status(500).send({
            success: false,
            message: "No se pudo crear el usuario.",
        });
    }
}
async function updateUserController(request, reply) {
    try {
        const { id } = request.params;
        const validation = userValidator_1.updateUserSchema.safeParse(request.body);
        if (!validation.success) {
            return reply.status(400).send({
                success: false,
                message: "Los datos del usuario no son válidos.",
                errors: validation.error.flatten(),
            });
        }
        const user = await (0, userService_1.updateAdminUser)(id, validation.data);
        return reply.send({
            success: true,
            message: "Usuario actualizado correctamente.",
            data: user,
        });
    }
    catch (error) {
        console.error("Error actualizando usuario administrativo:", error);
        const message = error instanceof Error
            ? error.message
            : "No se pudo actualizar el usuario.";
        if (message ===
            "Usuario no encontrado.") {
            return reply.status(404).send({
                success: false,
                message,
            });
        }
        if (message ===
            "El rol seleccionado no existe." ||
            message ===
                "El rol seleccionado está inactivo.") {
            return reply.status(400).send({
                success: false,
                message,
            });
        }
        return reply.status(500).send({
            success: false,
            message: "No se pudo actualizar el usuario.",
        });
    }
}
async function deleteUserController(request, reply) {
    try {
        const { id } = request.params;
        await (0, userService_1.deleteAdminUser)(id);
        return reply.send({
            success: true,
            message: "Usuario eliminado correctamente.",
        });
    }
    catch (error) {
        console.error("Error eliminando usuario administrativo:", error);
        const message = error instanceof Error
            ? error.message
            : "No se pudo eliminar el usuario.";
        if (message ===
            "Usuario no encontrado.") {
            return reply.status(404).send({
                success: false,
                message,
            });
        }
        if (message ===
            "Los usuarios con rol admin no pueden eliminarse desde este módulo.") {
            return reply.status(403).send({
                success: false,
                message,
            });
        }
        if (message ===
            "No se pudo eliminar el usuario.") {
            return reply.status(500).send({
                success: false,
                message,
            });
        }
        return reply.status(500).send({
            success: false,
            message: "No se pudo eliminar el usuario.",
        });
    }
}
async function updateUserStatusController(request, reply) {
    try {
        const { id } = userValidator_1.userIdParamsSchema.parse(request.params);
        const body = request.body;
        if (typeof body.active !== "boolean") {
            return reply.status(400).send({
                message: "El estado activo debe ser verdadero o falso.",
            });
        }
        const user = await (0, userService_1.updateAdminUserStatus)(id, body.active);
        return reply.send({
            message: body.active
                ? "Usuario activado correctamente."
                : "Usuario desactivado correctamente.",
            data: user,
        });
    }
    catch (error) {
        console.error("Error actualizando el estado del usuario:", error);
        if (error instanceof Error &&
            error.message ===
                "Usuario no encontrado.") {
            return reply.status(404).send({
                message: error.message,
            });
        }
        if (error instanceof Error &&
            error.message.includes("no puede desactivarse")) {
            return reply.status(403).send({
                message: error.message,
            });
        }
        return reply.status(500).send({
            message: error instanceof Error
                ? error.message
                : "No se pudo actualizar el estado del usuario.",
        });
    }
}
