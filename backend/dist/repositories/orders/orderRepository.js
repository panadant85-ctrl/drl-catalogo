"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOrders = findOrders;
exports.findOrdersByCustomerId = findOrdersByCustomerId;
exports.findOrderById = findOrderById;
exports.findOrderItems = findOrderItems;
exports.createOrder = createOrder;
exports.updateOrderStatus = updateOrderStatus;
exports.deleteOrder = deleteOrder;
exports.decreaseProductStock = decreaseProductStock;
exports.createOrderAtomic = createOrderAtomic;
const supabase_1 = require("../../config/supabase");
const authenticatedSupabase_1 = require("../../config/authenticatedSupabase");
async function findOrders(request) {
    const authenticatedSupabase = (0, authenticatedSupabase_1.getAuthenticatedSupabase)(request);
    if (!authenticatedSupabase) {
        throw new Error("No se pudo obtener el token de autenticación.");
    }
    const { data, error } = await authenticatedSupabase
        .from("orders")
        .select("*")
        .order("id", { ascending: false });
    if (error)
        throw error;
    return (data ?? []);
}
async function findOrdersByCustomerId(customerId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("orders")
        .select("*")
        .eq("customer_id", customerId)
        .order("id", {
        ascending: false,
    });
    if (error) {
        throw error;
    }
    return (data ?? []);
}
async function findOrderById(id, request) {
    const client = request
        ? (0, authenticatedSupabase_1.getAuthenticatedSupabase)(request)
        : supabase_1.supabaseAdmin;
    if (!client) {
        throw new Error("No se pudo obtener el token de autenticación.");
    }
    const { data, error } = await client
        .from("orders")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    if (error)
        throw error;
    return data;
}
async function findOrderItems(orderId, request) {
    const client = request
        ? (0, authenticatedSupabase_1.getAuthenticatedSupabase)(request)
        : supabase_1.supabaseAdmin;
    if (!client) {
        throw new Error("No se pudo obtener el token de autenticación.");
    }
    const { data, error } = await client
        .from("order_items")
        .select("*")
        .eq("order_id", orderId)
        .order("id", { ascending: true });
    if (error)
        throw error;
    return (data ?? []);
}
async function createOrder(order, items) {
    const { data: createdOrder, error: orderError, } = await supabase_1.supabase
        .from("orders")
        .insert(order)
        .select("*")
        .single();
    if (orderError) {
        throw orderError;
    }
    const orderId = createdOrder.id;
    const itemsToInsert = items.map((item) => ({
        order_id: orderId,
        product_id: item.product_id,
        product_name: item.product_name,
        variant: item.variant,
        unit_price: item.unit_price,
        quantity: item.quantity,
        subtotal: item.subtotal,
        commission_unit: item.commission_unit,
        commission_total: item.commission_total,
    }));
    const { data: createdItems, error: itemsError, } = await supabase_1.supabase
        .from("order_items")
        .insert(itemsToInsert)
        .select("*");
    if (itemsError) {
        // Intentamos limpiar el pedido si falló la inserción
        // de sus items.
        await supabase_1.supabase
            .from("orders")
            .delete()
            .eq("id", orderId);
        throw itemsError;
    }
    return {
        order: createdOrder,
        items: (createdItems ?? []),
    };
}
async function updateOrderStatus(id, status) {
    const { data, error } = await supabase_1.supabase
        .from("orders")
        .update({
        status,
    })
        .eq("id", id)
        .select("*")
        .maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
async function deleteOrder(id) {
    const { data, error } = await supabase_1.supabase
        .from("orders")
        .delete()
        .eq("id", id)
        .select("*")
        .maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
async function decreaseProductStock(productId, quantity) {
    const { data, error } = await supabase_1.supabaseAdmin.rpc("decrease_product_stock", {
        p_product_id: productId,
        p_quantity: quantity,
    });
    if (error) {
        throw error;
    }
    return Number(data);
}
async function createOrderAtomic(order, items) {
    const { data, error } = await supabase_1.supabaseAdmin.rpc("create_order_atomic", {
        p_order: order,
        p_items: items,
    });
    if (error) {
        throw error;
    }
    return Number(data);
}
