"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuppliersController = getSuppliersController;
exports.getSupplierByIdController = getSupplierByIdController;
exports.createSupplierController = createSupplierController;
exports.updateSupplierController = updateSupplierController;
exports.deleteSupplierController = deleteSupplierController;
const supplierService_1 = require("../../services/suppliers/supplierService");
const supplierValidator_1 = require("../../validators/suppliers/supplierValidator");
async function getSuppliersController(_request, reply) {
    const suppliers = await (0, supplierService_1.getSuppliers)();
    return reply.send({
        success: true,
        data: suppliers,
    });
}
async function getSupplierByIdController(request, reply) {
    const paramsResult = supplierValidator_1.supplierIdParamsSchema.safeParse(request.params);
    if (!paramsResult.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "El ID del proveedor no es válido.",
            details: paramsResult.error.issues,
        });
    }
    const supplier = await (0, supplierService_1.getSupplierById)(paramsResult.data.id);
    if (!supplier) {
        return reply.status(404).send({
            success: false,
            statusCode: 404,
            error: "Not Found",
            message: "El proveedor no existe.",
        });
    }
    return reply.send({
        success: true,
        data: supplier,
    });
}
async function createSupplierController(request, reply) {
    const bodyResult = supplierValidator_1.createSupplierSchema.safeParse(request.body);
    if (!bodyResult.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "Los datos del proveedor no son válidos.",
            details: bodyResult.error.issues,
        });
    }
    const supplier = await (0, supplierService_1.createNewSupplier)(bodyResult.data);
    return reply.status(201).send({
        success: true,
        message: "Proveedor creado correctamente.",
        data: supplier,
    });
}
async function updateSupplierController(request, reply) {
    const paramsResult = supplierValidator_1.supplierIdParamsSchema.safeParse(request.params);
    if (!paramsResult.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "El ID del proveedor no es válido.",
            details: paramsResult.error.issues,
        });
    }
    const bodyResult = supplierValidator_1.updateSupplierSchema.safeParse(request.body);
    if (!bodyResult.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "Los datos del proveedor no son válidos.",
            details: bodyResult.error.issues,
        });
    }
    const supplier = await (0, supplierService_1.updateExistingSupplier)(paramsResult.data.id, bodyResult.data);
    if (!supplier) {
        return reply.status(404).send({
            success: false,
            statusCode: 404,
            error: "Not Found",
            message: "El proveedor no existe.",
        });
    }
    return reply.send({
        success: true,
        message: "Proveedor actualizado correctamente.",
        data: supplier,
    });
}
async function deleteSupplierController(request, reply) {
    const paramsResult = supplierValidator_1.supplierIdParamsSchema.safeParse(request.params);
    if (!paramsResult.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "El ID del proveedor no es válido.",
            details: paramsResult.error.issues,
        });
    }
    const supplier = await (0, supplierService_1.removeSupplier)(paramsResult.data.id);
    if (!supplier) {
        return reply.status(404).send({
            success: false,
            statusCode: 404,
            error: "Not Found",
            message: "El proveedor no existe.",
        });
    }
    return reply.send({
        success: true,
        message: "Proveedor eliminado correctamente.",
        data: supplier,
    });
}
