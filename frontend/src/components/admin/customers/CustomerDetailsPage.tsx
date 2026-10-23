"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import DashboardShell from "@/components/admin/dashboard/DashboardShell";
import { getCustomerDetails } from "@/lib/api";
import { getAdminAccessToken } from "@/lib/adminSession";

type Customer = {
  id: number;
  first_name: string;
  last_name_1: string;
  last_name_2: string;
  full_name: string;
  identification: string;
  email?: string | null;
  phone?: string | null;
  province?: string | null;
  municipality?: string | null;
  address?: string | null;
  source_type?: "direct" | "manager";
  manager_id?: string | null;
  auth_user_id?: string | null;
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
};

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
  status:
    | "nuevo"
    | "confirmado"
    | "preparando"
    | "entregado"
    | "cancelado";
  created_at: string;
  commission_total: number;
  items: OrderItem[];
};

type CustomerDetails = {
  customer: Customer;

  resumen: {
    totalComprado: number;
    cantidadPedidos: number;
    ticketPromedio: number;
    ultimaCompra: string | null;
  };

  pedidos: Order[];

  productosComprados: {
    product_id: number | null;
    product_name: string;
    variant: string | null;
    quantity: number;
    veces_comprado: number;
    total: number;
  }[];

  evolucionCompras: {
    fecha: string;
    total: number;
    pedidos: number;
  }[];
};

type Props = {
  customerId: string;
};

