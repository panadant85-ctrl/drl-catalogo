"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findCustomers = findCustomers;
exports.findCustomersByManagerId = findCustomersByManagerId;
exports.findCustomerById = findCustomerById;
exports.findCustomerByAuthUserId = findCustomerByAuthUserId;
exports.updateCustomerByAuthUserId = updateCustomerByAuthUserId;
exports.createCustomer = createCustomer;
exports.updateCustomer = updateCustomer;
exports.deleteCustomer = deleteCustomer;
exports.linkCustomerToManager = linkCustomerToManager;
const supabase_1 = require("../../config/supabase");
async function findCustomers() {
    const { data, error } = await supabase_1.supabase
        .from("customers")
        .select("*")
        .order("id", {
        ascending: true,
    });
    if (error) {
        throw error;
    }
    const customers = data ?? [];
    const { data: orders, error: ordersError } = await supabase_1.supabase
        .from("orders")
        .select("customer_id");
    if (ordersError) {
        throw ordersError;
    }
    const orderCounts = new Map();
    for (const order of orders ?? []) {
        if (order.customer_id == null) {
            continue;
        }
        const customerId = Number(order.customer_id);
        orderCounts.set(customerId, (orderCounts.get(customerId) ?? 0) + 1);
    }
    return customers.map((customer) => ({
        ...customer,
        orders_count: orderCounts.get(Number(customer.id)) ?? 0,
    }));
}
async function findCustomersByManagerId(managerId) {
    const { data, error } = await supabase_1.supabase
        .from("customers")
        .select("*")
        .eq("manager_id", managerId)
        .order("id", {
        ascending: true,
    });
    if (error) {
        throw error;
    }
    return (data ?? []);
}
async function findCustomerById(id) {
    const { data, error } = await supabase_1.supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
async function findCustomerByAuthUserId(authUserId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("customers")
        .select("*")
        .eq("auth_user_id", authUserId)
        .maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
/**
 * Actualizar perfil del cliente autenticado.
 *
 * No modificamos:
 * - auth_user_id
 * - manager_id
 *
 * El nombre completo viene generado por el validator
 * a partir de:
 * - first_name
 * - last_name_1
 * - last_name_2
 */
async function updateCustomerByAuthUserId(authUserId, input) {
    console.log("Perfil recibido para actualizar:", {
        authUserId,
        full_name: input.full_name,
        identification: input.identification,
    });
    const updateData = {
        ...input,
        email: input.email ?? undefined,
        phone: input.phone ?? undefined,
        province: input.province ?? undefined,
        municipality: input.municipality ?? undefined,
        address: input.address ?? undefined,
        auth_user_id: undefined,
        manager_id: undefined,
    };
    const { data, error } = await supabase_1.supabaseAdmin
        .from("customers")
        .update(updateData)
        .eq("auth_user_id", authUserId)
        .select("*")
        .maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
/**
 * Crear nuevo cliente.
 *
 * Se guardan:
 * - first_name
 * - last_name_1
 * - last_name_2
 * - full_name
 *
 * full_name ya viene construido por el validator.
 */
async function createCustomer(input) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("customers")
        .insert({
        first_name: input.first_name,
        last_name_1: input.last_name_1,
        last_name_2: input.last_name_2,
        full_name: input.full_name,
        identification: input.identification,
        email: input.email ?? null,
        phone: input.phone ?? null,
        province: input.province ?? null,
        municipality: input.municipality ?? null,
        address: input.address ?? null,
        auth_user_id: input.auth_user_id ?? null,
        manager_id: input.manager_id ?? null,
        source_type: input.source_type,
    })
        .select("*")
        .single();
    if (error) {
        throw error;
    }
    return data;
}
/**
 * Actualizar cliente por ID.
 *
 * Los nuevos campos de nombre y full_name
 * son manejados por el validator.
 */
async function updateCustomer(id, input) {
    const updateData = {
        ...input,
        email: input.email ?? undefined,
        phone: input.phone ?? undefined,
        province: input.province ?? undefined,
        municipality: input.municipality ?? undefined,
        address: input.address ?? undefined,
        auth_user_id: input.auth_user_id ?? undefined,
        manager_id: input.manager_id ?? undefined,
    };
    const { data, error } = await supabase_1.supabase
        .from("customers")
        .update(updateData)
        .eq("id", id)
        .select("*")
        .maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
async function deleteCustomer(id) {
    const { data, error } = await supabase_1.supabase
        .from("customers")
        .delete()
        .eq("id", id)
        .select("*")
        .maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
async function linkCustomerToManager(authUserId, managerId) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("customers")
        .update({
        manager_id: managerId,
        source_type: "manager",
    })
        .eq("auth_user_id", authUserId)
        .is("manager_id", null)
        .select("*")
        .maybeSingle();
    if (error) {
        throw new Error(`No se pudo vincular el cliente al gestor: ${error.message}`);
    }
    return data;
}
