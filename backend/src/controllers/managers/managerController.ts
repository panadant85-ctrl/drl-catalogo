import type { FastifyReply, FastifyRequest } from "fastify";

import {
  createManagerSchema,
  managerIdParamsSchema,
  updateManagerSchema,
} from "../../validators/managers/managerValidator";

import {
  createNewManager,
  getManagerById,
  getManagerByAuthUserId,
  getManagers,
  removeManager,
  updateExistingManager,
} from "../../services/managers/managerService";
import { supabaseAdmin } from "../../config/supabase";

import { getCustomersByManagerId } from "../../services/customers/customerService";

import { getOrdersByCustomerId } from "../../services/orders/orderService";


export async function getManagersController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const managers = await getManagers();

  return reply.send({
    success: true,
    data: managers,
  });
}


export async function getMyManagerProfileController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authUserId =
    request.authenticatedUser?.id;

  if (!authUserId) {
    return reply.status(401).send({
      success: false,
      statusCode: 401,
      error: "Unauthorized",
      message: "No se pudo identificar al usuario.",
    });
  }

  const {
        data: userRole,
        error: userRoleError,
      } = await supabaseAdmin
        .from("user_roles")
        .select(`
          roles (
            code,
            active
          )
        `)
        .eq("user_id", authUserId)
        .maybeSingle();

      if (userRoleError) {
        request.log.error(
          userRoleError,
          "Error verificando el rol del gestor"
        );

        return reply.status(500).send({
          success: false,
          statusCode: 500,
          error: "RoleCheckError",
          message: "No se pudo verificar el rol del usuario.",
        });
      }

      const role = Array.isArray(userRole?.roles)
        ? userRole.roles[0] ?? null
        : userRole?.roles ?? null;

      if (role?.code !== "manager" || !role.active) {
        return reply.status(403).send({
          success: false,
          statusCode: 403,
          error: "Forbidden",
          message: "No tienes permiso para acceder al perfil de gestor.",
        });
      }
  const manager =
    await getManagerByAuthUserId(authUserId);

      if (!manager) {
        return reply.status(404).send({
          success: false,
          statusCode: 404,
          error: "Not Found",
          message: "No existe un perfil de gestor asociado a esta cuenta.",
        });
      }

        // Bloquear el acceso si la cuenta del gestor está inactiva.
      if (manager.active !== true) {
        return reply.status(403).send({
          success: false,
          statusCode: 403,
          error: "ManagerInactive",
          message:
            "Tu cuenta de gestor está inactiva. Contacta con el administrador.",
        });
      }
      
  return reply.send({
    success: true,
    data: manager,
  });
}


export async function getMyManagerCustomerOrdersController(
  request: FastifyRequest<{
    Params: {
      customerId: string;
    };
  }>,
  reply: FastifyReply
) {
  const authUserId = request.authenticatedUser?.id;

  if (!authUserId) {
    return reply.status(401).send({
      success: false,
      statusCode: 401,
      error: "Unauthorized",
      message: "No se pudo identificar al usuario.",
    });
  }

  const customerId = Number(request.params.customerId);

  if (
    !Number.isSafeInteger(customerId) ||
    customerId <= 0
  ) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "ValidationError",
      message: "El ID del cliente no es válido.",
    });
  }

  const { data: userRole, error: userRoleError } =
    await supabaseAdmin
      .from("user_roles")
      .select(`
        roles (
          code,
          active
        )
      `)
      .eq("user_id", authUserId)
      .maybeSingle();

  if (userRoleError) {
    request.log.error(
      userRoleError,
      "Error verificando el rol del gestor"
    );

    return reply.status(500).send({
      success: false,
      statusCode: 500,
      error: "RoleCheckError",
      message: "No se pudo verificar el rol del usuario.",
    });
  }

  const role = Array.isArray(userRole?.roles)
    ? userRole.roles[0] ?? null
    : userRole?.roles ?? null;

  if (role?.code !== "manager" || !role.active) {
    return reply.status(403).send({
      success: false,
      statusCode: 403,
      error: "Forbidden",
      message: "No tienes permiso para consultar estos pedidos.",
    });
  }

  try {
    const manager = await getManagerByAuthUserId(authUserId);

    if (!manager) {
      return reply.status(404).send({
        success: false,
        statusCode: 404,
        error: "Not Found",
        message: "No existe un perfil de gestor asociado a esta cuenta.",
      });
    }

    if (manager.active !== true) {
      return reply.status(403).send({
        success: false,
        statusCode: 403,
        error: "ManagerInactive",
        message: "Tu cuenta de gestor está inactiva.",
      });
    }

    const customers = await getCustomersByManagerId(manager.id);

    const belongsToManager = customers.some(
      (customer) => customer.id === customerId
    );

    if (!belongsToManager) {
      return reply.status(404).send({
        success: false,
        statusCode: 404,
        error: "Not Found",
        message: "El cliente no existe o no está asociado a tu cuenta.",
      });
    }

    const orders = await getOrdersByCustomerId(customerId);

    return reply.send({
      success: true,
      data: orders,
    });
  } catch (error) {
    request.log.error(
      error,
      "Error obteniendo los pedidos del cliente del gestor"
    );

    return reply.status(500).send({
      success: false,
      statusCode: 500,
      error: "CustomerOrdersFetchError",
      message: "No se pudieron obtener los pedidos del cliente.",
    });
  }
}

