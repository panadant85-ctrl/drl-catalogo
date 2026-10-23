"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProductImage = uploadProductImage;
const supabase_1 = require("../../config/supabase");
const PRODUCT_IMAGES_BUCKET = "product-images";
const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];
async function uploadProductImage(filePath, fileBuffer, contentType) {
    if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
        throw new Error("Formato no permitido. Utiliza JPG, PNG o WEBP.");
    }
    const { error } = await supabase_1.supabaseAdmin.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(filePath, fileBuffer, {
        contentType,
        upsert: false,
    });
    if (error) {
        throw error;
    }
    const { data } = supabase_1.supabaseAdmin.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .getPublicUrl(filePath);
    return data.publicUrl;
}
