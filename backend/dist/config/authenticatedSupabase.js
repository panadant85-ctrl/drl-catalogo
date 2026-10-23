"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessToken = getAccessToken;
exports.getAuthenticatedSupabase = getAuthenticatedSupabase;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("./env");
function getAccessToken(request) {
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
function getAuthenticatedSupabase(request) {
    const token = getAccessToken(request);
    if (!token) {
        return null;
    }
    return (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_ANON_KEY, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
        accessToken: async () => token,
    });
}
