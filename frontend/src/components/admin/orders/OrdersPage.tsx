 "use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import DashboardShell from "@/components/admin/dashboard/DashboardShell";
import {
  getOrders,
  updateOrderStatus,
} from "@/lib/api";
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
  manager_id: string | null;
  source_type: "direct" | "manager";
  delivery: boolean;
  address: string | null;
  notes: string | null;
  total: number;
  status: OrderStatus;
  created_at: string;
  commission_total: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

function getSourceLabel(source: Order["source_type"]) {
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
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
        background:
          status === "cancelado"
            ? "#fee2e2"
            : status === "entregado"
            ? "#dcfce7"
            : "#e0f2fe",
        color:
          status === "cancelado"
            ? "#b91c1c"
            : status === "entregado"
            ? "#15803d"
            : "#0369a1",
      }}
    >
      {getStatusLabel(status)}
    </span>
  );
}

const ORDER_STATUSES: OrderStatus[] = [
  "nuevo",
  "confirmado",
  "preparando",
  "entregado",
  "cancelado",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<OrderStatus | "todos">("todos");

  const [sourceFilter, setSourceFilter] =
    useState<"todos" | "direct" | "manager">(
      "todos"
    );

  const [deliveryFilter, setDeliveryFilter] =
    useState<"todos" | "si" | "no">("todos");

  const [updatingOrderId, setUpdatingOrderId] =
    useState<number | null>(null);

  const [statusError, setStatusError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
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

        const response =
          await getOrders(accessToken);

        const list = Array.isArray(
          response?.data
        )
          ? response.data
          : [];

        if (mounted) {
          setOrders(list);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los pedidos."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        [
          order.order_number,
          String(order.id),
          String(order.customer_id),
          getSourceLabel(order.source_type),
          getStatusLabel(order.status),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "todos" ||
        order.status === statusFilter;

      const matchesSource =
        sourceFilter === "todos" ||
        order.source_type === sourceFilter;

      const matchesDelivery =
        deliveryFilter === "todos" ||
        (deliveryFilter === "si" &&
          order.delivery === true) ||
        (deliveryFilter === "no" &&
          order.delivery === false);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSource &&
        matchesDelivery
      );
    });
  }, [
    orders,
    search,
    statusFilter,
    sourceFilter,
    deliveryFilter,
  ]);

  function clearFilters() {
    setSearch("");
    setStatusFilter("todos");
    setSourceFilter("todos");
    setDeliveryFilter("todos");
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "todos" ||
    sourceFilter !== "todos" ||
    deliveryFilter !== "todos";

  async function handleStatusChange(
    orderId: number,
    newStatus: OrderStatus
  ) {
    const accessToken =
      getAdminAccessToken();

    if (!accessToken) {
      setStatusError(
        "No hay una sesión administrativa activa."
      );
      return;
    }

    try {
      setUpdatingOrderId(orderId);
      setStatusError("");

      await updateOrderStatus(
        accessToken,
        orderId,
        newStatus
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
              }
            : order
        )
      );
    } catch (err) {
      setStatusError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el estado del pedido."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  return (
    <DashboardShell>
      <div className={styles.page}>
        <div
          className={styles.pageHeader}
        >
          <div>
            <h1 className={styles.pageTitle}>
              Pedidos
            </h1>

            <p
              className={
                styles.pageDescription
              }
            >
              Consulta y administra los
              pedidos registrados en DRL
              Electronik.
            </p>
          </div>
        </div>

        <div
          className={styles.toolbar}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Buscar pedido..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className={styles.searchInput}
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | OrderStatus
                  | "todos"
              )
            }
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              background: "#fff",
              fontSize: "14px",
              minWidth: "150px",
            }}
          >
            <option value="todos">
              Todos los estados
            </option>

            {ORDER_STATUSES.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {getStatusLabel(status)}
                </option>
              )
            )}
          </select>

          <select
            value={sourceFilter}
            onChange={(event) =>
              setSourceFilter(
                event.target.value as
                  | "todos"
                  | "direct"
                  | "manager"
              )
            }
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              background: "#fff",
              fontSize: "14px",
              minWidth: "130px",
            }}
          >
            <option value="todos">
              Todos los orígenes
            </option>

            <option value="direct">
              Directo
            </option>

            <option value="manager">
              Gestor
            </option>
          </select>

          <select
            value={deliveryFilter}
            onChange={(event) =>
              setDeliveryFilter(
                event.target.value as
                  | "todos"
                  | "si"
                  | "no"
              )
            }
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              background: "#fff",
              fontSize: "14px",
              minWidth: "130px",
            }}
          >
            <option value="todos">
              Toda entrega
            </option>

            <option value="si">
              Con entrega
            </option>

            <option value="no">
              Sin entrega
            </option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className={styles.secondaryButton}
              style={{
                cursor: "pointer",
                border: "1px solid #d1d5db",
                background: "#fff",
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <div
            style={{
              marginBottom: "16px",
              fontSize: "13px",
              color: "#6b7280",
            }}
          >
            Mostrando{" "}
            <strong>
              {filteredOrders.length}
            </strong>{" "}
            de{" "}
            <strong>{orders.length}</strong>{" "}
            pedidos.
          </div>
        )}

        {statusError && (
          <div
            className={styles.card}
            style={{
              borderColor: "#fecaca",
              background: "#fef2f2",
              marginBottom: "16px",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#b91c1c",
              }}
            >
              {statusError}
            </p>
          </div>
        )}

        {loading && (
          <div className={styles.card}>
            <p>Cargando pedidos...</p>
          </div>
        )}

        {!loading && error && (
          <div
            className={styles.card}
            style={{
              borderColor: "#fecaca",
              background: "#fef2f2",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#b91c1c",
              }}
            >
              {error}
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          filteredOrders.length === 0 && (
            <div className={styles.card}>
              <p>
                {hasActiveFilters
                  ? "No se encontraron pedidos con los filtros seleccionados."
                  : "No hay pedidos registrados."}
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          filteredOrders.length > 0 && (
            <div className={styles.card}>
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
                      <th>Pedido</th>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Origen</th>
                      <th>Entrega</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.map(
                      (order) => {
                        const isUpdating =
                          updatingOrderId ===
                          order.id;

                        return (
                          <tr
                            key={order.id}
                          >
                            <td>
                              <strong>
                                {
                                  order.order_number
                                }
                              </strong>
                            </td>

                            <td>
                              #{order.customer_id}
                            </td>

                            <td>
                              {formatDate(
                                order.created_at
                              )}
                            </td>

                            <td>
                              {getSourceLabel(
                                order.source_type
                              )}
                            </td>

                            <td>
                              {order.delivery
                                ? "Sí"
                                : "No"}
                            </td>

                            <td>
                              <strong>
                                $
                                {formatCurrency(
                                  Number(
                                    order.total ||
                                      0
                                  )
                                )}
                              </strong>
                            </td>

                            <td>
                              <div
                                style={{
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  gap: "8px",
                                }}
                              >
                                <select
                                  value={
                                    order.status
                                  }
                                  disabled={
                                    isUpdating
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    handleStatusChange(
                                      order.id,
                                      event.target
                                        .value as OrderStatus
                                    )
                                  }
                                  style={{
                                    padding:
                                      "7px 9px",
                                    border:
                                      "1px solid #d1d5db",
                                    borderRadius:
                                      "8px",
                                    background:
                                      "#fff",
                                    fontSize:
                                      "13px",
                                    cursor:
                                      isUpdating
                                        ? "wait"
                                        : "pointer",
                                  }}
                                >
                                  {ORDER_STATUSES.map(
                                    (status) => (
                                      <option
                                        key={
                                          status
                                        }
                                        value={
                                          status
                                        }
                                      >
                                        {getStatusLabel(
                                          status
                                        )}
                                      </option>
                                    )
                                  )}
                                </select>

                                {isUpdating && (
                                  <span
                                    style={{
                                      fontSize:
                                        "12px",
                                      color:
                                        "#6b7280",
                                    }}
                                  >
                                    Guardando...
                                  </span>
                                )}
                              </div>

                              <div
                                style={{
                                  marginTop:
                                    "6px",
                                }}
                              >
                                <StatusBadge
                                  status={
                                    order.status
                                  }
                                />
                              </div>
                            </td>

                            <td>
                              <Link
                                href={`/admin/orders/${order.id}`}
                                className={
                                  styles.secondaryButton
                                }
                              >
                                Ver
                              </Link>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </div>
    </DashboardShell>
  );
}