export async function getManagerByIdController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsedParams =
    managerIdParamsSchema.safeParse(request.params);

  if (!parsedParams.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message: "El ID del gestor no es válido.",
      details: parsedParams.error.flatten(),
    });
  }

  const manager = await getManagerById(
    parsedParams.data.id
  );

  if (!manager) {
    return reply.status(404).send({
      success: false,
      statusCode: 404,
      error: "Not Found",
      message: "Gestor no encontrado.",
    });
  }

  return reply.send({
    success: true,
    data: manager,
  });
}

export async function createManagerController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsedBody =
    createManagerSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message: "Los datos del gestor no son válidos.",
      details: parsedBody.error.flatten(),
    });
  }

  try {
    const manager = await createNewManager(
      parsedBody.data
    );

    return reply.status(201).send({
      success: true,
      message: "Gestor creado correctamente.",
      data: manager,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "ManagerCreationError",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo crear el gestor.",
    });
  }
}

export async function updateManagerController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsedParams =
    managerIdParamsSchema.safeParse(request.params);

  if (!parsedParams.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message: "El ID del gestor no es válido.",
    });
  }

  const parsedBody =
    updateManagerSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message: "Los datos del gestor no son válidos.",
      details: parsedBody.error.flatten(),
    });
  }

  try {
    const manager =
      await updateExistingManager(
        parsedParams.data.id,
        parsedBody.data
      );

    return reply.send({
      success: true,
      message: "Gestor actualizado correctamente.",
      data: manager,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "ManagerUpdateError",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el gestor.",
    });
  }
}

export async function deleteManagerController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsedParams =
    managerIdParamsSchema.safeParse(request.params);

  if (!parsedParams.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message: "El ID del gestor no es válido.",
    });
  }

  try {
    const manager = await removeManager(
      parsedParams.data.id
    );

    return reply.send({
      success: true,
      message: "Gestor eliminado correctamente.",
      data: manager,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo eliminar el gestor.";

    const statusCode =
      message === "Gestor no encontrado."
        ? 404
        : 400;

    return reply.status(statusCode).send({
      success: false,
      statusCode,
      error:
        statusCode === 404
          ? "Not Found"
          : "ManagerDeleteError",
      message,
    });
  }
}


export async function getMyManagerCustomersController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authUserId = request.authenticatedUser?.id;

  if (!authUserId) {
    return reply.status(401).send({
      success: false,
      statusCode: 401,
      error: "Unauthorized",
      message: "No se pudo identificar al usuario.",
    });
  }

  const { data: userRole, error: userRoleError } =
    await supabaseAdmin
      .from("user_roles")
      .select(`
        roles (
          code,
          active
        )
      `)
      .eq("user_id", authUserId)
      .maybeSingle();

  if (userRoleError) {
    request.log.error(
      userRoleError,
      "Error verificando el rol del gestor"
    );

    return reply.status(500).send({
      success: false,
      statusCode: 500,
      error: "RoleCheckError",
      message: "No se pudo verificar el rol del usuario.",
    });
  }

  const role = Array.isArray(userRole?.roles)
    ? userRole.roles[0] ?? null
    : userRole?.roles ?? null;

  if (role?.code !== "manager" || !role.active) {
    return reply.status(403).send({
      success: false,
      statusCode: 403,
      error: "Forbidden",
      message: "No tienes permiso para consultar estos clientes.",
    });
  }

  const manager = await getManagerByAuthUserId(authUserId);

  if (!manager) {
    return reply.status(404).send({
      success: false,
      statusCode: 404,
      error: "Not Found",
      message: "No existe un perfil de gestor asociado a esta cuenta.",
    });
  }

  if (manager.active !== true) {
    return reply.status(403).send({
      success: false,
      statusCode: 403,
      error: "ManagerInactive",
      message: "Tu cuenta de gestor está inactiva.",
    });
  }

  try {
    const customers = await getCustomersByManagerId(manager.id);

    return reply.send({
      success: true,
      data: customers,
    });
  } catch (error) {
    request.log.error(
      error,
      "Error obteniendo los clientes del gestor"
    );

    return reply.status(500).send({
      success: false,
      statusCode: 500,
      error: "CustomersFetchError",
      message: "No se pudieron obtener los clientes del gestor.",
    });
  }
}
