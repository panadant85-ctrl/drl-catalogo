"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findCartItems = findCartItems;
exports.findCartItem = findCartItem;
exports.createCartItem = createCartItem;
exports.updateCartItemQuantity = updateCartItemQuantity;
exports.deleteCartItem = deleteCartItem;
exports.clearCart = clearCart;
const supabase_1 = require("../../config/supabase");
async function findCartItems(authUserId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("cart_items")
        .select(`
      id,
      auth_user_id,
      product_id,
      quantity,
      variant,
      created_at,
      updated_at,
      product:products (
        id,
        name,
        brand,
        model,
        sku,
        category,
        price,
        stock,
        description,
        features,
        images,
        family_id,
        variant,
        active
      )
    `)
        .eq("auth_user_id", authUserId)
        .order("id", { ascending: true });
    if (error) {
        console.error("CART SUPABASE ERROR:", error);
        throw error;
    }
    return (data ?? []);
}
async function findCartItem(authUserId, productId, variant) {
    let query = supabase_1.supabaseAdmin
        .from("cart_items")
        .select("*")
        .eq("auth_user_id", authUserId)
        .eq("product_id", productId);
    if (variant === null) {
        query = query.is("variant", null);
    }
    else {
        query = query.eq("variant", variant);
    }
    const { data, error } = await query.maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
async function createCartItem(authUserId, productId, quantity, variant) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("cart_items")
        .insert({
        auth_user_id: authUserId,
        product_id: productId,
        quantity,
        variant,
    })
        .select("*")
        .single();
    if (error) {
        throw error;
    }
    return data;
}
async function updateCartItemQuantity(authUserId, productId, variant, quantity) {
    let query = supabase_1.supabaseAdmin
        .from("cart_items")
        .update({
        quantity,
        updated_at: new Date().toISOString(),
    })
        .eq("auth_user_id", authUserId)
        .eq("product_id", productId);
    if (variant === null) {
        query = query.is("variant", null);
    }
    else {
        query = query.eq("variant", variant);
    }
    const { data, error } = await query.select("*").maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
async function deleteCartItem(authUserId, productId, variant) {
    let query = supabase_1.supabaseAdmin
        .from("cart_items")
        .delete()
        .eq("auth_user_id", authUserId)
        .eq("product_id", productId);
    if (variant === null) {
        query = query.is("variant", null);
    }
    else {
        query = query.eq("variant", variant);
    }
    const { data, error } = await query.select("*").maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
async function clearCart(authUserId) {
    const { error } = await supabase_1.supabaseAdmin
        .from("cart_items")
        .delete()
        .eq("auth_user_id", authUserId);
    if (error) {
        throw error;
    }
}
