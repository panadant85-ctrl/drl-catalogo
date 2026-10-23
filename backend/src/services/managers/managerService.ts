import {
  createManager,
  deleteManager,
  findManagerByEmail,
  findManagerById,
  findManagerByAuthUserId,
  findManagerByUsername,
  findManagers,
  updateManager,
} from "../../repositories/managers/managerRepository";



import type {
  CreateManagerInput,
  UpdateManagerInput,
} from "../../validators/managers/managerValidator";

export async function getManagers() {
  return findManagers();
}

export async function getManagerById(id: string) {
  return findManagerById(id);
}


export async function getManagerByAuthUserId(
  authUserId: string
) {
  return findManagerByAuthUserId(authUserId);
}


export async function createNewManager(
  input: CreateManagerInput
) {
  const existingUsername =
    await findManagerByUsername(input.username);

  if (existingUsername) {
    throw new Error(
      "Ya existe un gestor con ese username."
    );
  }

  const existingEmail =
    await findManagerByEmail(input.email);

  if (existingEmail) {
    throw new Error(
      "Ya existe un gestor con ese email."
    );
  }

  return createManager(input);
}

export async function updateExistingManager(
  id: string,
  input: UpdateManagerInput
) {
  const existing = await findManagerById(id);

  if (!existing) {
    throw new Error("Gestor no encontrado.");
  }

  if (
    input.username &&
    input.username !== existing.username
  ) {
    const duplicate =
      await findManagerByUsername(input.username);

    if (duplicate && duplicate.id !== id) {
      throw new Error(
        "Ya existe un gestor con ese username."
      );
    }
  }

  if (
    input.email &&
    input.email !== existing.email
  ) {
    const duplicate =
      await findManagerByEmail(input.email);

    if (duplicate && duplicate.id !== id) {
      throw new Error(
        "Ya existe un gestor con ese email."
      );
    }
  }

  return updateManager(id, input);
}

export async function removeManager(id: string) {
  return deleteManager(id);
}