import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";


import {
  getCustomers,
  getCustomerById,
  createNewCustomer,
  updateExistingCustomer,
  removeCustomer,
  changeCustomerPassword,
} from "../../services/customers/customerService";


import {
  customerIdParamsSchema,
  createCustomerSchema,
  updateCustomerSchema,
} from "../../validators/customers/customerValidator";

import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../../validators/customers/customerValidator";

export async function getCustomersController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const customers = await getCustomers();

  return reply.send({
    success: true,
    data: customers,
  });
}

export async function getCustomerByIdController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  const paramsResult =
    customerIdParamsSchema.safeParse(
      request.params
    );

  if (!paramsResult.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "ValidationError",
      message:
        "El ID del cliente no es válido.",
      details: paramsResult.error.issues,
    });
  }

  const customer =
    await getCustomerById(
      paramsResult.data.id
    );

  if (!customer) {
    return reply.status(404).send({
      success: false,
      statusCode: 404,
      error: "Not Found",
      message:
        "El cliente no existe.",
    });
  }

  return reply.send({
    success: true,
    data: customer,
  });
}

export async function createCustomerController(
  request: FastifyRequest<{
    Body: CreateCustomerInput;
  }>,
  reply: FastifyReply
) {
  const bodyResult =
    createCustomerSchema.safeParse(
      request.body
    );

  if (!bodyResult.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "ValidationError",
      message:
        "Los datos del cliente no son válidos.",
      details: bodyResult.error.issues,
    });
  }

  const customer =
    await createNewCustomer(
      bodyResult.data
    );

  return reply.status(201).send({
    success: true,
    message:
      "Cliente creado correctamente.",
    data: customer,
  });
}

export async function updateCustomerController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
    Body: UpdateCustomerInput;
  }>,
  reply: FastifyReply
) {
  const paramsResult =
    customerIdParamsSchema.safeParse(
      request.params
    );

  if (!paramsResult.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "ValidationError",
      message:
        "El ID del cliente no es válido.",
      details: paramsResult.error.issues,
    });
  }

  const bodyResult =
    updateCustomerSchema.safeParse(
      request.body
    );

  if (!bodyResult.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "ValidationError",
      message:
        "Los datos del cliente no son válidos.",
      details: bodyResult.error.issues,
    });
  }

  const customer =
    await updateExistingCustomer(
      paramsResult.data.id,
      bodyResult.data
    );

  if (!customer) {
    return reply.status(404).send({
      success: false,
      statusCode: 404,
      error: "Not Found",
      message:
        "El cliente no existe.",
    });
  }

  return reply.send({
    success: true,
    message:
      "Cliente actualizado correctamente.",
    data: customer,
  });
}

export async function deleteCustomerController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  const paramsResult =
    customerIdParamsSchema.safeParse(
      request.params
    );

  if (!paramsResult.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "ValidationError",
      message:
        "El ID del cliente no es válido.",
      details: paramsResult.error.issues,
    });
  }

  const customer =
    await removeCustomer(
      paramsResult.data.id
    );

  if (!customer) {
    return reply.status(404).send({
      success: false,
      statusCode: 404,
      error: "Not Found",
      message:
        "El cliente no existe.",
    });
  }

  return reply.send({
    success: true,
    message:
      "Cliente eliminado correctamente.",
    data: customer,
  });
}


export async function changeCustomerPasswordController(
  request: FastifyRequest<{
    Params: { id: string };
    Body: { password: string };
  }>,
  reply: FastifyReply
) {
  const customerId = Number(request.params.id);
  const { password } = request.body;

  if (
    !Number.isInteger(customerId) ||
    customerId <= 0
  ) {
    return reply.status(400).send({
      success: false,
      message: "El ID del cliente no es válido.",
    });
  }

  if (
    typeof password !== "string" ||
    password.length < 8
  ) {
    return reply.status(400).send({
      success: false,
      message:
        "La contraseña debe tener al menos 8 caracteres.",
    });
  }

  try {
    await changeCustomerPassword(
      customerId,
      password
    );

    return reply.send({
      success: true,
      message:
        "La contraseña del cliente se actualizó correctamente.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo cambiar la contraseña.";

    const statusCode =
      message === "El cliente no existe." ||
      message ===
        "Este cliente no tiene una cuenta de usuario asociada."
        ? 404
        : 400;

    return reply.status(statusCode).send({
      success: false,
      message,
    });
  }
}
