import { supabaseAdmin } from "../../config/supabase";
import type {
  CreateRoleInput,
  UpdateRoleInput,
} from "../../validators/roles/roleValidator";
import type { Role } from "../../types/roles/role";

const ROLE_COLUMNS = `
  id,
  code,
  name,
  description,
  permissions,
  active,
  created_at
`;
export async function findRoles(): Promise<Role[]> {
  const { data, error } = await supabaseAdmin
    .from("roles")
    .select(ROLE_COLUMNS)
    .order("id", { ascending: true });

  if (error) {
    throw new Error(
      `No se pudieron obtener los roles: ${error.message}`
    );
  }

  return (data ?? []) as Role[];
}

export async function findRoleById(
  id: number
): Promise<Role | null> {
  const { data, error } = await supabaseAdmin
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

            throw new Error(
                `No se pudieron obtener los roles: ${error.message}`
            );
            }

  return data as Role | null;
}

export async function findRoleByCode(
  code: string
): Promise<Role | null> {
  const { data, error } = await supabaseAdmin
    .from("roles")
    .select(ROLE_COLUMNS)
    .eq("code", code)
    .maybeSingle();

  if (error) {
    throw new Error(
      `No se pudo comprobar el código del rol: ${error.message}`
    );
  }

  return data as Role | null;
}

export async function createRole(
  input: CreateRoleInput
): Promise<Role> {
  const { data, error } = await supabaseAdmin
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
    throw new Error(
      `No se pudo crear el rol: ${error.message}`
    );
  }

  return data as Role;
}

export async function updateRole(
  id: number,
  input: UpdateRoleInput
): Promise<Role> {
  const updateData: Record<string, unknown> = {};

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

  const { data, error } = await supabaseAdmin
    .from("roles")
    .update(updateData)
    .eq("id", id)
    .select(ROLE_COLUMNS)
    .single();

  if (error) {
    throw new Error(
      `No se pudo actualizar el rol: ${error.message}`
    );
  }

  return data as Role;
}

export async function deleteRole(
  id: number
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("roles")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(
      `No se pudo eliminar el rol: ${error.message}`
    );
  }
}