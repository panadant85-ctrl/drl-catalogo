import type {
  CreateRoleInput,
  UpdateRoleInput,
} from "../../validators/roles/roleValidator";

import {
  findRoles,
  findRoleById,
  findRoleByCode,
  createRole,
  updateRole,
  deleteRole,
} from "../../repositories/roles/roleRepository";

export async function getRoles() {
  return findRoles();
}

export async function getRoleById(id: number) {
  return findRoleById(id);
}

export async function createNewRole(
  input: CreateRoleInput
) {
  const existingRole =
    await findRoleByCode(input.code);

  if (existingRole) {
    throw new Error(
      `Ya existe un rol con el código "${input.code}".`
    );
  }

  return createRole(input);
}

export async function updateExistingRole(
  id: number,
  input: UpdateRoleInput
) {
  const existingRole =
    await findRoleById(id);

  if (!existingRole) {
    throw new Error("El rol no existe.");
  }

  if (
    input.code !== undefined &&
    input.code !== existingRole.code
  ) {
    const roleWithSameCode =
      await findRoleByCode(input.code);

    if (
      roleWithSameCode &&
      roleWithSameCode.id !== id
    ) {
      throw new Error(
        `Ya existe otro rol con el código "${input.code}".`
      );
    }
  }

  return updateRole(id, input);
}

export async function removeRole(
  id: number
) {
  const existingRole =
    await findRoleById(id);

  if (!existingRole) {
    throw new Error("El rol no existe.");
  }

  if (
    existingRole.code === "admin" ||
    existingRole.code === "manager"
  ) {
    throw new Error(
      "Los roles principales del sistema no pueden eliminarse."
    );
  }

  await deleteRole(id);
}