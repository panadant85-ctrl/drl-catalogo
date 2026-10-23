

"use client";

import { useEffect, useState, Fragment } from "react";
import { useParams, useRouter } from "next/navigation";

import DashboardShell from "@/components/admin/dashboard/DashboardShell";

import {
  getManagers,
  getCustomers,
  getOrders,
  getOrderById,
  type ManagerData,
  type Order,
  type OrderItem,
} from "@/lib/api";

import { getAdminAccessToken } from "@/lib/adminSession";

type OrdersResponse = {
  data?: Order[];
};

type OrderDetailsResponse = {
  data?: Order;
  items?: OrderItem[];
};

type ManagerRow = ManagerData & {
  customer_count?: number;
};

type ManagerResponse = {
  data?: ManagerRow[];
};
type ManagerCustomer = {
  id: number;
  manager_id: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name_1?: string | null;
  last_name_2?: string | null;
  identification?: string | null;
  email?: string | null;
  phone?: string | null;
};

type CustomersResponse = {
  data?: ManagerCustomer[];
};
export default function ManagerDetailsPage() {

  const params = useParams<{ id: string }>();
  const router = useRouter();
  const managerId = params.id;
  const [customers, setCustomers] =
    useState<ManagerCustomer[]>([]);

  const [ordersByCustomer, setOrdersByCustomer] =
    useState<Record<number, Order[]>>({});

  const [orderItemsByOrder, setOrderItemsByOrder] =
    useState<Record<number, OrderItem[]>>({});

  const [expandedCustomerId, setExpandedCustomerId] =
    useState<number | null>(null);

  const [loadingCustomerOrders, setLoadingCustomerOrders] =
    useState<number | null>(null);

  const [ordersErrors, setOrdersErrors] =
    useState<Record<number, string>>({});

  const [customersError, setCustomersError] =
    useState("");
  const [manager, setManager] =
    useState<ManagerRow | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadManager() {
      try {
        setLoading(true);
        setError("");

        const token = getAdminAccessToken();

        if (!token) {
          throw new Error(
            "No hay una sesión administrativa activa."
          );
        }

        const result = (await getManagers(
          token
        )) as ManagerResponse;

        if (!Array.isArray(result?.data)) {
          throw new Error(
            "No se pudo obtener la lista de gestores."
          );
        }

        const found = result.data.find(
          (item) => item.id === managerId
        );

        if (!found) {
          throw new Error(
            "No se encontró el gestor solicitado."
          );
        }

        if (!cancelled) {
  setManager(found);
}

try {
  const customersResult = (
    await getCustomers(token)
  ) as CustomersResponse;

  if (!Array.isArray(customersResult?.data)) {
    throw new Error(
      "La respuesta de clientes no tiene el formato esperado."
    );
  }

  const associatedCustomers =
    customersResult.data.filter(
      (customer) =>
        customer.manager_id != null &&
        String(customer.manager_id) ===
          String(found.id)
    );

    if (!cancelled) {
          setCustomers(associatedCustomers);
          setCustomersError("");
        }
      } catch (customerErr) {
        if (!cancelled) {
          setCustomersError(
            customerErr instanceof Error
              ? customerErr.message
              : "No se pudieron cargar los clientes asociados."
          );
        }
      }
        

      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el gestor."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadManager();

    return () => {
      cancelled = true;
    };
  }, [managerId]);


  async function handleToggleCustomerOrders(
    customerId: number
  ) {
    if (expandedCustomerId === customerId) {
      setExpandedCustomerId(null);
      return;
    }

    setExpandedCustomerId(customerId);

    // Si ya cargamos los pedidos, reutilizamos los datos.
    if (ordersByCustomer[customerId]) {
      return;
    }

    try {
      setLoadingCustomerOrders(customerId);

      setOrdersErrors((previous) => ({
        ...previous,
        [customerId]: "",
      }));

      const token = getAdminAccessToken();

      if (!token) {
        throw new Error(
          "No hay una sesión administrativa activa."
        );
      }

      const ordersResult = (
        await getOrders(token)
      ) as OrdersResponse;

      if (!Array.isArray(ordersResult?.data)) {
        throw new Error(
          "No se pudo obtener la lista de pedidos."
        );
      }

      const customerOrders = ordersResult.data.filter(
        (order) => order.customer_id === customerId
      );

      setOrdersByCustomer((previous) => ({
        ...previous,
        [customerId]: customerOrders,
      }));

      // Consultamos los artículos de cada pedido.
      const details = await Promise.all(
        customerOrders.map(async (order) => {
          const result = (
            await getOrderById(token, order.id)
          ) as OrderDetailsResponse;

          if (!Array.isArray(result.items)) {
            throw new Error(
              `No se pudieron cargar los artículos del pedido ${order.order_number}.`
            );
          }

          return {
            orderId: order.id,
            items: result.items,
          };
        })
      );

      setOrderItemsByOrder((previous) => {
        const updated = { ...previous };

        for (const detail of details) {
          updated[detail.orderId] = detail.items;
        }

        return updated;
      });
    } catch (err) {
      setOrdersErrors((previous) => ({
        ...previous,
        [customerId]:
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los pedidos del cliente.",
      }));
    } finally {
      setLoadingCustomerOrders(null);
    }
  }


  return (
    <DashboardShell
      title="Detalle del gestor"
      subtitle="Información del gestor y sus clientes asociados"
    >
      <div className="p-6">
        <button
          type="button"
          onClick={() => router.push("/admin/managers")}
          className="mb-5 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Volver a Gestores
        </button>

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8">
            Cargando información del gestor...
          </div>
        ) : error || !manager ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-6"
          >
            <h2 className="font-semibold text-red-800">
              No se pudo cargar el gestor
            </h2>
            <p className="mt-2 text-sm text-red-700">
              {error || "Gestor no encontrado."}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {manager.full_name}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Código: {manager.manager_code || "Pendiente"}
                  </p>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-sm ${
                    manager.active
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {manager.active ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Clientes asociados"
                 value={String(customers.length)}
              />

              <StatCard
                label="Comisión"
                value={`${manager.commission_rate ?? 0}%`}
              />

              <StatCard
                label="Estado"
                value={manager.active ? "Activo" : "Inactivo"}
              />

              <StatCard
                label="Código de gestor"
                value={manager.manager_code || "Pendiente"}
              />
            </div>

            <section className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Información del gestor
                </h2>
                <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-4">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Clientes asociados
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Clientes vinculados a este gestor.
                      </p>
                    </div>

                    {customersError ? (
                      <div
                        role="alert"
                        className="p-6 text-sm text-red-700"
                      >
                        {customersError}
                      </div>
                    ) : customers.length === 0 ? (
                      <div className="p-6 text-sm text-gray-500">
                        No se encontraron clientes asociados a este gestor.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 text-gray-500">
                            <tr>
                              <th className="px-6 py-3 font-medium">
                                Cliente
                              </th>
                              <th className="px-6 py-3 font-medium">
                                Identificación
                              </th>
                              <th className="px-6 py-3 font-medium">
                                Teléfono
                              </th>
                              <th className="px-6 py-3 font-medium">
                                Email
                              </th>
                              <th className="px-6 py-3 font-medium">
                                Acciones
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-gray-200">
                            {customers.map((customer) => {
                              const customerName =
                                customer.full_name ||
                                [
                                  customer.first_name,
                                  customer.last_name_1,
                                  customer.last_name_2,
                                ]
                                  .filter(Boolean)
                                  .join(" ") ||
                                "Sin nombre registrado";

                              
return (
  <Fragment key={customer.id}>
    <tr key={customer.id}>
      <td className="px-6 py-4 font-medium text-gray-900">
        {customerName}
      </td>
      <td className="px-6 py-4 text-gray-600">
        {customer.identification || "—"}
      </td>
      <td className="px-6 py-4 text-gray-600">
        {customer.phone || "—"}
      </td>
      <td className="px-6 py-4 text-gray-600">
        {customer.email || "—"}
      </td>
      <td className="px-6 py-4">
        <button
          type="button"
          onClick={() =>
            void handleToggleCustomerOrders(customer.id)
          }
          className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          {expandedCustomerId === customer.id
            ? "Ocultar pedidos"
            : "Ver pedidos"}
        </button>
      </td>
    </tr>

    {expandedCustomerId === customer.id && (
      <tr key={`${customer.id}-orders`}>
        <td colSpan={5} className="bg-gray-50 px-6 py-5">
          <h3 className="mb-4 font-semibold text-gray-900">
            Pedidos de {customerName}
          </h3>

          {loadingCustomerOrders === customer.id ? (
            <p className="text-sm text-gray-500">
              Cargando pedidos y detalles...
            </p>
          ) : ordersErrors[customer.id] ? (
            <div
              role="alert"
              className="text-sm text-red-700"
            >
              {ordersErrors[customer.id]}
            </div>
          ) : !ordersByCustomer[customer.id] ? (
            <p className="text-sm text-gray-500">
              Preparando información...
            </p>
          ) : ordersByCustomer[customer.id].length === 0 ? (
            <p className="text-sm text-gray-500">
              Este cliente todavía no tiene pedidos registrados.
            </p>
          ) : (
            <div className="space-y-5">
              {ordersByCustomer[customer.id].map((order) => {
                const items = orderItemsByOrder[order.id] ?? [];

                return (
                            <div
                              key={order.id}
                              className="overflow-hidden rounded-lg border border-gray-200 bg-white"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4">
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {order.order_number}
                                  </p>
                                  <p className="mt-1 text-xs text-gray-500">
                                    {new Date(order.created_at).toLocaleString("es-ES")}
                                  </p>
                                </div>

                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                  {order.status}
                                </span>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                  <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                      <th className="px-4 py-3 font-medium">
                                        Producto
                                      </th>
                                      <th className="px-4 py-3 font-medium">
                                        Cantidad
                                      </th>
                                      <th className="px-4 py-3 font-medium">
                                        Precio unitario
                                      </th>
                                      <th className="px-4 py-3 font-medium">
                                        Subtotal
                                      </th>
                                      <th className="px-4 py-3 font-medium">
                                        Comisión unitaria
                                      </th>
                                      <th className="px-4 py-3 font-medium">
                                        Comisión total
                                      </th>
                                    </tr>
                                  </thead>

                                  <tbody className="divide-y divide-gray-100">
                                    {items.map((item) => (
                                      <tr key={item.id}>
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                          {item.product_name}
                                          {item.variant ? ` — ${item.variant}` : ""}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                          {item.quantity}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                          {Number(item.unit_price).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                          {Number(item.subtotal).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                          {Number(item.commission_unit).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                          {Number(item.commission_total).toFixed(2)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              <div className="flex flex-wrap justify-end gap-x-8 gap-y-2 border-t border-gray-200 p-4 text-sm">
                                <p className="text-gray-600">
                                  Total de la venta:{" "}
                                  <strong className="text-gray-900">
                                    {Number(order.total).toFixed(2)}
                                  </strong>
                                </p>

                                <p className="text-gray-600">
                                  Comisión del pedido:{" "}
                                  <strong className="text-green-700">
                                    {Number(order.commission_total).toFixed(2)}
                                  </strong>
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </Fragment>
          );

                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
              </div>

              <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
                <InfoItem label="Nombre completo" value={manager.full_name} />
                <InfoItem label="Email" value={manager.email} />
                <InfoItem label="Teléfono" value={manager.phone} />
                <InfoItem label="Username" value={manager.username} />
                <InfoItem label="Carnet" value={manager.carnet} />
                <InfoItem label="Slug" value={manager.slug} />
                <InfoItem
                  label="ID del gestor"
                  value={manager.id}
                />
                <InfoItem
                  label="ID de autenticación"
                  value={manager.auth_user_id}
                />
                <InfoItem
                  label="Fecha de registro"
                  value={
                    manager.created_at
                      ? new Date(
                          manager.created_at
                        ).toLocaleString("es-ES")
                      : null
                  }
                />
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardShell>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 break-words text-xl font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-gray-900">
        {value || "No registrado"}
      </p>
    </div>
  );
}
