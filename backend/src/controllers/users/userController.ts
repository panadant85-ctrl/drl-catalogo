import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  createAdminUser,
  deleteAdminUser,
  getAdminUserById,
  getAdminUsers,
  getAvailableRoles,
  getUserRole,
  updateAdminUser,
  updateAdminUserStatus,
} from "../../services/users/userService";

import {
  createUserSchema,
  updateUserSchema,
  userIdParamsSchema,
  type UserIdParams,
} from "../../validators/users/userValidator";

export async function getUsersController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const users = await getAdminUsers();

    return reply.send({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error(
      "Error obteniendo usuarios administrativos:",
      error
    );

    return reply.status(500).send({
      success: false,
      message:
        "No se pudieron obtener los usuarios.",
    });
  }
}

export async function getUserByIdController(
  request: FastifyRequest<{
    Params: UserIdParams;
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;

    const user =
      await getAdminUserById(id);

    return reply.send({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(
      "Error obteniendo usuario administrativo:",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "Usuario no encontrado."
    ) {
      return reply.status(404).send({
        success: false,
        message:
          "Usuario no encontrado.",
      });
    }

    return reply.status(500).send({
      success: false,
      message:
        "No se pudo obtener el usuario.",
    });
  }
}

export async function getUserRolesController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const roles =
      await getAvailableRoles();

    return reply.send({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error(
      "Error obteniendo roles disponibles:",
      error
    );

    return reply.status(500).send({
      success: false,
      message:
        "No se pudieron obtener los roles.",
    });
  }
}

export async function getUserRoleController(
  request: FastifyRequest<{
    Params: UserIdParams;
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;

    const role =
      await getUserRole(id);

    return reply.send({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error(
      "Error obteniendo rol del usuario:",
      error
    );

    return reply.status(500).send({
      success: false,
      message:
        "No se pudo obtener el rol del usuario.",
    });
  }
}

export async function createUserController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const validation =
      createUserSchema.safeParse(
        request.body
      );

    if (!validation.success) {
      return reply.status(400).send({
        success: false,
        message:
          "Los datos del usuario no son válidos.",
        errors:
          validation.error.flatten(),
      });
    }

    const user =
      await createAdminUser(
        validation.data
      );

    return reply.status(201).send({
      success: true,
      message:
        "Usuario creado correctamente.",
      data: user,
    });
  } catch (error) {
    console.error(
      "Error creando usuario administrativo:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "No se pudo crear el usuario.";

    if (
      message ===
        "El rol seleccionado no existe." ||
      message ===
        "El rol seleccionado está inactivo." ||
      message ===
        "No se pudo asignar el rol al usuario. El usuario no fue creado."
    ) {
      return reply.status(400).send({
        success: false,
        message,
      });
    }

    if (
      message
        .toLowerCase()
        .includes("already registered") ||
      message
        .toLowerCase()
        .includes("already exists")
    ) {
      return reply.status(409).send({
        success: false,
        message:
          "Ya existe un usuario con ese correo.",
      });
    }

    return reply.status(500).send({
      success: false,
      message:
        "No se pudo crear el usuario.",
    });
  }
}

export async function updateUserController(
  request: FastifyRequest<{
    Params: UserIdParams;
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;

    const validation =
      updateUserSchema.safeParse(
        request.body
      );

    if (!validation.success) {
      return reply.status(400).send({
        success: false,
        message:
          "Los datos del usuario no son válidos.",
        errors:
          validation.error.flatten(),
      });
    }

    const user =
      await updateAdminUser(
        id,
        validation.data
      );

    return reply.send({
      success: true,
      message:
        "Usuario actualizado correctamente.",
      data: user,
    });
  } catch (error) {
    console.error(
      "Error actualizando usuario administrativo:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "No se pudo actualizar el usuario.";

    if (
      message ===
      "Usuario no encontrado."
    ) {
      return reply.status(404).send({
        success: false,
        message,
      });
    }

    if (
      message ===
        "El rol seleccionado no existe." ||
      message ===
        "El rol seleccionado está inactivo."
    ) {
      return reply.status(400).send({
        success: false,
        message,
      });
    }

    return reply.status(500).send({
      success: false,
      message:
        "No se pudo actualizar el usuario.",
    });
  }
}

export async function deleteUserController(
  request: FastifyRequest<{
    Params: UserIdParams;
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;

    await deleteAdminUser(id);

    return reply.send({
      success: true,
      message:
        "Usuario eliminado correctamente.",
    });
  } catch (error) {
    console.error(
      "Error eliminando usuario administrativo:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "No se pudo eliminar el usuario.";

    if (
      message ===
      "Usuario no encontrado."
    ) {
      return reply.status(404).send({
        success: false,
        message,
      });
    }

    if (
      message ===
        "Los usuarios con rol admin no pueden eliminarse desde este módulo."
    ) {
      return reply.status(403).send({
        success: false,
        message,
      });
    }

    if (
      message ===
      "No se pudo eliminar el usuario."
    ) {
      return reply.status(500).send({
        success: false,
        message,
      });
    }

    return reply.status(500).send({
      success: false,
      message:
        "No se pudo eliminar el usuario.",
    });
  }
}
export async function updateUserStatusController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = userIdParamsSchema.parse(
      request.params
    );

    const body = request.body as {
      active?: unknown;
    };

    if (typeof body.active !== "boolean") {
      return reply.status(400).send({
        message:
          "El estado activo debe ser verdadero o falso.",
      });
    }

    const user =
      await updateAdminUserStatus(
        id,
        body.active
      );

    return reply.send({
      message: body.active
        ? "Usuario activado correctamente."
        : "Usuario desactivado correctamente.",
      data: user,
    });
  } catch (error) {
    console.error(
      "Error actualizando el estado del usuario:",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "Usuario no encontrado."
    ) {
      return reply.status(404).send({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message.includes(
        "no puede desactivarse"
      )
    ) {
      return reply.status(403).send({
        message: error.message,
      });
    }

    return reply.status(500).send({
        message:
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el estado del usuario.",
          });
  }
}