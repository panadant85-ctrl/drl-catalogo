"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveProducts = getActiveProducts;
exports.getAllProducts = getAllProducts;
exports.getProductById = getProductById;
exports.createNewProduct = createNewProduct;
exports.updateExistingProduct = updateExistingProduct;
exports.changeProductStatus = changeProductStatus;
exports.removeProduct = removeProduct;
const productRepository_1 = require("../../repositories/products/productRepository");
async function getActiveProducts() {
    return (0, productRepository_1.findActiveProducts)();
}
async function getAllProducts() {
    return (0, productRepository_1.findAllProducts)();
}
async function getProductById(id) {
    return (0, productRepository_1.findProductById)(id);
}
async function createNewProduct(input) {
    return (0, productRepository_1.createProduct)(input);
}
async function updateExistingProduct(id, input) {
    return (0, productRepository_1.updateProduct)(id, input);
}
async function changeProductStatus(id, active) {
    return (0, productRepository_1.updateProductStatus)(id, active);
}
async function removeProduct(id) {
    return (0, productRepository_1.deleteProduct)(id);
}
