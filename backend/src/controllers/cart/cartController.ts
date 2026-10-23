import type { FastifyReply, FastifyRequest } from "fastify";

import {
  getCustomerCart,
  addItemToCart,
  updateCustomerCartItem,
  removeItemFromCart,
  clearCustomerCart,
} from "../../services/cart/cartService";

function getAuthenticatedUserId(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.authenticatedUser?.id;

  if (!userId) {
    reply.status(401).send({
      success: false,
      statusCode: 401,
      error: "Unauthorized",
      message: "El usuario no está autenticado.",
    });

    return null;
  }

  return userId;
}

export async function getCartController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = getAuthenticatedUserId(
    request,
    reply
  );

  if (!userId) {
    return;
  }

  try {
     
     const items = await getCustomerCart(userId);
        return reply.send({
      success: true,
      data: items,
    });
  } catch (error) {
    request.log.error(
      error,
      "Error al obtener el carrito"
    );

    return reply.status(500).send({
      success: false,
      statusCode: 500,
      error: "Internal Server Error",
      message: "No se pudo obtener el carrito.",
    });
  }
}

export async function addCartItemController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = getAuthenticatedUserId(
    request,
    reply
  );

  if (!userId) {
    return;
  }

  const body = request.body as {
    product_id?: number;
    quantity?: number;
    variant?: string | null;
  };

  const productId = Number(body?.product_id);
  const quantity = Number(body?.quantity);

  const variant =
    body?.variant === undefined ||
    body?.variant === null
      ? null
      : String(body.variant);

  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message: "El product_id no es válido.",
    });
  }

  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message:
        "La cantidad debe ser un número entero mayor que cero.",
    });
  }

  try {
    const item = await addItemToCart(
      userId,
      productId,
      quantity,
      variant
    );

    return reply.status(201).send({
      success: true,
      message: "Producto agregado al carrito.",
      data: item,
    });
  } catch (error) {
    request.log.error(
      error,
      "Error al agregar producto al carrito"
    );

    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo agregar el producto al carrito.",
    });
  }
}

export async function updateCartItemController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = getAuthenticatedUserId(
    request,
    reply
  );

  if (!userId) {
    return;
  }

  const body = request.body as {
    product_id?: number;
    quantity?: number;
    variant?: string | null;
  };

  const productId = Number(body?.product_id);
  const quantity = Number(body?.quantity);

  const variant =
    body?.variant === undefined ||
    body?.variant === null
      ? null
      : String(body.variant);

  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message: "El product_id no es válido.",
    });
  }

  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message:
        "La cantidad debe ser un número entero mayor que cero.",
    });
  }

  try {
    const item =
      await updateCustomerCartItem(
        userId,
        productId,
        quantity,
        variant
      );

    if (!item) {
      return reply.status(404).send({
        success: false,
        statusCode: 404,
        error: "Not Found",
        message:
          "El producto no existe en el carrito.",
      });
    }

    return reply.send({
      success: true,
      message: "Cantidad actualizada.",
      data: item,
    });
  } catch (error) {
    request.log.error(
      error,
      "Error al actualizar producto del carrito"
    );

    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el carrito.",
    });
  }
}

export async function removeCartItemController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = getAuthenticatedUserId(
    request,
    reply
  );

  if (!userId) {
    return;
  }

  const body = request.body as {
    product_id?: number;
    variant?: string | null;
  };

  const productId = Number(body?.product_id);

  const variant =
    body?.variant === undefined ||
    body?.variant === null
      ? null
      : String(body.variant);

  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message: "El product_id no es válido.",
    });
  }

  try {
    const item = await removeItemFromCart(
      userId,
      productId,
      variant
    );

    if (!item) {
      return reply.status(404).send({
        success: false,
        statusCode: 404,
        error: "Not Found",
        message:
          "El producto no existe en el carrito.",
      });
    }

    return reply.send({
      success: true,
      message: "Producto eliminado del carrito.",
      data: item,
    });
  } catch (error) {
    request.log.error(
      error,
      "Error al eliminar producto del carrito"
    );

    return reply.status(400).send({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el producto.",
    });
  }
}

export async function clearCartController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = getAuthenticatedUserId(
    request,
    reply
  );

  if (!userId) {
    return;
  }

  try {
    await clearCustomerCart(userId);

    return reply.send({
      success: true,
      message: "Carrito vaciado correctamente.",
    });
  } catch (error) {
    request.log.error(
      error,
      "Error al vaciar el carrito"
    );

    return reply.status(500).send({
      success: false,
      statusCode: 500,
      error: "Internal Server Error",
      message: "No se pudo vaciar el carrito.",
    });
  }
}