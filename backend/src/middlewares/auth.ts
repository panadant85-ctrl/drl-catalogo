import fp from "fastify-plugin";
import type { FastifyReply, FastifyRequest } from "fastify";
import { supabase } from "../config/supabase";

export interface AuthenticatedUser {
  id: string;
  email: string | null;
}

declare module "fastify" {
  interface FastifyRequest {
    authenticatedUser: AuthenticatedUser | null;
  }
}

async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authorization = request.headers.authorization;

  if (!authorization) {
    return reply.status(401).send({
      success: false,
      statusCode: 401,
      error: "Unauthorized",
      message: "Falta el token de autenticación.",
    });
  }

  const [scheme, token] = authorization.split(" ");
  

  if (
    scheme?.toLowerCase() !== "bearer" ||
    !token
  ) {
    return reply.status(401).send({
      success: false,
      statusCode: 401,
      error: "Unauthorized",
      message: "El formato del token no es válido.",
    });
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    request.log.warn(
      {
        error: error?.message,
        method: request.method,
        url: request.url,
      },
      "Invalid authentication token"
    );

    return reply.status(401).send({
      success: false,
      statusCode: 401,
      error: "Unauthorized",
      message: "La sesión no es válida o ha expirado.",
    });
  }

  request.authenticatedUser = {
    id: user.id,
    email: user.email ?? null,
  };
}

export default fp(
  async (app) => {
    app.decorateRequest(
      "authenticatedUser",
      null
    );

    app.decorate(
      "authenticate",
      authenticate
    );
  },
  {
    name: "authentication",
    fastify: "5.x",
  }
);

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<unknown>;
  }
}