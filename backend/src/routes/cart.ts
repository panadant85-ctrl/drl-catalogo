import type { FastifyInstance } from "fastify";

import {
  getCartController,
  addCartItemController,
  updateCartItemController,
  removeCartItemController,
  clearCartController,
} from "../controllers/cart/cartController";

export async function cartRoutes(
  app: FastifyInstance
) {
  app.get(
    "/api/cart",
    {
      preHandler: [
        app.authenticate,
      ],
    },
    getCartController
  );

  app.post(
    "/api/cart",
    {
      preHandler: [
        app.authenticate,
      ],
    },
    addCartItemController
  );

  app.patch(
    "/api/cart",
    {
      preHandler: [
        app.authenticate,
      ],
    },
    updateCartItemController
  );

  app.delete(
    "/api/cart",
    {
      preHandler: [
        app.authenticate,
      ],
    },
    removeCartItemController
  );

  app.delete(
    "/api/cart/all",
    {
      preHandler: [
        app.authenticate,
      ],
    },
    clearCartController
  );
}