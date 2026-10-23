import type { FastifyReply, FastifyRequest } from "fastify";

import {
  roleIdParamsSchema,
  createRoleSchema,
  updateRoleSchema,
} from "../../validators/roles/roleValidator";

import {
  getRoles,
  getRoleById,
  createNewRole,
  updateExistingRole,
  removeRole,
} from "../../services/roles/roleService";

export async function getRolesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const roles = await getRoles();

    return reply.send({
      success: true,
      data: roles,
    });
  } catch (error) {
    request.log.error(
      error,
      "Error obteniendo roles"
    );

    return reply.status(500).send({
      success: false,
      statusCode: 500,
      error: "Internal Server Error",
      message: "No se pudieron obtener los roles.",
    });
  }
}

export async function getRoleByIdController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsedParams =
    roleIdParamsSchema.safeParse(request.params);

  if (!parsedParams.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message:
        parsedParams.error.issues[0]?.message ??
        "ID de rol inválido.",
    });
  }

  try {
    const role = await getRoleById(
      parsedParams.data.id
    );

    if (!role) {
      return reply.status(404).send({
        success: false,
        statusCode: 404,
        error: "Not Found",
        message: "El rol no existe.",
      });
    }

    return reply.send({
      success: true,
      data: role,
    });
  } catch (error) {
    request.log.error(
      error,
      "Error obteniendo rol"
    );

    return reply.status(500).send({
      success: false,
      statusCode: 500,
      error: "Internal Server Error",
      message: "No se pudo obtener el rol.",
    });
  }
}

export async function createRoleController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsedBody =
    createRoleSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message:
        parsedBody.error.issues[0]?.message ??
        "Datos del rol inválidos.",
    });
  }

  try {
    const role = await createNewRole(
      parsedBody.data
    );

    return reply.status(201).send({
      success: true,
      data: role,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo crear el rol.";

    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "RoleCreationError",
      message,
    });
  }
}

export async function updateRoleController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsedParams =
    roleIdParamsSchema.safeParse(request.params);

  if (!parsedParams.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message:
        parsedParams.error.issues[0]?.message ??
        "ID de rol inválido.",
    });
  }

  const parsedBody =
    updateRoleSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message:
        parsedBody.error.issues[0]?.message ??
        "Datos del rol inválidos.",
    });
  }

  try {
    const role = await updateExistingRole(
      parsedParams.data.id,
      parsedBody.data
    );

    return reply.send({
      success: true,
      data: role,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo actualizar el rol.";

    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "RoleUpdateError",
      message,
    });
  }
}

export async function deleteRoleController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsedParams =
    roleIdParamsSchema.safeParse(request.params);

  if (!parsedParams.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message:
        parsedParams.error.issues[0]?.message ??
        "ID de rol inválido.",
    });
  }

  try {
    await removeRole(
      parsedParams.data.id
    );

    return reply.send({
      success: true,
      message: "Rol eliminado correctamente.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo eliminar el rol.";

    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "RoleDeletionError",
      message,
    });
  }
}