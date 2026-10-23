
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { clearAdminSession } from "@/lib/adminSession";
import { getProducts } from "@/lib/api";

import styles from "./Dashboard.module.css";

type LowStockProduct = {
  id: number;
  name: string;
  sku?: string | null;
  stock: number;
  active?: boolean;
};

function extractProducts(data: unknown): LowStockProduct[] {
  let result: unknown = data;

  if (!Array.isArray(result) && result && typeof result === "object") {
    const payload = result as Record<string, unknown>;

    if (Array.isArray(payload.products)) {
      result = payload.products;
    } else if (Array.isArray(payload.data)) {
      result = payload.data;
    } else {
      return [];
    }
  }

  if (!Array.isArray(result)) {
    return [];
  }

  return result.filter(
    (item): item is LowStockProduct =>
      item !== null &&
      typeof item === "object" &&
      typeof item.id === "number" &&
      typeof item.name === "string" &&
      Number.isFinite(Number(item.stock))
  );
}

export default function DashboardHeader() {
  const router = useRouter();

  const [dateTime, setDateTime] = useState("");
  const [lowStockProducts, setLowStockProducts] =
    useState<LowStockProduct[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] =
    useState(true);
  const [notificationError, setNotificationError] =
    useState(false);

  const loadLowStockProducts = useCallback(async () => {
    try {
      const response = await getProducts();
      const products = extractProducts(response);

        setLowStockProducts(
          products
            .filter(
              (product) =>
                product.active !== false &&
                Number(product.stock) >= 0 &&
                Number(product.stock) < 4
            )
            .sort(
              (a, b) => Number(a.stock) - Number(b.stock)
            )
        );

      setNotificationError(false);
    } catch (error) {
      console.error(
        "Error al consultar las alertas de inventario:",
        error
      );

      setNotificationError(true);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      const formatted = new Intl.DateTimeFormat("es-ES", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(now);

      setDateTime(
        formatted.charAt(0).toUpperCase() + formatted.slice(1)
      );
    };

    updateDateTime();

    const interval = window.setInterval(updateDateTime, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    void loadLowStockProducts();

    const interval = window.setInterval(() => {
      void loadLowStockProducts();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [loadLowStockProducts]);

  function handleLogout() {
    clearAdminSession();
    router.replace("/admin/login");
  }

  return (
    <header className={styles.header}>
      <div className={styles.dateBar}>
        <span>{dateTime}</span>
      </div>

      <div className={styles.darkBar}>
        <div className={styles.darkBarSpacer} />

        <div className={styles.headerActions}>
          <div className={styles.notificationContainer}>
            <button
              type="button"
              className={styles.headerButton}
              aria-label={`Notificaciones: ${lowStockProducts.length} productos agotados o con stock bajo`}
              aria-expanded={notificationsOpen}
              aria-haspopup="true"
              title="Alertas de inventario"
              onClick={() =>
                setNotificationsOpen((open) => !open)
              }
            >
              <svg
                viewBox="0 0 24 24"
                className={styles.bellIcon}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>

              {lowStockProducts.length > 0 && (
                <span className={styles.notificationBadge}>
                  {lowStockProducts.length > 99
                    ? "99+"
                    : lowStockProducts.length}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div
                className={styles.notificationDropdown}
                role="region"
                aria-label="Alertas de stock bajo"
              >
                <div className={styles.notificationHeader}>
                  <div>
                    <strong>Stock bajo y agotado</strong>
                      <span>
                        Productos activos con 0 a 3 unidades
                      </span>
                  </div>

                  <button
                    type="button"
                    className={styles.notificationClose}
                    aria-label="Cerrar notificaciones"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    ×
                  </button>
                </div>

                <div className={styles.notificationContent}>
                  {loadingNotifications ? (
                    <p className={styles.notificationMessage}>
                      Consultando inventario...
                    </p>
                  ) : notificationError ? (
                    <div className={styles.notificationEmpty}>
                      <p>
                        No se pudieron cargar las alertas.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setLoadingNotifications(true);
                          void loadLowStockProducts();
                        }}
                      >
                        Reintentar
                      </button>
                    </div>
                  ) : lowStockProducts.length === 0 ? (
                    <div className={styles.notificationEmpty}>
                      <span className={styles.notificationSuccess}>
                        ✓
                      </span>
                      <strong>Inventario en buen nivel</strong>
                      <p>
                        No hay productos activos con stock bajo.
                      </p>
                    </div>
                  ) : (
                    lowStockProducts.map((product) => (
                      <div
                        key={product.id}
                        className={styles.notificationProduct}
                      >
                        <div className={styles.notificationProductInfo}>
                          <strong>{product.name}</strong>
                          <span>
                            {product.sku
                              ? `SKU: ${product.sku}`
                              : `Producto #${product.id}`}
                          </span>
                        </div>
                        <span
                          className={styles.notificationStock}
                          title={
                            Number(product.stock) === 0
                              ? "Producto agotado"
                              : `${product.stock} unidades disponibles`
                          }
                        >
                          {Number(product.stock) === 0
                            ? "AGOTADO"
                            : `${product.stock} ud.`}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className={styles.notificationFooter}>
                  Actualización automática cada 30 segundos
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className={styles.headerButton}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            onClick={handleLogout}
          >
            <span className={styles.userIcon}>
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20c.8-3.4 3.2-5 7-5s6.2 1.6 7 5" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
