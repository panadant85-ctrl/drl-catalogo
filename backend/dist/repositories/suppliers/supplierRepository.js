"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findSuppliers = findSuppliers;
exports.findSupplierById = findSupplierById;
exports.createSupplier = createSupplier;
exports.updateSupplier = updateSupplier;
exports.deleteSupplier = deleteSupplier;
const supabase_1 = require("../../config/supabase");
async function findSuppliers() {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("suppliers")
        .select("*")
        .order("id", {
        ascending: true,
    });
    if (error) {
        throw error;
    }
    return (data ?? []);
}
async function findSupplierById(id) {
    const { data, error } = await supabase_1.supabase
        .from("suppliers")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
async function createSupplier(input) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("suppliers")
        .insert({
        company_name: input.company_name,
        nit: input.nit,
        address: input.address,
        phone: input.phone ?? null,
        email: input.email ?? null,
        active: input.active ?? true,
    })
        .select("*")
        .single();
    if (error) {
        throw error;
    }
    return data;
}
async function updateSupplier(id, input) {
    const updateData = {
        ...input,
        phone: input.phone ?? undefined,
        email: input.email ?? undefined,
        updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase_1.supabaseAdmin
        .from("suppliers")
        .update(updateData)
        .eq("id", id)
        .select("*")
        .maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
async function deleteSupplier(id) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("suppliers")
        .delete()
        .eq("id", id)
        .select("*")
        .maybeSingle();
    if (error) {
        throw error;
    }
    return data;
}
