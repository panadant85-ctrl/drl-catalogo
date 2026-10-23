"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getManagersController = getManagersController;
exports.getMyManagerProfileController = getMyManagerProfileController;
exports.getMyManagerCustomerOrdersController = getMyManagerCustomerOrdersController;
exports.getManagerByIdController = getManagerByIdController;
exports.createManagerController = createManagerController;
exports.updateManagerController = updateManagerController;
exports.deleteManagerController = deleteManagerController;
exports.getMyManagerCustomersController = getMyManagerCustomersController;
const managerValidator_1 = require("../../validators/managers/managerValidator");
const managerService_1 = require("../../services/managers/managerService");
const supabase_1 = require("../../config/supabase");
const customerService_1 = require("../../services/customers/customerService");
const orderService_1 = require("../../services/orders/orderService");
async function getManagersController(request, reply) {
    const managers = await (0, managerService_1.getManagers)();
    return reply.send({
        success: true,
        data: managers,
    });
}
async function getMyManagerProfileController(request, reply) {
    const authUserId = request.authenticatedUser?.id;
    if (!authUserId) {
        return reply.status(401).send({
            success: false,
            statusCode: 401,
            error: "Unauthorized",
            message: "No se pudo identificar al usuario.",
        });
    }
    const { data: userRole, error: userRoleError, } = await supabase_1.supabaseAdmin
        .from("user_roles")
        .select(`
          roles (
            code,
            active
          )
        `)
        .eq("user_id", authUserId)
        .maybeSingle();
    if (userRoleError) {
        request.log.error(userRoleError, "Error verificando el rol del gestor");
        return reply.status(500).send({
            success: false,
            statusCode: 500,
            error: "RoleCheckError",
            message: "No se pudo verificar el rol del usuario.",
        });
    }
    const role = Array.isArray(userRole?.roles)
        ? userRole.roles[0] ?? null
        : userRole?.roles ?? null;
    if (role?.code !== "manager" || !role.active) {
        return reply.status(403).send({
            success: false,
            statusCode: 403,
            error: "Forbidden",
            message: "No tienes permiso para acceder al perfil de gestor.",
        });
    }
    const manager = await (0, managerService_1.getManagerByAuthUserId)(authUserId);
    if (!manager) {
        return reply.status(404).send({
            success: false,
            statusCode: 404,
            error: "Not Found",
            message: "No existe un perfil de gestor asociado a esta cuenta.",
        });
    }
    // Bloquear el acceso si la cuenta del gestor está inactiva.
    if (manager.active !== true) {
        return reply.status(403).send({
            success: false,
            statusCode: 403,
            error: "ManagerInactive",
            message: "Tu cuenta de gestor está inactiva. Contacta con el administrador.",
        });
    }
    return reply.send({
        success: true,
        data: manager,
    });
}
async function getMyManagerCustomerOrdersController(request, reply) {
    const authUserId = request.authenticatedUser?.id;
    if (!authUserId) {
        return reply.status(401).send({
            success: false,
            statusCode: 401,
            error: "Unauthorized",
            message: "No se pudo identificar al usuario.",
        });
    }
    const customerId = Number(request.params.customerId);
    if (!Number.isSafeInteger(customerId) ||
        customerId <= 0) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "El ID del cliente no es válido.",
        });
    }
    const { data: userRole, error: userRoleError } = await supabase_1.supabaseAdmin
        .from("user_roles")
        .select(`
        roles (
          code,
          active
        )
      `)
        .eq("user_id", authUserId)
        .maybeSingle();
    if (userRoleError) {
        request.log.error(userRoleError, "Error verificando el rol del gestor");
        return reply.status(500).send({
            success: false,
            statusCode: 500,
            error: "RoleCheckError",
            message: "No se pudo verificar el rol del usuario.",
        });
    }
    const role = Array.isArray(userRole?.roles)
        ? userRole.roles[0] ?? null
        : userRole?.roles ?? null;
    if (role?.code !== "manager" || !role.active) {
        return reply.status(403).send({
            success: false,
            statusCode: 403,
            error: "Forbidden",
            message: "No tienes permiso para consultar estos pedidos.",
        });
    }
    try {
        const manager = await (0, managerService_1.getManagerByAuthUserId)(authUserId);
        if (!manager) {
            return reply.status(404).send({
                success: false,
                statusCode: 404,
                error: "Not Found",
                message: "No existe un perfil de gestor asociado a esta cuenta.",
            });
        }
        if (manager.active !== true) {
            return reply.status(403).send({
                success: false,
                statusCode: 403,
                error: "ManagerInactive",
                message: "Tu cuenta de gestor está inactiva.",
            });
        }
        const customers = await (0, customerService_1.getCustomersByManagerId)(manager.id);
        const belongsToManager = customers.some((customer) => customer.id === customerId);
        if (!belongsToManager) {
            return reply.status(404).send({
                success: false,
                statusCode: 404,
                error: "Not Found",
                message: "El cliente no existe o no está asociado a tu cuenta.",
            });
        }
        const orders = await (0, orderService_1.getOrdersByCustomerId)(customerId);
        return reply.send({
            success: true,
            data: orders,
        });
    }
    catch (error) {
        request.log.error(error, "Error obteniendo los pedidos del cliente del gestor");
        return reply.status(500).send({
            success: false,
            statusCode: 500,
            error: "CustomerOrdersFetchError",
            message: "No se pudieron obtener los pedidos del cliente.",
        });
    }
}
async function getManagerByIdController(request, reply) {
    const parsedParams = managerValidator_1.managerIdParamsSchema.safeParse(request.params);
    if (!parsedParams.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "Bad Request",
            message: "El ID del gestor no es válido.",
            details: parsedParams.error.flatten(),
        });
    }
    const manager = await (0, managerService_1.getManagerById)(parsedParams.data.id);
    if (!manager) {
        return reply.status(404).send({
            success: false,
            statusCode: 404,
            error: "Not Found",
            message: "Gestor no encontrado.",
        });
    }
    return reply.send({
        success: true,
        data: manager,
    });
}
async function createManagerController(request, reply) {
    const parsedBody = managerValidator_1.createManagerSchema.safeParse(request.body);
    if (!parsedBody.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "Bad Request",
            message: "Los datos del gestor no son válidos.",
            details: parsedBody.error.flatten(),
        });
    }
    try {
        const manager = await (0, managerService_1.createNewManager)(parsedBody.data);
        return reply.status(201).send({
            success: true,
            message: "Gestor creado correctamente.",
            data: manager,
        });
    }
    catch (error) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ManagerCreationError",
            message: error instanceof Error
                ? error.message
                : "No se pudo crear el gestor.",
        });
    }
}
async function updateManagerController(request, reply) {
    const parsedParams = managerValidator_1.managerIdParamsSchema.safeParse(request.params);
    if (!parsedParams.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "Bad Request",
            message: "El ID del gestor no es válido.",
        });
    }
    const parsedBody = managerValidator_1.updateManagerSchema.safeParse(request.body);
    if (!parsedBody.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "Bad Request",
            message: "Los datos del gestor no son válidos.",
            details: parsedBody.error.flatten(),
        });
    }
    try {
        const manager = await (0, managerService_1.updateExistingManager)(parsedParams.data.id, parsedBody.data);
        return reply.send({
            success: true,
            message: "Gestor actualizado correctamente.",
            data: manager,
        });
    }
    catch (error) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ManagerUpdateError",
            message: error instanceof Error
                ? error.message
                : "No se pudo actualizar el gestor.",
        });
    }
}
async function deleteManagerController(request, reply) {
    const parsedParams = managerValidator_1.managerIdParamsSchema.safeParse(request.params);
    if (!parsedParams.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "Bad Request",
            message: "El ID del gestor no es válido.",
        });
    }
    try {
        const manager = await (0, managerService_1.removeManager)(parsedParams.data.id);
        return reply.send({
            success: true,
            message: "Gestor eliminado correctamente.",
            data: manager,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "No se pudo eliminar el gestor.";
        const statusCode = message === "Gestor no encontrado."
            ? 404
            : 400;
        return reply.status(statusCode).send({
            success: false,
            statusCode,
            error: statusCode === 404
                ? "Not Found"
                : "ManagerDeleteError",
            message,
        });
    }
}
async function getMyManagerCustomersController(request, reply) {
    const authUserId = request.authenticatedUser?.id;
    if (!authUserId) {
        return reply.status(401).send({
            success: false,
            statusCode: 401,
            error: "Unauthorized",
            message: "No se pudo identificar al usuario.",
        });
    }
    const { data: userRole, error: userRoleError } = await supabase_1.supabaseAdmin
        .from("user_roles")
        .select(`
        roles (
          code,
          active
        )
      `)
        .eq("user_id", authUserId)
        .maybeSingle();
    if (userRoleError) {
        request.log.error(userRoleError, "Error verificando el rol del gestor");
        return reply.status(500).send({
            success: false,
            statusCode: 500,
            error: "RoleCheckError",
            message: "No se pudo verificar el rol del usuario.",
        });
    }
    const role = Array.isArray(userRole?.roles)
        ? userRole.roles[0] ?? null
        : userRole?.roles ?? null;
    if (role?.code !== "manager" || !role.active) {
        return reply.status(403).send({
            success: false,
            statusCode: 403,
            error: "Forbidden",
            message: "No tienes permiso para consultar estos clientes.",
        });
    }
    const manager = await (0, managerService_1.getManagerByAuthUserId)(authUserId);
    if (!manager) {
        return reply.status(404).send({
            success: false,
            statusCode: 404,
            error: "Not Found",
            message: "No existe un perfil de gestor asociado a esta cuenta.",
        });
    }
    if (manager.active !== true) {
        return reply.status(403).send({
            success: false,
            statusCode: 403,
            error: "ManagerInactive",
            message: "Tu cuenta de gestor está inactiva.",
        });
    }
    try {
        const customers = await (0, customerService_1.getCustomersByManagerId)(manager.id);
        return reply.send({
            success: true,
            data: customers,
        });
    }
    catch (error) {
        request.log.error(error, "Error obteniendo los clientes del gestor");
        return reply.status(500).send({
            success: false,
            statusCode: 500,
            error: "CustomersFetchError",
            message: "No se pudieron obtener los clientes del gestor.",
        });
    }
}
