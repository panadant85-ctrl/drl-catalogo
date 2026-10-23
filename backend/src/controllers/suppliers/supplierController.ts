import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  getSuppliers,
  getSupplierById,
  createNewSupplier,
  updateExistingSupplier,
  removeSupplier,
} from "../../services/suppliers/supplierService";

import {
  supplierIdParamsSchema,
  createSupplierSchema,
  updateSupplierSchema,
} from "../../validators/suppliers/supplierValidator";

import type {
  CreateSupplierInput,
  UpdateSupplierInput,
} from "../../validators/suppliers/supplierValidator";

export async function getSuppliersController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const suppliers = await getSuppliers();

  return reply.send({
    success: true,
    data: suppliers,
  });
}

export async function getSupplierByIdController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  const paramsResult =
    supplierIdParamsSchema.safeParse(
      request.params
    );

  if (!paramsResult.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "ValidationError",
      message:
        "El ID del proveedor no es válido.",
      details:
        paramsResult.error.issues,
    });
  }

  const supplier =
    await getSupplierById(
      paramsResult.data.id
    );

  if (!supplier) {
    return reply.status(404).send({
      success: false,
      statusCode: 404,
      error: "Not Found",
      message:
        "El proveedor no existe.",
    });
  }

  return reply.send({
    success: true,
    data: supplier,
  });
}

export async function createSupplierController(
  request: FastifyRequest<{
    Body: CreateSupplierInput;
  }>,
  reply: FastifyReply
) {
  const bodyResult =
    createSupplierSchema.safeParse(
      request.body
    );

  if (!bodyResult.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "ValidationError",
      message:
        "Los datos del proveedor no son válidos.",
      details:
        bodyResult.error.issues,
    });
  }

  const supplier =
    await createNewSupplier(
      bodyResult.data
    );

  return reply.status(201).send({
    success: true,
    message:
      "Proveedor creado correctamente.",
    data: supplier,
  });
}

export async function updateSupplierController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };

    Body: UpdateSupplierInput;
  }>,
  reply: FastifyReply
) {
  const paramsResult =
    supplierIdParamsSchema.safeParse(
      request.params
    );

  if (!paramsResult.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "ValidationError",
      message:
        "El ID del proveedor no es válido.",
      details:
        paramsResult.error.issues,
    });
  }

  const bodyResult =
    updateSupplierSchema.safeParse(
      request.body
    );

  if (!bodyResult.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "ValidationError",
      message:
        "Los datos del proveedor no son válidos.",
      details:
        bodyResult.error.issues,
    });
  }

  const supplier =
    await updateExistingSupplier(
      paramsResult.data.id,
      bodyResult.data
    );

  if (!supplier) {
    return reply.status(404).send({
      success: false,
      statusCode: 404,
      error: "Not Found",
      message:
        "El proveedor no existe.",
    });
  }

  return reply.send({
    success: true,
    message:
      "Proveedor actualizado correctamente.",
    data: supplier,
  });
}

export async function deleteSupplierController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  const paramsResult =
    supplierIdParamsSchema.safeParse(
      request.params
    );

  if (!paramsResult.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "ValidationError",
      message:
        "El ID del proveedor no es válido.",
      details:
        paramsResult.error.issues,
    });
  }

  const supplier =
    await removeSupplier(
      paramsResult.data.id
    );

  if (!supplier) {
    return reply.status(404).send({
      success: false,
      statusCode: 404,
      error: "Not Found",
      message:
        "El proveedor no existe.",
    });
  }

  return reply.send({
    success: true,
    message:
      "Proveedor eliminado correctamente.",
    data: supplier,
  });
}