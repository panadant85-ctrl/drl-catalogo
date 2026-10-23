
import { createClient } from "@supabase/supabase-js";
import type { FastifyRequest } from "fastify";

import { env } from "./env";

export function getAccessToken(
  request: FastifyRequest
): string | null {
  const authorization = request.headers.authorization;

  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim() || null;
}

export function getAuthenticatedSupabase(
  request: FastifyRequest
) {
  const token = getAccessToken(request);

  if (!token) {
    return null;
  }

  return createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      accessToken: async () => token,
    }
  );
}

