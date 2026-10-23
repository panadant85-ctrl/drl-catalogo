"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerCart = getCustomerCart;
exports.addItemToCart = addItemToCart;
exports.updateCustomerCartItem = updateCustomerCartItem;
exports.removeItemFromCart = removeItemFromCart;
exports.clearCustomerCart = clearCustomerCart;
const cartRepository_1 = require("../../repositories/cart/cartRepository");
const productRepository_1 = require("../../repositories/products/productRepository");
async function getCustomerCart(authUserId) {
    return (0, cartRepository_1.findCartItems)(authUserId);
}
async function addItemToCart(authUserId, productId, quantity, variant) {
    if (quantity <= 0) {
        throw new Error("La cantidad debe ser mayor que cero.");
    }
    const product = await (0, productRepository_1.findProductById)(productId);
    if (!product) {
        throw new Error("El producto no existe.");
    }
    if (!product.active) {
        throw new Error("El producto no está activo.");
    }
    const stock = Number(product.stock) || 0;
    if (stock <= 0) {
        throw new Error(`El producto "${product.name}" no tiene stock disponible.`);
    }
    const existingItem = await (0, cartRepository_1.findCartItem)(authUserId, productId, variant);
    const newQuantity = (existingItem?.quantity ?? 0) +
        quantity;
    if (newQuantity > stock) {
        throw new Error(`Stock insuficiente para "${product.name}". Disponible: ${stock}.`);
    }
    if (existingItem) {
        return (0, cartRepository_1.updateCartItemQuantity)(authUserId, productId, variant, newQuantity);
    }
    return (0, cartRepository_1.createCartItem)(authUserId, productId, quantity, variant);
}
async function updateCustomerCartItem(authUserId, productId, quantity, variant) {
    if (quantity <= 0) {
        throw new Error("La cantidad debe ser mayor que cero.");
    }
    const product = await (0, productRepository_1.findProductById)(productId);
    if (!product) {
        throw new Error("El producto no existe.");
    }
    const stock = Number(product.stock) || 0;
    if (quantity > stock) {
        throw new Error(`Stock insuficiente para "${product.name}". Disponible: ${stock}.`);
    }
    return (0, cartRepository_1.updateCartItemQuantity)(authUserId, productId, variant, quantity);
}
async function removeItemFromCart(authUserId, productId, variant) {
    return (0, cartRepository_1.deleteCartItem)(authUserId, productId, variant);
}
async function clearCustomerCart(authUserId) {
    return (0, cartRepository_1.clearCart)(authUserId);
}
