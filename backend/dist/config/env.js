"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
function required(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Falta ${name} en el archivo .env`);
    }
    return value;
}
exports.env = {
    PORT: Number(process.env.PORT || 4000),
    SUPABASE_URL: required("SUPABASE_URL"),
    SUPABASE_ANON_KEY: required("SUPABASE_ANON_KEY"),
    SUPABASE_SERVICE_ROLE_KEY: required("SUPABASE_SERVICE_ROLE_KEY"),
    NODE_ENV: process.env.NODE_ENV || "development",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
};
