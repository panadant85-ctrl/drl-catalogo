"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { checkAdminAccess } from "@/lib/api";
import {
  hasAnyAdminPermission,
  type AdminAccess,
} from "@/lib/adminPermissions";

const ADMIN_SESSION_KEY =
  "drl_electronik_admin_session";

type AdminPermissionGuardProps = {
  children: ReactNode;
  permissions: string[];
};

export default function AdminPermissionGuard({
  children,
  permissions,
}: AdminPermissionGuardProps) {
  const router = useRouter();

  const [checking, setChecking] =
    useState(true);

  const [allowed, setAllowed] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifyAccess() {
      try {
        const savedSession =
          localStorage.getItem(
            ADMIN_SESSION_KEY
          );

        if (!savedSession) {
          router.replace("/admin/login");
          return;
        }

        const parsedSession =
          JSON.parse(savedSession);

        const accessToken =
          parsedSession?.accessToken;

        const expiresAt =
          parsedSession?.expiresAt;

        if (!accessToken) {
          localStorage.removeItem(
            ADMIN_SESSION_KEY
          );

          router.replace("/admin/login");
          return;
        }

        if (
          expiresAt &&
          Date.now() >=
            Number(expiresAt) * 1000
        ) {
          localStorage.removeItem(
            ADMIN_SESSION_KEY
          );

          router.replace("/admin/login");
          return;
        }

        const result =
          await checkAdminAccess(
            accessToken
          );

        if (cancelled) {
          return;
        }

        const access: AdminAccess = {
          isAdmin:
            Boolean(result?.isAdmin),

          hasAdminAccess:
            Boolean(
              result?.hasAdminAccess
            ),

          role:
            result?.role || null,

          permissions:
            Array.isArray(
              result?.permissions
            )
              ? result.permissions
              : [],
        };

        /*
         * Si dejó de tener acceso administrativo,
         * vuelve al login.
         */
        if (!access.hasAdminAccess) {
          localStorage.removeItem(
            ADMIN_SESSION_KEY
          );

          router.replace("/admin/login");
          return;
        }

        /*
         * Administrador puede acceder a todo.
         */
        if (access.isAdmin) {
          setAllowed(true);
          setChecking(false);
          return;
        }

        /*
         * Verifica que tenga al menos uno
         * de los permisos requeridos.
         */
        const hasPermission =
          hasAnyAdminPermission(
            access,
            permissions
          );

        if (!hasPermission) {
          router.replace("/admin");
          return;
        }

        setAllowed(true);
        setChecking(false);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Error verificando permisos de la ruta:",
          error
        );

        localStorage.removeItem(
          ADMIN_SESSION_KEY
        );

        router.replace("/admin/login");
      }
    }

    verifyAccess();

    return () => {
      cancelled = true;
    };
  }, [router, permissions]);

  if (checking || !allowed) {
    return null;
  }

  return <>{children}</>;
}