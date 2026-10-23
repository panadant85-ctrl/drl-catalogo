"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomersController = getCustomersController;
exports.getCustomerByIdController = getCustomerByIdController;
exports.createCustomerController = createCustomerController;
exports.updateCustomerController = updateCustomerController;
exports.deleteCustomerController = deleteCustomerController;
exports.changeCustomerPasswordController = changeCustomerPasswordController;
const customerService_1 = require("../../services/customers/customerService");
const customerValidator_1 = require("../../validators/customers/customerValidator");
async function getCustomersController(_request, reply) {
    const customers = await (0, customerService_1.getCustomers)();
    return reply.send({
        success: true,
        data: customers,
    });
}
async function getCustomerByIdController(request, reply) {
    const paramsResult = customerValidator_1.customerIdParamsSchema.safeParse(request.params);
    if (!paramsResult.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "El ID del cliente no es válido.",
            details: paramsResult.error.issues,
        });
    }
    const customer = await (0, customerService_1.getCustomerById)(paramsResult.data.id);
    if (!customer) {
        return reply.status(404).send({
            success: false,
            statusCode: 404,
            error: "Not Found",
            message: "El cliente no existe.",
        });
    }
    return reply.send({
        success: true,
        data: customer,
    });
}
async function createCustomerController(request, reply) {
    const bodyResult = customerValidator_1.createCustomerSchema.safeParse(request.body);
    if (!bodyResult.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "Los datos del cliente no son válidos.",
            details: bodyResult.error.issues,
        });
    }
    const customer = await (0, customerService_1.createNewCustomer)(bodyResult.data);
    return reply.status(201).send({
        success: true,
        message: "Cliente creado correctamente.",
        data: customer,
    });
}
async function updateCustomerController(request, reply) {
    const paramsResult = customerValidator_1.customerIdParamsSchema.safeParse(request.params);
    if (!paramsResult.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "El ID del cliente no es válido.",
            details: paramsResult.error.issues,
        });
    }
    const bodyResult = customerValidator_1.updateCustomerSchema.safeParse(request.body);
    if (!bodyResult.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "Los datos del cliente no son válidos.",
            details: bodyResult.error.issues,
        });
    }
    const customer = await (0, customerService_1.updateExistingCustomer)(paramsResult.data.id, bodyResult.data);
    if (!customer) {
        return reply.status(404).send({
            success: false,
            statusCode: 404,
            error: "Not Found",
            message: "El cliente no existe.",
        });
    }
    return reply.send({
        success: true,
        message: "Cliente actualizado correctamente.",
        data: customer,
    });
}
async function deleteCustomerController(request, reply) {
    const paramsResult = customerValidator_1.customerIdParamsSchema.safeParse(request.params);
    if (!paramsResult.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "El ID del cliente no es válido.",
            details: paramsResult.error.issues,
        });
    }
    const customer = await (0, customerService_1.removeCustomer)(paramsResult.data.id);
    if (!customer) {
        return reply.status(404).send({
            success: false,
            statusCode: 404,
            error: "Not Found",
            message: "El cliente no existe.",
        });
    }
    return reply.send({
        success: true,
        message: "Cliente eliminado correctamente.",
        data: customer,
    });
}
async function changeCustomerPasswordController(request, reply) {
    const customerId = Number(request.params.id);
    const { password } = request.body;
    if (!Number.isInteger(customerId) ||
        customerId <= 0) {
        return reply.status(400).send({
            success: false,
            message: "El ID del cliente no es válido.",
        });
    }
    if (typeof password !== "string" ||
        password.length < 8) {
        return reply.status(400).send({
            success: false,
            message: "La contraseña debe tener al menos 8 caracteres.",
        });
    }
    try {
        await (0, customerService_1.changeCustomerPassword)(customerId, password);
        return reply.send({
            success: true,
            message: "La contraseña del cliente se actualizó correctamente.",
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "No se pudo cambiar la contraseña.";
        const statusCode = message === "El cliente no existe." ||
            message ===
                "Este cliente no tiene una cuenta de usuario asociada."
            ? 404
            : 400;
        return reply.status(statusCode).send({
            success: false,
            message,
        });
    }
}
