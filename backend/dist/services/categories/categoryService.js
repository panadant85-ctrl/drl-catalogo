"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = getCategories;
exports.getCategoryById = getCategoryById;
exports.createNewCategory = createNewCategory;
exports.updateExistingCategory = updateExistingCategory;
exports.removeCategory = removeCategory;
const categoryRepository_1 = require("../../repositories/categories/categoryRepository");
async function getCategories() {
    return (0, categoryRepository_1.findCategories)();
}
async function getCategoryById(id) {
    return (0, categoryRepository_1.findCategoryById)(id);
}
async function createNewCategory(input) {
    return (0, categoryRepository_1.createCategory)(input);
}
async function updateExistingCategory(id, input) {
    return (0, categoryRepository_1.updateCategory)(id, input);
}
async function removeCategory(id) {
    return (0, categoryRepository_1.deleteCategory)(id);
}
