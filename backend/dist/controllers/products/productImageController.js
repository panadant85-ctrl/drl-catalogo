"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProductImageController = uploadProductImageController;
const productImageRepository_1 = require("../../repositories/products/productImageRepository");
const node_crypto_1 = require("node:crypto");
const productRepository_1 = require("../../repositories/products/productRepository");
const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
function getExtension(filename, contentType) {
    const extensions = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
    };
    // Se utiliza el tipo MIME validado,
    // no la extensión proporcionada por el usuario.
    return extensions[contentType] ??
        filename.split(".").pop()?.toLowerCase() ??
        "webp";
}
async function uploadProductImageController(request, reply) {
    try {
        const id = Number(request.params.id);
        if (!Number.isSafeInteger(id) || id <= 0) {
            return reply.code(400).send({
                message: "El ID del producto no es válido.",
            });
        }
        const product = await (0, productRepository_1.findProductById)(id);
        if (!product) {
            return reply.code(404).send({
                message: "El producto no existe.",
            });
        }
        const file = await request.file();
        if (!file) {
            return reply.code(400).send({
                message: "Debes seleccionar una imagen.",
            });
        }
        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            return reply.code(400).send({
                message: "Solo se permiten imágenes JPG, PNG o WEBP.",
            });
        }
        const fileBuffer = await file.toBuffer();
        if (fileBuffer.length === 0) {
            return reply.code(400).send({
                message: "El archivo está vacío.",
            });
        }
        if (fileBuffer.length > MAX_IMAGE_SIZE) {
            return reply.code(413).send({
                message: "La imagen no puede superar los 5 MB.",
            });
        }
        const extension = getExtension(file.filename, file.mimetype);
        const filePath = `products/${id}/${Date.now()}-${(0, node_crypto_1.randomUUID)()}.${extension}`;
        const imageUrl = await (0, productImageRepository_1.uploadProductImage)(filePath, fileBuffer, file.mimetype);
        await (0, productRepository_1.appendProductImage)(id, imageUrl);
        return reply.code(201).send({
            message: "Imagen subida correctamente.",
            data: {
                url: imageUrl,
            },
        });
    }
    catch (error) {
        request.log.error({ err: error }, "Error al subir imagen del producto");
        return reply.code(500).send({
            message: "No se pudo subir la imagen del producto.",
        });
    }
}
