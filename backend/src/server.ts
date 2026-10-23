import "dotenv/config";

import Fastify from "fastify";
import multipart from "@fastify/multipart";

import { productRoutes } from "./routes/products";
import { customerRoutes } from "./routes/customers";
import { authRoutes } from "./routes/auth";
import { permissionsTestRoutes } from "./routes/permissions-test";
import { orderRoutes } from "./routes/orders";
import { managerRoutes } from "./routes/managers";
import { roleRoutes } from "./routes/roles";
import { cartRoutes } from "./routes/cart";
import { supplierRoutes } from "./routes/suppliers";
import brandRoutes from "./routes/brands";
import categoryRoutes from "./routes/categories";
import { userRoutes } from "./routes/users";

import securityPlugin from "./plugins/security";
import swaggerPlugin from "./plugins/swagger";
import rateLimitPlugin from "./plugins/rateLimit";
import errorHandlerPlugin from "./plugins/errorHandler";

import authPlugin from "./middlewares/auth";
import permissionsPlugin from "./middlewares/permissions";

import { env } from "./config/env";

const app = Fastify({
  logger: true,
});

async function start() {

  await app.register(securityPlugin);
  await app.register(rateLimitPlugin);
  await app.register(swaggerPlugin);
  await app.register(errorHandlerPlugin);
  await app.register(authPlugin);
  await app.register(permissionsPlugin);
  await app.register(userRoutes);

  await app.register(multipart, {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    });

  await app.register(authRoutes);
  await app.register(permissionsTestRoutes);
  await app.register(productRoutes);
  await app.register(customerRoutes);
  await app.register(orderRoutes);
  await app.register(cartRoutes);
  await app.register(managerRoutes);
  await app.register(roleRoutes);
  await app.register(supplierRoutes);
  await app.register(brandRoutes);
  await app.register(categoryRoutes);
  
  

  app.get(
  "/api/health",
  {
    config: {
      rateLimit: false,
    },
  },
  async () => {
    return {
      success: true,
      service: "DRL Electronik API",
      status: "online",
      timestamp: new Date().toISOString(),
    };
  });

  try {
    await app.listen({
      port: env.PORT,
      host: "0.0.0.0",
    });

    console.log("======================================");
    console.log(" DRL ELECTRONIK API");
    console.log(` Backend: http://localhost:${env.PORT}`);
    console.log(
      ` Health:  http://localhost:${env.PORT}/api/health`
    );
    console.log(
      ` Swagger: http://localhost:${env.PORT}/docs`
    );
    console.log("======================================");
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();