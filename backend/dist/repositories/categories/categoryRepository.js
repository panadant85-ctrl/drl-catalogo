"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findCategories = findCategories;
exports.findCategoryById = findCategoryById;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
const supabase_1 = require("../../config/supabase");
async function findCategories() {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("categories")
        .select(`
      *,
      product_categories(count)
    `)
        .order("position", { ascending: true })
        .order("id", { ascending: true });
    if (error)
        throw error;
    return (data ?? []).map((category) => ({
        ...category,
        product_count: category.product_categories?.[0]?.count ?? 0,
    }));
}
async function findCategoryById(id) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("categories")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
async function createCategory(input) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("categories")
        .insert({
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        parent_id: input.parent_id ?? null,
        active: input.active ?? true,
        position: input.position ?? 0,
    })
        .select("*")
        .single();
    if (error) {
        throw error;
    }
    return data;
}
async function updateCategory(id, input) {
    const updateData = {
        ...input,
        updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase_1.supabaseAdmin
        .from("categories")
        .update(updateData)
        .eq("id", id)
        .select("*")
        .maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
async function deleteCategory(id) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("categories")
        .delete()
        .eq("id", id)
        .select("*")
        .maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
