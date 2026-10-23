
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginCustomer, checkAdminAccess } from "@/lib/api";
import { savePosSession } from "@/lib/posSession";

export default function PosLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // 1. Autenticar al usuario con Supabase.
      const result = await loginCustomer({
        email: email.trim(),
        password,
      });

      const accessToken = result?.session?.accessToken;

      if (!result?.success || !accessToken || !result?.user?.id) {
        throw new Error("No se pudo iniciar sesión. Verifica tus credenciales.");
      }

      // 2. Consultar el rol real del usuario en el backend.
      const access = await checkAdminAccess(accessToken);

      // 3. Permitir el acceso únicamente al vendedor activo.
      if (
        access?.role?.code !== "vendedor" ||
        access?.role?.active !== true
      ) {
        throw new Error(
          "Acceso denegado. Esta caja está reservada para usuarios con el rol vendedor activo."
        );
      }

      // 4. Guardar la sesión POS, separada de la sesión administrativa.
      savePosSession({
        accessToken,
        refreshToken: result.session.refreshToken,
        expiresAt: result.session.expiresAt,
        user: {
          id: result.user.id,
          email: result.user.email,
          user_metadata: result.user.user_metadata,
        },
      });

      // 5. Entrar en la caja.
      router.replace("/pos");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo iniciar sesión. Inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <section className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="bg-slate-900 px-8 py-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-2xl font-black">
            DRL
          </div>

          <h1 className="text-2xl font-bold">DRL Electronik</h1>

          <p className="mt-2 text-sm text-slate-300">
            Punto de venta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-8">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Acceso de vendedor
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Inicia sesión para acceder a la caja.
            </p>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="vendedor@ejemplo.com"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Introduce tu contraseña"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verificando acceso..." : "ENTRAR A LA CAJA"}
          </button>

          <p className="text-center text-xs text-slate-400">
            Acceso exclusivo para vendedores autorizados.
          </p>
        </form>
      </section>
    </main>
  );
}
