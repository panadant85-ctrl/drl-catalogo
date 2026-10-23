"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductController = createProductController;
exports.getProductsController = getProductsController;
exports.getAllProductsController = getAllProductsController;
exports.getProductByIdController = getProductByIdController;
exports.updateProductController = updateProductController;
exports.updateProductStatusController = updateProductStatusController;
exports.deleteProductController = deleteProductController;
const productValidator_1 = require("../../validators/products/productValidator");
const permissions_1 = require("../../middlewares/permissions");
const productService_1 = require("../../services/products/productService");
function toPublicProduct(product) {
    const { cost, manager_commission, ...publicProduct } = product;
    // Los valores internos se excluyen deliberadamente.
    void cost;
    void manager_commission;
    return publicProduct;
}
async function createProductController(request, reply) {
    const result = productValidator_1.createProductSchema.safeParse(request.body);
    if (!result.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "Los datos del producto no son válidos.",
            details: result.error.issues,
        });
    }
    const product = await (0, productService_1.createNewProduct)(result.data);
    const admin = await (0, permissions_1.isAdmin)(request);
    return reply.status(201).send({
        success: true,
        message: "Producto creado correctamente.",
        data: admin
            ? product
            : toPublicProduct(product),
    });
}
async function getProductsController(_request, reply) {
    const products = await (0, productService_1.getActiveProducts)();
    return reply.send({
        success: true,
        data: products.map(toPublicProduct),
    });
}
async function getAllProductsController(request, reply) {
    const products = await (0, productService_1.getAllProducts)();
    const admin = await (0, permissions_1.isAdmin)(request);
    return reply.send({
        success: true,
        data: admin
            ? products
            : products.map(toPublicProduct),
    });
}
async function getProductByIdController(request, reply) {
    const id = Number(request.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "Bad Request",
            message: "El ID del producto no es válido.",
        });
    }
    const product = await (0, productService_1.getProductById)(id);
    if (!product) {
        return reply.status(404).send({
            success: false,
            statusCode: 404,
            error: "Not Found",
            message: "El producto no existe.",
        });
    }
    return reply.send({
        success: true,
        data: toPublicProduct(product),
    });
}
async function updateProductController(request, reply) {
    const paramsResult = productValidator_1.productIdParamsSchema.safeParse(request.params);
    if (!paramsResult.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "El ID del producto no es válido.",
            details: paramsResult.error.issues,
        });
    }
    const bodyResult = productValidator_1.updateProductSchema.safeParse(request.body);
    if (!bodyResult.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "Los datos del producto no son válidos.",
            details: bodyResult.error.issues,
        });
    }
    const product = await (0, productService_1.updateExistingProduct)(paramsResult.data.id, bodyResult.data);
    if (!product) {
        return reply.status(404).send({
            success: false,
            statusCode: 404,
            error: "Not Found",
            message: "El producto no existe.",
        });
    }
    return reply.send({
        success: true,
        message: "Producto actualizado correctamente.",
        data: product,
    });
}
async function updateProductStatusController(request, reply) {
    const paramsResult = productValidator_1.productIdParamsSchema.safeParse(request.params);
    if (!paramsResult.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "El ID del producto no es válido.",
            details: paramsResult.error.issues,
        });
    }
    const bodyResult = productValidator_1.updateProductStatusSchema.safeParse(request.body);
    if (!bodyResult.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "El estado del producto no es válido.",
            details: bodyResult.error.issues,
        });
    }
    const product = await (0, productService_1.changeProductStatus)(paramsResult.data.id, bodyResult.data.active);
    if (!product) {
        return reply.status(404).send({
            success: false,
            statusCode: 404,
            error: "Not Found",
            message: "El producto no existe.",
        });
    }
    return reply.send({
        success: true,
        message: product.active
            ? "Producto activado correctamente."
            : "Producto desactivado correctamente.",
        data: product,
    });
}
async function deleteProductController(request, reply) {
    const result = productValidator_1.productIdParamsSchema.safeParse(request.params);
    if (!result.success) {
        return reply.status(400).send({
            success: false,
            statusCode: 400,
            error: "ValidationError",
            message: "El ID del producto no es válido.",
            details: result.error.issues,
        });
    }
    const product = await (0, productService_1.removeProduct)(result.data.id);
    if (!product) {
        return reply.status(404).send({
            success: false,
            statusCode: 404,
            error: "Not Found",
            message: "El producto no existe.",
        });
    }
    return reply.send({
        success: true,
        message: "Producto eliminado correctamente.",
        data: product,
    });
}
