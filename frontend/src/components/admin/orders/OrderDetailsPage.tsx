"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import DashboardShell from "@/components/admin/dashboard/DashboardShell";

import { getOrderById } from "@/lib/api";
import { getAdminAccessToken } from "@/lib/adminSession";

import styles from "./Orders.module.css";
import commonStyles from "../styles/AdminCommon.module.css";
import tableStyles from "../styles/AdminTable.module.css";

type OrderStatus =
  | "nuevo"
  | "confirmado"
  | "preparando"
  | "entregado"
  | "cancelado";

type Order = {
  id: number;
  order_number: string;
  customer_id: number;
  customer_name: string | null;
  manager_id: string | null;
  manager_name: string | null;
  manager_code: string | null;
  source_type: "direct" | "manager";
  delivery: boolean;
  address: string | null;
  notes: string | null;
  total: number;
  status: OrderStatus;
  created_at: string;
  commission_total: number;
};

type OrderItem = {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  variant: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
  commission_unit: number;
  commission_total: number;
};

type OrderResponse = {
  success: boolean;
  data: Order;
  items: OrderItem[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDateTime(value: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusLabel(status: OrderStatus) {
  switch (status) {
    case "nuevo":
      return "Nuevo";

    case "confirmado":
      return "Confirmado";

    case "preparando":
      return "Preparando";

    case "entregado":
      return "Entregado";

    case "cancelado":
      return "Cancelado";

    default:
      return status;
  }
}

function getSourceLabel(
  source: Order["source_type"]
) {
  return source === "manager"
    ? "Gestor"
    : "Directo";
}

function StatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  return (
    <span
      className={`${styles.statusBadge} ${
        styles[`status_${status}`]
      }`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className={styles.infoItem}>
      <span className={styles.infoLabel}>
        {label}
      </span>

      <span className={styles.infoValue}>
        {value || "—"}
      </span>
    </div>
  );
}

export default function OrderDetailsPage({
  orderId,
}: {
  orderId: string;
}) {
  const [order, setOrder] =
    useState<Order | null>(null);

  const [items, setItems] =
    useState<OrderItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadOrder() {
      try {
        setLoading(true);
        setError("");

        const accessToken =
          getAdminAccessToken();

        if (!accessToken) {
          throw new Error(
            "No hay una sesión administrativa activa."
          );
        }

        const numericId =
          Number(orderId);

        if (
          !Number.isInteger(numericId) ||
          numericId <= 0
        ) {
          throw new Error(
            "El identificador del pedido no es válido."
          );
        }

        const response =
          (await getOrderById(
            accessToken,
            numericId
          )) as OrderResponse;

        if (!mounted) {
          return;
        }

        setOrder(
          response?.data ?? null
        );

        setItems(
          Array.isArray(
            response?.items
          )
            ? response.items
            : []
        );
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo obtener el pedido."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  const totalItems = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          Number(item.quantity || 0),
        0
      ),
    [items]
  );

  if (loading) {
    return (
      <DashboardShell>
        <div
          className={
            commonStyles.page
          }
        >
          <div
            className={
              commonStyles.card
            }
          >
            <p>
              Cargando pedido...
            </p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error || !order) {
    return (
      <DashboardShell>
        <div
          className={
            commonStyles.page
          }
        >
          <div
            className={
              commonStyles.pageHeader
            }
          >
            <div>
              <h1
                className={
                  commonStyles.pageTitle
                }
              >
                Pedido
              </h1>

              <p
                className={
                  commonStyles.pageDescription
                }
              >
                No se pudo cargar la
                información del pedido.
              </p>
            </div>
          </div>

          <div
            className={
              commonStyles.card
            }
          >
            <p
              style={{
                margin: 0,
                color: "#b91c1c",
              }}
            >
              {error ||
                "El pedido no existe."}
            </p>

            <div
              style={{
                marginTop: 20,
              }}
            >
              <Link
                href="/admin/orders"
                className={
                  commonStyles.secondaryButton
                }
              >
                Volver a pedidos
              </Link>
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div
        className={commonStyles.page}
      >
        <div
          className={
            commonStyles.pageHeader
          }
        >
          <div>
            <div
              className={
                styles.backLinkWrapper
              }
            >
              <Link
                href="/admin/orders"
                className={
                  styles.backLink
                }
              >
                ← Volver a pedidos
              </Link>
            </div>

            <h1
              className={
                commonStyles.pageTitle
              }
            >
              {order.order_number}
            </h1>

            <p
              className={
                commonStyles.pageDescription
              }
            >
              Detalle completo del pedido
            </p>
          </div>

          <StatusBadge
            status={order.status}
          />
        </div>

        <div
          className={
            styles.statsGrid
          }
        >
          <div
            className={
              styles.statCard
            }
          >
            <span
              className={
                styles.statLabel
              }
            >
              Total
            </span>

            <strong
              className={
                styles.statValue
              }
            >
              $
              {formatCurrency(
                order.total
              )}
            </strong>
          </div>

          <div
            className={
              styles.statCard
            }
          >
            <span
              className={
                styles.statLabel
              }
            >
              Productos
            </span>

            <strong
              className={
                styles.statValue
              }
            >
              {totalItems}
            </strong>
          </div>

          <div
            className={
              styles.statCard
            }
          >
            <span
              className={
                styles.statLabel
              }
            >
              Origen
            </span>

            <strong
              className={
                styles.statValue
              }
            >
              {getSourceLabel(
                order.source_type
              )}
            </strong>
          </div>

          <div
            className={
              styles.statCard
            }
          >
            <span
              className={
                styles.statLabel
              }
            >
              Fecha
            </span>

            <strong
              className={
                styles.statValueSmall
              }
            >
              {formatDateTime(
                order.created_at
              )}
            </strong>
          </div>
        </div>

        <div
          className={
            styles.contentGrid
          }
        >
          <section
            className={
              commonStyles.card
            }
          >
            <div
              className={
                styles.sectionHeader
              }
            >
              <h2
                className={
                  styles.sectionTitle
                }
              >
                Información del pedido
              </h2>
            </div>

            <div
              className={
                styles.infoGrid
              }
            >
              <InfoItem
                label="Número de pedido"
                value={
                  order.order_number
                }
              />

              <InfoItem
                label="ID del pedido"
                value={
                  `#${order.id}`
                }
              />

              <InfoItem
                label="Cliente"
                value={
                  <Link
                    href={`/admin/customers/${order.customer_id}`}
                    className={styles.customerLink}
                  >
                    {order.customer_name || `Cliente #${order.customer_id}`}
                  </Link>
                }
              />

              <InfoItem
                label="Origen"
                value={
                  getSourceLabel(
                    order.source_type
                  )
                }
              />
              
              <InfoItem
                label="Código Gestor"
                value={
                  order.manager_id ? (
                    <Link
                      href={`/admin/managers/${order.manager_id}`}
                      className={styles.customerLink}
                    >
                      {order.manager_code || order.manager_name || "Ver gestor"}
                    </Link>
                  ) : (
                    "Sin gestor"
                  )
                }
              />

              <InfoItem
                label="Entrega"
                value={
                  order.delivery
                    ? "Sí"
                    : "No"
                }
              />

              <InfoItem
                label="Estado"
                value={
                  <StatusBadge
                    status={
                      order.status
                    }
                  />
                }
              />

              <InfoItem
                label="Fecha"
                value={
                  formatDateTime(
                    order.created_at
                  )
                }
              />
            </div>
          </section>

          <section
            className={
              commonStyles.card
            }
          >
            <div
              className={
                styles.sectionHeader
              }
            >
              <h2
                className={
                  styles.sectionTitle
                }
              >
                Entrega
              </h2>
            </div>

            <div
              className={
                styles.deliveryBox
              }
            >
              <div>
                <span
                  className={
                    styles.infoLabel
                  }
                >
                  Tipo
                </span>

                <strong>
                  {order.delivery
                    ? "Entrega a domicilio"
                    : "Recogida / venta directa"}
                </strong>
              </div>

              {order.address && (
                <div>
                  <span
                    className={
                      styles.infoLabel
                    }
                  >
                    Dirección
                  </span>

                  <strong>
                    {order.address}
                  </strong>
                </div>
              )}

              {order.notes && (
                <div>
                  <span
                    className={
                      styles.infoLabel
                    }
                  >
                    Notas
                  </span>

                  <strong>
                    {order.notes}
                  </strong>
                </div>
              )}
            </div>
          </section>
        </div>

        <section
          className={
            commonStyles.card
          }
        >
          <div
            className={
              styles.sectionHeader
            }
          >
            <div>
              <h2
                className={
                  styles.sectionTitle
                }
              >
                Productos del pedido
              </h2>

              <p
                className={
                  styles.sectionDescription
                }
              >
                {items.length} producto
                {items.length === 1
                  ? ""
                  : "s"} en este pedido.
              </p>
            </div>
          </div>

          {items.length === 0 ? (
            <div
              className={
                styles.emptyState
              }
            >
              Este pedido no tiene
              productos registrados.
            </div>
          ) : (
            <div
              className={
                tableStyles.tableWrapper
              }
            >
              <table
                className={
                  tableStyles.table
                }
              >
                <thead>
                  <tr>
                    <th>
                      Producto
                    </th>

                    <th>
                      Variante
                    </th>

                    <th>
                      Cantidad
                    </th>

                    <th>
                      Precio unitario
                    </th>

                    <th>
                      Subtotal
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map(
                    (item) => (
                      <tr
                        key={item.id}
                      >
                        <td>
                          <strong>
                            {
                              item.product_name
                            }
                          </strong>

                          {item.product_id && (
                            <div
                              className={
                                styles.productId
                              }
                            >
                              Producto #
                              {
                                item.product_id
                              }
                            </div>
                          )}
                        </td>

                        <td>
                          {item.variant ||
                            "—"}
                        </td>

                        <td>
                          {item.quantity}
                        </td>

                        <td>
                          $
                          {formatCurrency(
                            item.unit_price
                          )}
                        </td>

                        <td>
                          <strong>
                            $
                            {formatCurrency(
                              item.subtotal
                            )}
                          </strong>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div
            className={
              styles.orderTotal
            }
          >
            <span>
              Total del pedido
            </span>

            <strong>
              $
              {formatCurrency(
                order.total
              )}
            </strong>
          </div>
        </section>

        {order.commission_total >
          0 && (
          <section
            className={
              commonStyles.card
            }
          >
            <div
              className={
                styles.sectionHeader
              }
            >
              <h2
                className={
                  styles.sectionTitle
                }
              >
                Comisión
              </h2>
            </div>

            <div
              className={
                styles.commissionBox
              }
            >
              <span>
                Comisión total
              </span>

              <strong>
                $
                {formatCurrency(
                  order.commission_total
                )}
              </strong>
            </div>
          </section>
        )}
      </div>
    </DashboardShell>
  );
}