"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersController = getOrdersController;
exports.getOrderByIdController = getOrderByIdController;
exports.createOrderController = createOrderController;
exports.createPosOrderController = createPosOrderController;
exports.updateOrderStatusController = updateOrderStatusController;
exports.deleteOrderController = deleteOrderController;
const orderService_1 = require("../../services/orders/orderService");
const orderValidator_1 = require("../../validators/orders/orderValidator");
async function getOrdersController(request, reply) {
    const orders = await (0, orderService_1.getOrders)(request);
    return reply.send({
        success: true,
        data: orders,
    });
}
async function getOrderByIdController(request, reply) {
    const id = Number(request.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return reply.status(400).send({
            success: false,
            message: "El ID del pedido no es válido.",
        });
    }
    const result = await (0, orderService_1.getOrderById)(id, request);
    if (!result) {
        return reply.status(404).send({
            success: false,
            message: "Pedido no encontrado.",
        });
    }
    return reply.send({
        success: true,
        data: result.order,
        items: result.items,
    });
}
async function createOrderController(request, reply) {
    const bodyResult = orderValidator_1.createOrderSchema.safeParse(request.body);
    if (!bodyResult.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "Los datos del pedido no son válidos.",
            details: bodyResult.error.issues,
        });
    }
    try {
        const result = await (0, orderService_1.createNewOrder)(bodyResult.data);
        return reply.status(201).send({
            success: true,
            message: "Pedido creado correctamente.",
            data: result.order,
            items: result.items,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "No se pudo crear el pedido.";
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "OrderCreationError",
            message,
        });
    }
}
async function createPosOrderController(request, reply) {
    const bodyResult = orderValidator_1.createPosOrderSchema.safeParse(request.body);
    if (!bodyResult.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "Los datos de la venta POS no son válidos.",
            details: bodyResult.error.issues,
        });
    }
    try {
        const result = await (0, orderService_1.createNewPosOrder)(bodyResult.data);
        return reply.status(201).send({
            success: true,
            message: "Venta POS registrada correctamente.",
            data: result.order,
            items: result.items,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "No se pudo registrar la venta POS.";
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "PosOrderCreationError",
            message,
        });
    }
}
async function updateOrderStatusController(request, reply) {
    const paramsResult = orderValidator_1.orderIdParamsSchema.safeParse(request.params);
    if (!paramsResult.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "El ID del pedido no es válido.",
            details: paramsResult.error.issues,
        });
    }
    const bodyResult = orderValidator_1.updateOrderStatusSchema.safeParse(request.body);
    if (!bodyResult.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "El estado del pedido no es válido.",
            details: bodyResult.error.issues,
        });
    }
    const order = await (0, orderService_1.changeOrderStatus)(paramsResult.data.id, bodyResult.data.status);
    if (!order) {
        return reply.status(404).send({
            success: false,
            statusCode: 404,
            error: "Not Found",
            message: "El pedido no existe.",
        });
    }
    return reply.send({
        success: true,
        message: "Estado del pedido actualizado correctamente.",
        data: order,
    });
}
async function deleteOrderController(request, reply) {
    const paramsResult = orderValidator_1.orderIdParamsSchema.safeParse(request.params);
    if (!paramsResult.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "El ID del pedido no es válido.",
            details: paramsResult.error.issues,
        });
    }
    const order = await (0, orderService_1.removeOrder)(paramsResult.data.id);
    if (!order) {
        return reply.status(404).send({
            success: false,
            statusCode: 404,
            error: "Not Found",
            message: "El pedido no existe.",
        });
    }
    return reply.send({
        success: true,
        message: "Pedido eliminado correctamente.",
        data: order,
    });
}
