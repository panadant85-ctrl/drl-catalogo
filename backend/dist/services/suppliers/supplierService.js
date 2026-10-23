"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuppliers = getSuppliers;
exports.getSupplierById = getSupplierById;
exports.createNewSupplier = createNewSupplier;
exports.updateExistingSupplier = updateExistingSupplier;
exports.removeSupplier = removeSupplier;
const supplierRepository_1 = require("../../repositories/suppliers/supplierRepository");
async function getSuppliers() {
    return (0, supplierRepository_1.findSuppliers)();
}
async function getSupplierById(id) {
    return (0, supplierRepository_1.findSupplierById)(id);
}
async function createNewSupplier(input) {
    return (0, supplierRepository_1.createSupplier)(input);
}
async function updateExistingSupplier(id, input) {
    return (0, supplierRepository_1.updateSupplier)(id, input);
}
async function removeSupplier(id) {
    return (0, supplierRepository_1.deleteSupplier)(id);
}
