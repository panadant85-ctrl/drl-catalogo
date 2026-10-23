
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  loginCustomer,
  checkAdminAccess,
  saveManagerSession,
  getMyManagerProfile,
} from "@/lib/api";

import styles from "./ManagerLogin.module.css";

export default function ManagerLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const loginResult = await loginCustomer({
        email: email.trim(),
        password,
      });

      const session = loginResult?.session;
      const accessToken = session?.accessToken;
      const refreshToken = session?.refreshToken;

      if (!accessToken || !refreshToken) {
        throw new Error(
          "No se recibió una sesión válida."
        );
      }

      const accessResult =
        await checkAdminAccess(accessToken);

      const role = accessResult?.role;

      if (
        role?.code !== "manager" ||
        role?.active !== true
      ) {
        throw new Error(
          "Esta cuenta no tiene acceso activo al panel de gestores."
        );
      }

    
    const managerProfile =
            await getMyManagerProfile(accessToken);

            if (managerProfile?.data?.active !== true) {
            throw new Error(
                "Tu cuenta de gestor está inactiva. Contacta con el administrador."
            );
            }

            saveManagerSession({
            accessToken,
            refreshToken,
            expiresAt: session?.expiresAt,
            expiresIn: session?.expiresIn,
            });


      router.replace("/manager");
    } catch (err) {
      console.error(
        "Error en el acceso del gestor:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.loginCard}>
        <header className={styles.logoArea}>
          <div className={styles.logoMark}>DRL</div>

          <div className={styles.logoText}>
            <strong>DRL Electronik</strong>
            <span>Panel de gestores</span>
          </div>
        </header>

        <div className={styles.heading}>
          <h1>Acceso de gestores</h1>

          <p>
            Introduce tus credenciales para continuar.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={styles.form}
        >
          <div className={styles.field}>
            <label htmlFor="manager-email">
              Correo electrónico
            </label>

            <input
              id="manager-email"
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="gestor@ejemplo.com"
              disabled={loading}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="manager-password">
              Contraseña
            </label>

            <input
              id="manager-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Tu contraseña"
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div
              className={styles.error}
              role="alert"
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
              : "Entrar al panel"}
          </button>
        </form>

        <p className={styles.securityNotice}>
          Acceso exclusivo para gestores autorizados.
        </p>
      </section>
    </main>
  );
}
