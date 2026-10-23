"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { checkAdminAccess } from "@/lib/api";
import {
  hasAdminPermission,
  type AdminAccess,
} from "@/lib/adminPermissions";

import styles from "./Dashboard.module.css";

type MenuItem = {
  label: string;
  href: string;
  icon: string;
  permissions?: string[];
  adminOnly?: boolean;
};

const menuItems: MenuItem[] = [
  {
    label: "Inicio",
    href: "/admin",
    icon: "⌂",
  },

  {
    label: "Productos",
    href: "/admin/products",
    icon: "▣",
    permissions: ["products.view"],
  },

  {
    label: "Categorías",
    href: "/admin/categories",
    icon: "▤",
    permissions: ["categories.view"],
  },

  {
    label: "Marcas",
    href: "/admin/brands",
    icon: "◆",
    permissions: ["brands.view"],
  },

  {
    label: "Stock",
    href: "/admin/stock",
    icon: "▥",
    permissions: ["products.view"],
  },

  {
    label: "Pedidos",
    href: "/admin/orders",
    icon: "▢",
    permissions: [
      "orders.view",
      "manager.orders.view",
    ],
  },

  {
    label: "Proveedores",
    href: "/admin/suppliers",
    icon: "▥",
    permissions: ["suppliers.view"],
  },

  {
    label: "Clientes",
    href: "/admin/customers",
    icon: "♙",
    permissions: [
      "customers.view",
      "manager.customers.view",
    ],
  },

  {
    label: "Gestores",
    href: "/admin/managers",
    icon: "♟",
    permissions: ["managers.view"],
  },

  {
    label: "Estadísticas",
    href: "/admin/statistics",
    icon: "◒",
    adminOnly: true,
  },

  {
    label: "Usuarios",
    href: "/admin/users",
    icon: "♙",
    permissions: ["users.view"],
  },

  {
    label: "Rol",
    href: "/admin/roles",
    icon: "🛡",
    permissions: ["roles.view"],
  },

  {
    label: "Configuración",
    href: "/admin/settings",
    icon: "⚙",
    adminOnly: true,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  const [access, setAccess] =
    useState<AdminAccess | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAccess() {
      try {
        const savedSession =
          localStorage.getItem(
            "drl_electronik_admin_session"
          );

        if (!savedSession) {
          return;
        }

        const parsedSession =
          JSON.parse(savedSession);

        const accessToken =
          parsedSession?.accessToken;

        if (!accessToken) {
          return;
        }

        const result =
          await checkAdminAccess(
            accessToken
          );

        if (cancelled) {
          return;
        }

        setAccess({
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
        });
      } catch (error) {
        console.error(
          "No se pudieron cargar los permisos del sidebar:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAccess();

    return () => {
      cancelled = true;
    };
  }, []);

  function canSee(
    item: MenuItem
  ): boolean {
    /*
     * Mientras se cargan los permisos
     * no mostramos elementos restringidos.
     */
    if (loading) {
      return false;
    }

    /*
     * El administrador puede ver todo.
     */
    if (access?.isAdmin) {
      return true;
    }

    /*
     * Opciones exclusivas del administrador.
     */
    if (item.adminOnly) {
      return false;
    }

    /*
     * Inicio siempre está disponible
     * para usuarios administrativos.
     */
    if (!item.permissions) {
      return true;
    }

    /*
     * Basta con tener uno de los permisos
     * requeridos para mostrar la opción.
     */
    return item.permissions.some(
      (permission) =>
        hasAdminPermission(
          access,
          permission
        )
    );
  }

  if (loading) {
    return (
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <div className={styles.logoMark}>
            DRL
          </div>

          <div className={styles.logoText}>
            <strong>DRL</strong>
            <span>Electronik</span>
          </div>
        </div>

        <div className={styles.menuTitle}>
          ADMINISTRACIÓN
        </div>
      </aside>
    );
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoArea}>
        <div className={styles.logoMark}>
          DRL
        </div>

        <div className={styles.logoText}>
          <strong>DRL</strong>
          <span>Electronik</span>
        </div>
      </div>

      <div className={styles.menuTitle}>
        ADMINISTRACIÓN
      </div>

      <nav className={styles.navigation}>
        {menuItems.map((item) => {
          if (!canSee(item)) {
            return null;
          }

          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(
                  item.href
                );

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${
                styles.menuItem
              } ${
                active
                  ? styles.menuItemActive
                  : ""
              }`}
            >
              <span
                className={
                  styles.menuIcon
                }
              >
                {item.icon}
              </span>

              <span
                className={
                  styles.menuLabel
                }
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div
        className={styles.sidebarBottom}
      >
        <div
          className={
            styles.sidebarVersion
          }
        >
          DRL Electronik
          <span>Back Office</span>
        </div>
      </div>
    </aside>
  );
}