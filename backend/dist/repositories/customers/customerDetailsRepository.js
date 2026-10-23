"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findCustomerDetailsBase = findCustomerDetailsBase;
exports.findOrdersByCustomerId = findOrdersByCustomerId;
exports.findOrderItemsByOrderIds = findOrderItemsByOrderIds;
const supabase_1 = require("../../config/supabase");
async function findCustomerDetailsBase(customerId) {
    const { data, error } = await supabase_1.supabase
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
async function findOrdersByCustomerId(customerId) {
    const { data, error } = await supabase_1.supabase
        .from("orders")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", {
        ascending: false,
    });
    if (error) {
        throw error;
    }
    return (data ?? []);
}
async function findOrderItemsByOrderIds(orderIds) {
    if (orderIds.length === 0) {
        return [];
    }
    const { data, error } = await supabase_1.supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds)
        .order("id", {
        ascending: true,
    });
    if (error) {
        throw error;
    }
    return (data ?? []);
}
