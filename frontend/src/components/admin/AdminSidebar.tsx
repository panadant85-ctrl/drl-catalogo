"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { checkAdminAccess } from "@/lib/api";
import {
  hasAdminPermission,
  type AdminAccess,
} from "@/lib/adminPermissions";

type MenuChild = {
  label: string;
  href: string;
  permission?: string;
  adminOnly?: boolean;
};

type MenuItem = {
  label: string;
  href?: string;
  icon: string;
  permission?: string;
  adminOnly?: boolean;
  children?: MenuChild[];
};

const menu: MenuItem[] = [
  {
    label: "Inicio",
    href: "/admin",
    icon: "⌂",
  },
  {
    label: "Catálogo",
    icon: "▦",
    children: [
      {
        label: "Productos",
        href: "/admin/products",
        permission: "products.view",
      },
      {
        label: "Categorías",
        href: "/admin/categories",
        permission: "categories.view",
      },
      {
        label: "Stock",
        href: "/admin/stock",
        permission: "products.view",
      },
    ],
  },
  {
    label: "Ventas",
    icon: "▤",
    children: [
      {
        label: "Pedidos",
        href: "/admin/orders",
        permission: "orders.view",
      },
      {
        label: "Carritos",
        href: "/admin/carts",
        adminOnly: true,
      },
    ],
  },
  {
    label: "Clientes",
    href: "/admin/customers",
    icon: "♙",
    permission: "customers.view",
  },
  {
    label: "Gestores",
    href: "/admin/managers",
    icon: "♟",
    permission: "managers.view",
  },
  {
    label: "Estadísticas",
    href: "/admin/statistics",
    icon: "▥",
    adminOnly: true,
  },
  {
    label: "Administración",
    icon: "⚙",
    children: [
      {
        label: "Usuarios",
        href: "/admin/users",
        permission: "users.view",
      },
      {
        label: "Roles",
        href: "/admin/roles",
        permission: "roles.view",
      },
      {
        label: "Configuración",
        href: "/admin/settings",
        adminOnly: true,
      },
    ],
  },
];

export default function AdminSidebar() {

  console.log("ADMIN SIDEBAR CARGADO");
  const pathname = usePathname();

  const [access, setAccess] =
    useState<AdminAccess | null>(null);

  const [openSections, setOpenSections] =
    useState<Record<string, boolean>>({
      Catálogo: true,
      Ventas: true,
      Administración: false,
    });

  const [collapsed, setCollapsed] =
    useState(false);

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
  
          console.log(
              "TOKEN EN SIDEBAR:",
              Boolean(accessToken)
            );

        if (!accessToken) {
          return;
        }

        const result =
          await checkAdminAccess(
            accessToken
          );

          console.log("RESULTADO DE ACCESO:", result);

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
          "No se pudieron cargar los permisos del administrador:",
          error
        );
      }
    }

    loadAccess();

    return () => {
      cancelled = true;
    };
  }, []);

  function canSee(
    permission?: string,
    adminOnly?: boolean
  ) {
    if (adminOnly) {
      return Boolean(access?.isAdmin);
    }

    if (!permission) {
      return true;
    }

    return hasAdminPermission(
      access,
      permission
    );
  }

  function getVisibleChildren(
    children?: MenuChild[]
  ) {
    if (!children) {
      return [];
    }

    return children.filter((child) =>
      canSee(
        child.permission,
        child.adminOnly
      )
    );
  }

  function toggleSection(label: string) {
    setOpenSections((current) => ({
      ...current,
      [label]: !current[label],
    }));
  }

  function isActive(href?: string) {
    if (!href) return false;

    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  return (
    <aside
      className={`admin-sidebar ${
        collapsed ? "collapsed" : ""
      }`}
    >
      <div className="admin-brand">
        <Link
          href="/admin"
          className="admin-brand-link"
        >
          <span className="admin-brand-mark">
            DRL
          </span>

          {!collapsed && (
            <span className="admin-brand-text">
              <strong>DRL</strong>
              <small>ELECTRONIK</small>
            </span>
          )}
        </Link>
      </div>

      <div className="admin-sidebar-scroll">
        <div className="admin-menu-title">
          {!collapsed && "ADMINISTRACIÓN"}
        </div>

        <nav className="admin-navigation">
          {menu.map((item) => {
            const visibleChildren =
              getVisibleChildren(
                item.children
              );

            const hasChildren =
              visibleChildren.length > 0;

            if (
              item.children &&
              !hasChildren
            ) {
              return null;
            }

            if (
              !item.children &&
              !canSee(
                item.permission,
                item.adminOnly
              )
            ) {
              return null;
            }

            const active =
              isActive(item.href) ||
              Boolean(
                visibleChildren.some(
                  (child) =>
                    isActive(child.href)
                )
              );

            if (hasChildren) {
              const isOpen =
                openSections[item.label];

              return (
                <div
                  key={item.label}
                  className={`admin-menu-group ${
                    active
                      ? "has-active-child"
                      : ""
                  }`}
                >
                  <button
                    type="button"
                    className="admin-menu-button"
                    onClick={() =>
                      toggleSection(
                        item.label
                      )
                    }
                    title={
                      collapsed
                        ? item.label
                        : undefined
                    }
                  >
                    <span className="admin-menu-icon">
                      {item.icon}
                    </span>

                    {!collapsed && (
                      <>
                        <span className="admin-menu-label">
                          {item.label}
                        </span>

                        <span
                          className={`admin-menu-arrow ${
                            isOpen
                              ? "open"
                              : ""
                          }`}
                        >
                          ›
                        </span>
                      </>
                    )}
                  </button>

                  {!collapsed &&
                    isOpen && (
                      <div className="admin-submenu">
                        {visibleChildren.map(
                          (child) => (
                            <Link
                              key={
                                child.href
                              }
                              href={
                                child.href
                              }
                              className={`admin-submenu-link ${
                                isActive(
                                  child.href
                                )
                                  ? "active"
                                  : ""
                              }`}
                            >
                              <span className="admin-submenu-dot" />
                              {child.label}
                            </Link>
                          )
                        )}
                      </div>
                    )}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={
                  item.href || "#"
                }
                className={`admin-menu-link ${
                  active
                    ? "active"
                    : ""
                }`}
                title={
                  collapsed
                    ? item.label
                    : undefined
                }
              >
                <span className="admin-menu-icon">
                  {item.icon}
                </span>

                {!collapsed && (
                  <span className="admin-menu-label">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="admin-sidebar-footer">
        {!collapsed && (
          <div className="admin-sidebar-version">
            <strong>
              DRL Electronik
            </strong>
            <span>
              Panel administrativo
            </span>
          </div>
        )}

        <button
          type="button"
          className="admin-collapse-button"
          onClick={() =>
            setCollapsed(
              (value) => !value
            )
          }
          title={
            collapsed
              ? "Expandir menú"
              : "Contraer menú"
          }
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>
    </aside>
  );
}