export default function CustomerDetailsPage({
  customerId,
}: Props) {
  const [details, setDetails] =
    useState<CustomerDetails | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadCustomerDetails() {
    try {
      setLoading(true);
      setError("");

      const accessToken =
        getAdminAccessToken();

      if (!accessToken) {
        throw new Error(
          "No se encontró la sesión administrativa."
        );
      }

      const id = Number(customerId);

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        throw new Error(
          "El identificador del cliente no es válido."
        );
      }

      const result =
        await getCustomerDetails(
          accessToken,
          id
        );

      if (!result?.data) {
        throw new Error(
          "No se encontró información del cliente."
        );
      }

      setDetails(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar el detalle del cliente."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomerDetails();
  }, [customerId]);

  if (loading) {
    return (
      <DashboardShell>
        <div className="p-6">
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              Cargando información del cliente...
            </p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error || !details) {
    return (
      <DashboardShell>
        <div className="p-6">
          <Link
            href="/admin/customers"
            className="mb-5 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Volver a Clientes
          </Link>

          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-lg font-semibold text-red-800">
              No se pudo cargar el cliente
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error ||
                "El cliente solicitado no existe."}
            </p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const {
    customer,
    resumen,
    pedidos,
    productosComprados,
    evolucionCompras,
  } = details;

  const origin =
    customer.source_type === "manager"
      ? {
          label: "Gestor",
          className:
            "border-blue-200 bg-blue-50 text-blue-700",
        }
      : {
          label: "Directo",
          className:
            "border-gray-200 bg-gray-50 text-gray-700",
        };

  const account =
    customer.auth_user_id
      ? {
          label: "Con cuenta",
          className:
            "border-green-200 bg-green-50 text-green-700",
        }
      : {
          label: "Sin cuenta",
          className:
            "border-orange-200 bg-orange-50 text-orange-700",
        };

  const maxEvolutionValue =
    evolucionCompras.length > 0
      ? Math.max(
          ...evolucionCompras.map(
            (item) => item.total
          )
        )
      : 0;

  const totalProductosComprados =
    productosComprados.reduce(
      (total, product) =>
        total + product.quantity,
      0
    );

  const ultimaCompraTexto =
    resumen.ultimaCompra
      ? formatDateTime(
          resumen.ultimaCompra
        )
      : "Sin compras";

  return (
    <DashboardShell>
      <div className="p-6">
        {/* ENCABEZADO */}

        <div className="mb-6">
          <Link
            href="/admin/customers"
            className="mb-4 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Volver a Clientes
          </Link>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-8xl font-semibold text-gray-900">
                  {customer.full_name}
                </h1>

                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${origin.className}`}
                >
                  {origin.label}
                </span>

                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${account.className}`}
                >
                  {account.label}
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                {customer.email}
              </p>
            </div>

            <Link
              href="/admin/customers"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Volver a clientes
            </Link>
          </div>
        </div>

        {/* ESTADÍSTICAS */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total comprado"
            value={formatCurrency(
              resumen.totalComprado
            )}
            description="Compras no canceladas"
          />

          <StatCard
            label="Pedidos"
            value={String(
              resumen.cantidadPedidos
            )}
            description="Pedidos no cancelados"
          />

          <StatCard
            label="Ticket promedio"
            value={formatCurrency(
              resumen.ticketPromedio
            )}
            description="Promedio por pedido"
          />

          <StatCard
            label="Última compra"
            value={ultimaCompraTexto}
            description="Última compra registrada"
            compact
          />
        </div>

        {/* INFORMACIÓN DEL CLIENTE */}

        <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Información del cliente
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Datos personales y de contacto.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Nombre"
              value={customer.first_name}
            />

            <InfoItem
              label="Primer apellido"
              value={customer.last_name_1}
            />

            <InfoItem
              label="Segundo apellido"
              value={customer.last_name_2}
            />

            <InfoItem
              label="Identificación"
              value={customer.identification}
            />

            <InfoItem
              label="Teléfono"
              value={customer.phone}
            />

            <InfoItem
              label="Email"
              value={customer.email}
            />

            <InfoItem
              label="Provincia"
              value={customer.province}
            />

            <InfoItem
              label="Municipio"
              value={customer.municipality}
            />

            <InfoItem
              label="Dirección"
              value={customer.address}
              fullWidth
            />
          </div>
        </div>

        {/* CUENTA Y ORIGEN */}

        <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Cuenta y origen
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Información sobre cómo está registrado el cliente.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
            <InfoItem
              label="Origen"
              value={origin.label}
            />

            <InfoItem
              label="Cuenta de usuario"
              value={
                customer.auth_user_id
                  ? "Cuenta vinculada"
                  : "No tiene cuenta"
              }
            />

            <InfoItem
              label="Gestor asignado"
              value={
                customer.manager_id
                  ? `Gestor #${customer.manager_id}`
                  : "Sin gestor asignado"
              }
            />
          </div>
        </div>

        {/* EVOLUCIÓN DE COMPRAS */}

        <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Evolución de compras
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Comportamiento de compras agrupado por día.
            </p>
          </div>

          <div className="p-6">
            {evolucionCompras.length === 0 ? (
              <div className="flex min-h-[220px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    📊
                  </div>

                  <p className="mt-3 text-sm font-medium text-gray-700">
                    Sin compras registradas
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Este cliente todavía no tiene compras.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {evolucionCompras.map(
                  (item) => {
                    const width =
                      maxEvolutionValue >
                      0
                        ? Math.max(
                            (item.total /
                              maxEvolutionValue) *
                              100,
                            4
                          )
                        : 4;

                    return (
                      <div
                        key={item.fecha}
                        className="grid grid-cols-[90px_1fr_110px] items-center gap-3"
                      >
                        <span className="text-xs font-medium text-gray-500">
                          {formatDate(
                            item.fecha
                          )}
                        </span>

                        <div className="h-8 overflow-hidden rounded-md bg-gray-100">
                          <div
                            className="flex h-full items-center rounded-md bg-green-500 px-3 text-xs font-semibold text-white"
                            style={{
                              width: `${width}%`,
                            }}
                          >
                            {formatCurrency(
                              item.total
                            )}
                          </div>
                        </div>

                        <span className="text-right text-xs text-gray-500">
                          {item.pedidos}{" "}
                          {item.pedidos === 1
                            ? "pedido"
                            : "pedidos"}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>

        {/* RESUMEN DE PRODUCTOS */}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <StatCard
            label="Productos comprados"
            value={String(
              totalProductosComprados
            )}
            description="Unidades adquiridas"
          />

          <StatCard
            label="Productos diferentes"
            value={String(
              productosComprados.length
            )}
            description="Productos registrados en el historial"
          />
        </div>

        {/* PEDIDOS */}

        <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Pedidos
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Historial completo de pedidos del cliente.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Pedido
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Fecha
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Productos
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Total
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Estado
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {pedidos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                      Este cliente todavía no tiene pedidos.
                    </td>
                  </tr>
                ) : (
                  pedidos.map(
                    (order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {order.order_number}
                          </div>

                          <div className="text-xs text-gray-400">
                            #{order.id}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDateTime(
                            order.created_at
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {order.items.reduce(
                            (
                              total,
                              item
                            ) =>
                              total +
                              item.quantity,
                            0
                          )}
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                          {formatCurrency(
                            order.total
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge
                            status={
                              order.status
                            }
                          />
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PRODUCTOS COMPRADOS */}

        <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Productos comprados
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Resumen histórico de productos adquiridos.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Producto
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Variante
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Cantidad
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Veces comprado
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {productosComprados.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                      No hay productos comprados todavía.
                    </td>
                  </tr>
                ) : (
                  productosComprados.map(
                    (product, index) => (
                      <tr
                        key={`${product.product_id ?? "product"}-${product.variant ?? ""}-${index}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {
                              product.product_name
                            }
                          </div>

                          {product.product_id && (
                            <div className="text-xs text-gray-400">
                              Producto #
                              {
                                product.product_id
                              }
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {product.variant ||
                            "—"}
                        </td>

                        <td className="px-6 py-4 text-right text-sm text-gray-600">
                          {
                            product.quantity
                          }
                        </td>

                        <td className="px-6 py-4 text-right text-sm text-gray-600">
                          {
                            product.veces_comprado
                          }
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                          {formatCurrency(
                            product.total
                          )}
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function StatCard({
  label,
  value,
  description,
  compact = false,
}: {
  label: string;
  value: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p
        className={
          compact
            ? "mt-2 text-lg font-semibold text-gray-900"
            : "mt-2 text-2xl font-semibold text-gray-900"
        }
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-400">
        {description}
      </p>
    </div>
  );
}

function InfoItem({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value?: string | null;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={
        fullWidth
          ? "md:col-span-2 lg:col-span-3"
          : ""
      }
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-gray-900">
        {value || "No registrado"}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: Order["status"];
}) {
  const styles: Record<
    Order["status"],
    string
  > = {
    nuevo:
      "border-blue-200 bg-blue-50 text-blue-700",

    confirmado:
      "border-indigo-200 bg-indigo-50 text-indigo-700",

    preparando:
      "border-yellow-200 bg-yellow-50 text-yellow-700",

    entregado:
      "border-green-200 bg-green-50 text-green-700",

    cancelado:
      "border-red-200 bg-red-50 text-red-700",
  };

  const labels: Record<
    Order["status"],
    string
  > = {
    nuevo: "Nuevo",
    confirmado: "Confirmado",
    preparando: "Preparando",
    entregado: "Entregado",
    cancelado: "Cancelado",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function formatCurrency(
  value: number
) {
  return new Intl.NumberFormat(
    "es-ES",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(value);
}

function formatDate(
  value: string
) {
  const date = new Date(
    `${value}T00:00:00`
  );

  return new Intl.DateTimeFormat(
    "es-ES",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(date);
}

function formatDateTime(
  value: string
) {
  const date = new Date(value);

  return new Intl.DateTimeFormat(
    "es-ES",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}