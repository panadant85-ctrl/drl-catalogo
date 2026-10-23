"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { checkAdminAccess } from "@/lib/api";

const ADMIN_SESSION_KEY =
  "drl_electronik_admin_session";

type AdminRole = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  active: boolean;
};

type AdminAccess = {
  isAdmin: boolean;
  hasAdminAccess: boolean;
  role: AdminRole | null;
  permissions: string[];
};

type AdminContextValue = AdminAccess & {
  loading: boolean;
  hasPermission: (permission: string) => boolean;
};

const AdminContext =
  createContext<AdminContextValue | null>(null);

export function useAdminAccess() {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error(
      "useAdminAccess debe utilizarse dentro de AdminLayout."
    );
  }

  return context;
}

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [access, setAccess] =
    useState<AdminAccess>({
      isAdmin: false,
      hasAdminAccess: false,
      role: null,
      permissions: [],
    });

  useEffect(() => {
    /*
     * La única ruta pública dentro de /admin
     * es /admin/login.
     *
     * Todas las demás rutas quedan protegidas:
     *
     * /admin
     * /admin/products
     * /admin/brands
     * /admin/categories
     * /admin/suppliers
     * /admin/customers
     * /admin/orders
     * /admin/managers
     * /admin/pos
     */
    if (pathname === "/admin/login") {
      setCheckingSession(false);
      return;
    }

    let cancelled = false;
    let timeout: number | null = null;

    const validateAdminSession = async () => {
      const savedSession =
        localStorage.getItem(
          ADMIN_SESSION_KEY
        );

      if (!savedSession) {
        router.replace("/admin/login");
        return;
      }

      let parsedSession: any;

      try {
        parsedSession =
          JSON.parse(savedSession);
      } catch {
        localStorage.removeItem(
          ADMIN_SESSION_KEY
        );

        router.replace("/admin/login");
        return;
      }

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

      try {
        const adminResult =
          await checkAdminAccess(
            accessToken
          );

        if (cancelled) {
          return;
        }

        if (
          !adminResult?.hasAdminAccess
        ) {
          localStorage.removeItem(
            ADMIN_SESSION_KEY
          );

          router.replace("/admin/login");
          return;
        }

        setAccess({
          isAdmin:
            Boolean(
              adminResult?.isAdmin
            ),

          hasAdminAccess:
            Boolean(
              adminResult?.hasAdminAccess
            ),

          role:
            adminResult?.role ||
            null,

          permissions:
            Array.isArray(
              adminResult?.permissions
            )
              ? adminResult.permissions
              : [],
        });

        setCheckingSession(false);

        /*
         * Control de expiración de la sesión.
         */
        if (!expiresAt) {
          return;
        }

        const expirationTime =
          Number(expiresAt) * 1000;

        const remainingTime =
          expirationTime - Date.now();

        if (remainingTime <= 0) {
          localStorage.removeItem(
            ADMIN_SESSION_KEY
          );

          router.replace("/admin/login");
          return;
        }

        timeout = window.setTimeout(() => {
          localStorage.removeItem(
            ADMIN_SESSION_KEY
          );

          router.replace("/admin/login");
        }, remainingTime);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Error verificando acceso administrativo:",
          error
        );

        localStorage.removeItem(
          ADMIN_SESSION_KEY
        );

        router.replace("/admin/login");
      }
    };

    void validateAdminSession();

    return () => {
      cancelled = true;

      if (timeout !== null) {
        window.clearTimeout(timeout);
      }
    };
  }, [pathname, router]);

  if (checkingSession) {
    return null;
  }

  const hasPermission = (
    permission: string
  ) => {
    if (access.isAdmin) {
      return true;
    }

    return access.permissions.includes(
      permission
    );
  };

  const contextValue: AdminContextValue = {
    ...access,
    loading: checkingSession,
    hasPermission,
  };

  return (
    <AdminContext.Provider
      value={contextValue}
    >
      {children}
    </AdminContext.Provider>
  );
}