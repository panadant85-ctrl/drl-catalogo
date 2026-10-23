"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRoles = findRoles;
exports.findRoleById = findRoleById;
exports.findRoleByCode = findRoleByCode;
exports.createRole = createRole;
exports.updateRole = updateRole;
exports.deleteRole = deleteRole;
const supabase_1 = require("../../config/supabase");
const ROLE_COLUMNS = `
  id,
  code,
  name,
  description,
  permissions,
  active,
  created_at
`;
async function findRoles() {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("roles")
        .select(ROLE_COLUMNS)
        .order("id", { ascending: true });
    if (error) {
        throw new Error(`No se pudieron obtener los roles: ${error.message}`);
    }
    return (data ?? []);
}
async function findRoleById(id) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("roles")
        .select(ROLE_COLUMNS)
        .eq("id", id)
        .maybeSingle();
    if (error) {
        console.error("ERROR SUPABASE ROLES:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error(`No se pudieron obtener los roles: ${error.message}`);
    }
    return data;
}
async function findRoleByCode(code) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("roles")
        .select(ROLE_COLUMNS)
        .eq("code", code)
        .maybeSingle();
    if (error) {
        throw new Error(`No se pudo comprobar el código del rol: ${error.message}`);
    }
    return data;
}
async function createRole(input) {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("roles")
        .insert({
        code: input.code,
        name: input.name,
        description: input.description ?? null,
        permissions: input.permissions,
        active: input.active,
    })
        .select(ROLE_COLUMNS)
        .single();
    if (error) {
        throw new Error(`No se pudo crear el rol: ${error.message}`);
    }
    return data;
}
async function updateRole(id, input) {
    const updateData = {};
    if (input.code !== undefined) {
        updateData.code = input.code;
    }
    if (input.name !== undefined) {
        updateData.name = input.name;
    }
    if (input.description !== undefined) {
        updateData.description =
            input.description ?? null;
    }
    if (input.permissions !== undefined) {
        updateData.permissions = input.permissions;
    }
    if (input.active !== undefined) {
        updateData.active = input.active;
    }
    const { data, error } = await supabase_1.supabaseAdmin
        .from("roles")
        .update(updateData)
        .eq("id", id)
        .select(ROLE_COLUMNS)
        .single();
    if (error) {
        throw new Error(`No se pudo actualizar el rol: ${error.message}`);
    }
    return data;
}
async function deleteRole(id) {
    const { error } = await supabase_1.supabaseAdmin
        .from("roles")
        .delete()
        .eq("id", id);
    if (error) {
        throw new Error(`No se pudo eliminar el rol: ${error.message}`);
    }
}
