import fp from "fastify-plugin";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { env } from "../config/env";

export default fp(async (app) => {
  await app.register(helmet, {
    global: true,
  });

  await app.register(cors, {
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
  });
});