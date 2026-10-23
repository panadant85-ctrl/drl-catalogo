"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBrands = listBrands;
exports.getBrand = getBrand;
exports.createBrandController = createBrandController;
exports.updateBrandController = updateBrandController;
exports.deleteBrandController = deleteBrandController;
exports.uploadBrandLogoController = uploadBrandLogoController;
const brandService_1 = require("../../services/brands/brandService");
const brandValidator_1 = require("../../validators/brands/brandValidator");
async function listBrands(_request, reply) {
    const brands = await (0, brandService_1.getBrands)();
    return reply.send({
        data: brands,
    });
}
async function getBrand(request, reply) {
    const { id } = brandValidator_1.brandIdSchema.parse(request.params);
    const brand = await (0, brandService_1.getBrandById)(id);
    if (!brand) {
        return reply.code(404).send({
            message: "La marca no existe.",
        });
    }
    return reply.send({
        data: brand,
    });
}
async function createBrandController(request, reply) {
    const input = brandValidator_1.createBrandSchema.parse(request.body);
    const brand = await (0, brandService_1.createNewBrand)(input);
    return reply.code(201).send({
        message: "Marca creada correctamente.",
        data: brand,
    });
}
async function updateBrandController(request, reply) {
    const { id } = brandValidator_1.brandIdSchema.parse(request.params);
    const input = brandValidator_1.updateBrandSchema.parse(request.body);
    const brand = await (0, brandService_1.updateExistingBrand)(id, input);
    if (!brand) {
        return reply.code(404).send({
            message: "La marca no existe.",
        });
    }
    return reply.send({
        message: "Marca actualizada correctamente.",
        data: brand,
    });
}
async function deleteBrandController(request, reply) {
    const { id } = brandValidator_1.brandIdSchema.parse(request.params);
    const brand = await (0, brandService_1.removeBrand)(id);
    if (!brand) {
        return reply.code(404).send({
            message: "La marca no existe.",
        });
    }
    return reply.send({
        message: "Marca eliminada correctamente.",
        data: brand,
    });
}
async function uploadBrandLogoController(request, reply) {
    try {
        console.log("=== UPLOAD BRAND LOGO ===");
        console.log("PARAMS:", request.params);
        console.log("CONTENT-TYPE:", request.headers["content-type"]);
        const { id } = brandValidator_1.brandIdSchema.parse(request.params);
        const brand = await (0, brandService_1.getBrandById)(id);
        console.log("BRAND:", brand);
        if (!brand) {
            return reply.code(404).send({
                message: "La marca no existe.",
            });
        }
        const file = await request.file();
        console.log("FILE:", file
            ? {
                filename: file.filename,
                mimetype: file.mimetype,
            }
            : null);
        if (!file) {
            return reply.code(400).send({
                message: "Debes seleccionar un archivo de imagen.",
            });
        }
        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/webp",
            "image/svg+xml",
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            return reply.code(400).send({
                message: "El archivo debe ser PNG, JPG, WEBP o SVG.",
            });
        }
        const fileBuffer = await file.toBuffer();
        console.log("FILE SIZE:", fileBuffer.length);
        const extension = file.filename
            .split(".")
            .pop()
            ?.toLowerCase() || "png";
        const filePath = `brand-${id}-${Date.now()}.${extension}`;
        console.log("FILE PATH:", filePath);
        const publicUrl = await (0, brandService_1.saveBrandLogo)(filePath, fileBuffer, file.mimetype);
        console.log("PUBLIC URL:", publicUrl);
        const updatedBrand = await (0, brandService_1.updateExistingBrand)(id, {
            logo_url: publicUrl,
        });
        console.log("UPDATED BRAND:", updatedBrand);
        return reply.send({
            message: "Logo de la marca actualizado correctamente.",
            data: updatedBrand,
        });
    }
    catch (error) {
        console.error("=== ERROR UPLOAD BRAND LOGO ===");
        console.error(error);
        return reply.code(500).send({
            message: "Error interno al subir el logo.",
        });
    }
}
