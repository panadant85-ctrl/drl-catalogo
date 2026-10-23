import type { FastifyInstance } from "fastify";

import {
  createManagerController,
  deleteManagerController,
  getManagerByIdController,
  getManagersController,
  getMyManagerCustomerOrdersController,
  getMyManagerCustomersController,
  getMyManagerProfileController,
  updateManagerController,
} from "../controllers/managers/managerController";

export async function managerRoutes(
  app: FastifyInstance
) {
  app.get(
    "/api/managers",
    {
      preHandler: [
        app.authenticate,
        app.requirePermission("managers.view"),
      ],
    },
    getManagersController
  );

  app.get(
          "/api/managers/me",
          {
            preHandler: [app.authenticate],
          }, 
          getMyManagerProfileController
        );

  app.get(
    "/api/managers/me/customers",
    {
      preHandler: [app.authenticate],
    },
    getMyManagerCustomersController
  );


  
  app.get<{
    Params: {
      customerId: string;
    };
  }>(
    "/api/managers/me/customers/:customerId/orders",
    {
      preHandler: [app.authenticate],
    },
    getMyManagerCustomerOrdersController
  );


  app.get(
    "/api/managers/:id",
    {
      preHandler: [
        app.authenticate,
        app.requirePermission("managers.view"),
      ],
    },
    getManagerByIdController
  );

  app.post(
    "/api/managers",
    {
      preHandler: [
        app.authenticate,
        app.requirePermission("managers.manage"),
      ],
    },
    createManagerController
  );

  app.put(
    "/api/managers/:id",
    {
      preHandler: [
        app.authenticate,
        app.requirePermission("managers.manage"),
      ],
    },
    updateManagerController
  );

  app.delete(
    "/api/managers/:id",
    {
      preHandler: [
        app.authenticate,
        app.requirePermission("managers.manage"),
      ],
    },
    deleteManagerController
  );
}