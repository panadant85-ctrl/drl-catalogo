import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  getOrders,
  getOrderById,
  createNewOrder,
  createNewPosOrder,
  changeOrderStatus,
  removeOrder,
} from "../../services/orders/orderService";

import {
  orderIdParamsSchema,
  createOrderSchema,
  createPosOrderSchema,
  updateOrderStatusSchema,
} from "../../validators/orders/orderValidator";

import type {
  CreateOrderInput,
  CreatePosOrderInput,
  UpdateOrderStatusInput,
} from "../../validators/orders/orderValidator";


export async function getOrdersController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const orders = await getOrders(request);

  return reply.send({
    success: true,
    data: orders,
  });
}

export async function getOrderByIdController(
  request: FastifyRequest<{
    Params: { id: string };
  }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return reply.status(400).send({
      success: false,
      message: "El ID del pedido no es válido.",
    });
  }

  const result = await getOrderById(id, request);

  if (!result) {
    return reply.status(404).send({
      success: false,
      message: "Pedido no encontrado.",
    });
  }

  return reply.send({
    success: true,
    data: result.order,
    items: result.items,
  });
}

export async function createOrderController(
  request: FastifyRequest<{
    Body: CreateOrderInput;
  }>,
  reply: FastifyReply
) {
  const bodyResult =
    createOrderSchema.safeParse(
      request.body
    );

  if (!bodyResult.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "ValidationError",
      message:
        "Los datos del pedido no son válidos.",
      details:
        bodyResult.error.issues,
    });
  }

  try {
    const result =
      await createNewOrder(
        bodyResult.data
      );

    return reply.status(201).send({
      success: true,
      message:
        "Pedido creado correctamente.",
      data: result.order,
      items: result.items,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo crear el pedido.";

    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "OrderCreationError",
      message,
    });
  }
}

export async function createPosOrderController(
  request: FastifyRequest<{
    Body: CreatePosOrderInput;
  }>,
  reply: FastifyReply
) {
  const bodyResult =
    createPosOrderSchema.safeParse(request.body);

  if (!bodyResult.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "ValidationError",
      message:
        "Los datos de la venta POS no son válidos.",
      details: bodyResult.error.issues,
    });
  }

  try {
    const result =
      await createNewPosOrder(
        bodyResult.data
      );

    return reply.status(201).send({
      success: true,
      message:
        "Venta POS registrada correctamente.",
      data: result.order,
      items: result.items,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo registrar la venta POS.";

      
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "PosOrderCreationError",
      message,
    });
  }
}

export async function updateOrderStatusController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
    Body: UpdateOrderStatusInput;
  }>,
  reply: FastifyReply
) {
  const paramsResult =
    orderIdParamsSchema.safeParse(
      request.params
    );

  if (!paramsResult.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "ValidationError",
      message:
        "El ID del pedido no es válido.",
      details:
        paramsResult.error.issues,
    });
  }

  const bodyResult =
    updateOrderStatusSchema.safeParse(
      request.body
    );

  if (!bodyResult.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "ValidationError",
      message:
        "El estado del pedido no es válido.",
      details:
        bodyResult.error.issues,
    });
  }

  const order =
    await changeOrderStatus(
      paramsResult.data.id,
      bodyResult.data.status
    );

  if (!order) {
    return reply.status(404).send({
      success: false,
      statusCode: 404,
      error: "Not Found",
      message:
        "El pedido no existe.",
    });
  }

  return reply.send({
    success: true,
    message:
      "Estado del pedido actualizado correctamente.",
    data: order,
  });
}

export async function deleteOrderController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  const paramsResult =
    orderIdParamsSchema.safeParse(
      request.params
    );

  if (!paramsResult.success) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "ValidationError",
      message:
        "El ID del pedido no es válido.",
      details:
        paramsResult.error.issues,
    });
  }

  const order =
    await removeOrder(
      paramsResult.data.id
    );

  if (!order) {
    return reply.status(404).send({
      success: false,
      statusCode: 404,
      error: "Not Found",
      message:
        "El pedido no existe.",
    });
  }

  return reply.send({
    success: true,
    message:
      "Pedido eliminado correctamente.",
    data: order,
  });
}