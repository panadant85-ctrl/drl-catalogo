"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrands = getBrands;
exports.getBrandById = getBrandById;
exports.createNewBrand = createNewBrand;
exports.updateExistingBrand = updateExistingBrand;
exports.removeBrand = removeBrand;
exports.saveBrandLogo = saveBrandLogo;
const brandRepository_1 = require("../../repositories/brands/brandRepository");
async function getBrands() {
    return (0, brandRepository_1.findBrands)();
}
async function getBrandById(id) {
    return (0, brandRepository_1.findBrandById)(id);
}
async function createNewBrand(input) {
    return (0, brandRepository_1.createBrand)(input);
}
async function updateExistingBrand(id, input) {
    return (0, brandRepository_1.updateBrand)(id, input);
}
async function removeBrand(id) {
    return (0, brandRepository_1.deleteBrand)(id);
}
async function saveBrandLogo(filePath, fileBuffer, contentType) {
    return (0, brandRepository_1.uploadBrandLogo)(filePath, fileBuffer, contentType);
}
