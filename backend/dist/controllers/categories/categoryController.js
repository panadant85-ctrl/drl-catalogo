"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCategories = listCategories;
exports.getCategory = getCategory;
exports.createCategoryController = createCategoryController;
exports.updateCategoryController = updateCategoryController;
exports.deleteCategoryController = deleteCategoryController;
const categoryService_1 = require("../../services/categories/categoryService");
const categoryValidator_1 = require("../../validators/categories/categoryValidator");
async function listCategories(_request, reply) {
    const categories = await (0, categoryService_1.getCategories)();
    return reply.send({
        data: categories,
    });
}
async function getCategory(request, reply) {
    const { id } = categoryValidator_1.categoryIdSchema.parse(request.params);
    const category = await (0, categoryService_1.getCategoryById)(id);
    if (!category) {
        return reply.code(404).send({
            message: "La categoría no existe.",
        });
    }
    return reply.send({
        data: category,
    });
}
async function createCategoryController(request, reply) {
    const input = categoryValidator_1.createCategorySchema.parse(request.body);
    const category = await (0, categoryService_1.createNewCategory)(input);
    return reply.code(201).send({
        message: "Categoría creada correctamente.",
        data: category,
    });
}
async function updateCategoryController(request, reply) {
    const { id } = categoryValidator_1.categoryIdSchema.parse(request.params);
    const input = categoryValidator_1.updateCategorySchema.parse(request.body);
    const category = await (0, categoryService_1.updateExistingCategory)(id, input);
    if (!category) {
        return reply.code(404).send({
            message: "La categoría no existe.",
        });
    }
    return reply.send({
        message: "Categoría actualizada correctamente.",
        data: category,
    });
}
async function deleteCategoryController(request, reply) {
    const { id } = categoryValidator_1.categoryIdSchema.parse(request.params);
    const category = await (0, categoryService_1.removeCategory)(id);
    if (!category) {
        return reply.code(404).send({
            message: "La categoría no existe.",
        });
    }
    return reply.send({
        message: "Categoría eliminada correctamente.",
        data: category,
    });
}
