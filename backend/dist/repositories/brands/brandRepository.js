"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findBrands = findBrands;
exports.findBrandById = findBrandById;
exports.createBrand = createBrand;
exports.updateBrand = updateBrand;
exports.deleteBrand = deleteBrand;
exports.uploadBrandLogo = uploadBrandLogo;
const supabase_1 = require("../../config/supabase");
async function findBrands() {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("brands")
        .select("*")
        .order("id", { ascending: true });
    if (error)
        throw error;
    return (data ?? []);
}
async function findBrandById(id) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("brands")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    if (error)
        throw error;
    return data;
}
async function createBrand(input) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("brands")
        .insert({
        name: input.name,
        description: input.description ?? null,
        logo_url: input.logo_url ?? null,
        active: input.active ?? true,
    })
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
}
async function updateBrand(id, input) {
    const updateData = {
        ...input,
        updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase_1.supabaseAdmin
        .from("brands")
        .update(updateData)
        .eq("id", id)
        .select("*")
        .maybeSingle();
    if (error)
        throw error;
    return data;
}
async function deleteBrand(id) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("brands")
        .delete()
        .eq("id", id)
        .select("*")
        .maybeSingle();
    if (error)
        throw error;
    return data;
}
async function uploadBrandLogo(filePath, fileBuffer, contentType) {
    const { error } = await supabase_1.supabaseAdmin.storage
        .from("brand-logos")
        .upload(filePath, fileBuffer, {
        contentType,
        upsert: true,
    });
    if (error) {
        throw error;
    }
    const { data: { publicUrl }, } = supabase_1.supabaseAdmin.storage
        .from("brand-logos")
        .getPublicUrl(filePath);
    return publicUrl;
}
