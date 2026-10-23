import {
  assignRoleToUser,
  createAuthUser,
  deleteAuthUser,
  findActiveRoles,
  findAuthUserById,
  findRoleById,
  findUserRoleByUserId,
  listAuthUsers,
  removeUserRole,
  updateUserRole,
  updateAuthUserStatus,
  updateAuthUser,
} from "../../repositories/users/userRepository";

import type {
  CreateUserInput,
  UpdateUserInput,
} from "../../validators/users/userValidator";

export async function getAdminUsers() {
  return await listAuthUsers();
}

export async function getAdminUserById(
  userId: string
) {
  const user = await findAuthUserById(userId);

  if (!user) {
    throw new Error("Usuario no encontrado.");
  }

  return user;
}

export async function getAvailableRoles() {
  return await findActiveRoles();
}

export async function getUserRole(
  userId: string
) {
  const userRole =
    await findUserRoleByUserId(userId);

  if (!userRole) {
    return null;
  }

  return await findRoleById(userRole.role_id);
}


export async function createAdminUser(
  input: CreateUserInput
) {
  const role = await findRoleById(input.roleId);

  if (!role) {
    throw new Error(
      "El rol seleccionado no existe."
    );
  }

  if (!role.active) {
    throw new Error(
      "El rol seleccionado está inactivo."
    );
  }

  const isManager = role.code === "manager";

  let createdUser;

  try {
    createdUser = await createAuthUser({
      email: input.email,
      phone: input.phone || undefined,
      password: input.password,
      fullName: input.fullName,
      accountType: isManager ? "manager" : "admin",
      ...(isManager
        ? {
            username: input.username?.trim().toLowerCase(),
            carnet: input.carnet?.trim(),
          }
        : {}),
    });

    try {
      await assignRoleToUser(
        createdUser.id,
        input.roleId
      );
    } catch (roleError) {
      console.error(
        "Falló la asignación del rol. Se realizará rollback del usuario Auth.",
        roleError
      );

      await deleteAuthUser(createdUser.id);

      throw new Error(
        "No se pudo asignar el rol al usuario. El usuario no fue creado."
      );
    }

    return await findAuthUserById(createdUser.id);
  } catch (error) {
    throw error;
  }
}



export async function deleteAdminUser(
  userId: string
) {
  const user =
    await findAuthUserById(userId);

  if (!user) {
    throw new Error(
      "Usuario no encontrado."
    );
  }

  if (user.role?.code === "admin") {
    throw new Error(
      "Los usuarios con rol admin no pueden eliminarse desde este módulo."
    );
  }

  const currentUserRole =
    await findUserRoleByUserId(userId);

  try {
    await deleteAuthUser(userId);
  } catch (error) {
    console.error(
      "No se pudo eliminar el usuario de Supabase Auth.",
      error
    );

    throw new Error(
      "No se pudo eliminar el usuario."
    );
  }

  try {
    await removeUserRole(userId);
  } catch (roleError) {
    console.error(
      "El usuario fue eliminado de Auth, pero no se pudo eliminar su relación de rol.",
      roleError
    );
  }

  return {
    id: userId,
    roleId:
      currentUserRole?.role_id ?? null,
  };
}

export async function updateAdminUserStatus(
  userId: string,
  active: boolean
) {
  const user = await findAuthUserById(userId);

  if (!user) {
    throw new Error("Usuario no encontrado.");
  }

  if (user.role?.code === "admin" && !active) {
    throw new Error(
      "El usuario principal con rol admin no puede desactivarse desde este módulo."
    );
  }

  await updateAuthUserStatus(userId, active);

  return await findAuthUserById(userId);
}

export async function updateAdminUser(
  userId: string,
  input: UpdateUserInput
) {
  const user = await findAuthUserById(userId);

  if (!user) {
    throw new Error("Usuario no encontrado.");
  }

  // 1. Actualizar los datos de Supabase Auth
  await updateAuthUser(userId, {
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    password: input.password || undefined,
  });

  // 2. Si roleId no viene, conservamos el rol actual.
  if (input.roleId === undefined) {
    return await findAuthUserById(userId);
  }

  // 3. Si roleId es null, quitamos el rol.
  if (input.roleId === null) {
    await removeUserRole(userId);

    return await findAuthUserById(userId);
  }

  // 4. Si viene un rol, comprobamos que exista y esté activo.
  const newRole = await findRoleById(input.roleId);

  if (!newRole) {
    throw new Error(
      "El rol seleccionado no existe."
    );
  }

  if (!newRole.active) {
    throw new Error(
      "El rol seleccionado está inactivo."
    );
  }

  // 5. Asignar el rol si el usuario no tenía ninguno.
  const currentUserRole =
    await findUserRoleByUserId(userId);

  if (!currentUserRole) {
    await assignRoleToUser(
      userId,
      input.roleId
    );

    return await findAuthUserById(userId);
  }

  // 6. Si ya tiene ese mismo rol, no hacemos nada.
  if (
    currentUserRole.role_id ===
    input.roleId
  ) {
    return await findAuthUserById(userId);
  }

  // 7. Cambiar el rol existente.
  const previousRoleId =
    currentUserRole.role_id;

  await updateUserRole(
    userId,
    input.roleId
  );

  try {
    return await findAuthUserById(userId);
  } catch (error) {
    console.error(
      "Falló la lectura del usuario después de actualizar el rol. Se intentará restaurar el rol anterior.",
      error
    );

    try {
      await updateUserRole(
        userId,
        previousRoleId
      );
    } catch (rollbackError) {
      console.error(
        "No se pudo restaurar el rol anterior:",
        rollbackError
      );
    }

    throw error;
  }
}