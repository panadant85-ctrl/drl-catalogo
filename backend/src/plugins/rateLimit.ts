import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";

export default fp(
  async (app) => {
    await app.register(rateLimit, {
      max: 120,
      timeWindow: "1 minute",

      errorResponseBuilder: (_request, context) => {
        return {
          success: false,
          error: "Too Many Requests",
          message: `Demasiadas solicitudes. Intenta nuevamente en ${context.after}.`,
          retryAfter: context.after,
        };
      },
    });
  },
  {
    name: "rate-limit",
    fastify: "5.x",
  }
);