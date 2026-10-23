"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  loginCustomer,
  checkAdminAccess,
} from "@/lib/api";

import styles from "./AdminLogin.module.css";

const ADMIN_SESSION_KEY = "drl_electronik_admin_session";

type AdminSession = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number | null;
  expiresIn?: number | null;
  user?: {
    id?: string;
    email?: string | null;
  };
};

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      // =====================================================
      // 1. AUTENTICAR USUARIO
      // =====================================================

      const loginResult = await loginCustomer({
        email: email.trim(),
        password,
      });

      const accessToken =
        loginResult?.session?.accessToken;

      if (!accessToken) {
        throw new Error(
          "No se recibió un token de autenticación."
        );
      }

      // =====================================================
      // 2. VERIFICAR ACCESO ADMINISTRATIVO
      // =====================================================

      const adminResult =
        await checkAdminAccess(accessToken);

      if (!adminResult?.hasAdminAccess) {
            throw new Error(
              "No tienes permisos para acceder al panel administrativo."
            );
          }

      // =====================================================
      // 3. GUARDAR SESIÓN ADMINISTRATIVA
      // =====================================================

      const adminSession: AdminSession = {
        accessToken,
        refreshToken:
          loginResult?.session?.refreshToken,
        expiresAt:
          loginResult?.session?.expiresAt ?? null,
        expiresIn:
          loginResult?.session?.expiresIn ?? null,
        user: loginResult?.user
          ? {
              id: loginResult.user.id,
              email: loginResult.user.email,
            }
          : undefined,
      };

      localStorage.setItem(
        ADMIN_SESSION_KEY,
        JSON.stringify(adminSession)
      );

      // =====================================================
      // 4. ENTRAR AL DASHBOARD
      // =====================================================

      router.push("/admin");
    } catch (error) {
      console.error(
        "Error en acceso administrativo:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.loginCard}>
        <div className={styles.logoArea}>
          <div className={styles.logoMark}>
            DRL
          </div>

          <div className={styles.logoText}>
            <strong>DRL Electronik</strong>
            <span>
              Panel administrativo
            </span>
          </div>
        </div>

        <div className={styles.heading}>
          <h1>
            Acceso administrativo
          </h1>

          <p>
            Introduce tus credenciales para
            continuar.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={styles.form}
        >
          <div className={styles.field}>
            <label htmlFor="email">
              Correo electrónico
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="admin@drlelectronik.com"
              disabled={loading}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">
              Contraseña
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div
              role="alert"
              style={{
                padding: "10px 12px",
                borderRadius: "5px",
                border:
                  "1px solid #f1c7c7",
                background: "#fff5f5",
                color: "#c0392b",
                fontSize: "12px",
                lineHeight: "1.5",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading
              ? "Verificando..."
              : "Entrar"}
          </button>
        </form>

        <p className={styles.securityNotice}>
          Acceso restringido al personal autorizado.
        </p>
      </section>
    </main>
  );
}