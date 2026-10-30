"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  clearManagerSession,
  getManagerSession,
  getMyManagerProfile,
  getMyManagerCustomers,
  getMyManagerCustomerOrders,
  type Customer,
  type ManagerData,
  type Order,
  type OrderItem,
} from "@/lib/api";

import styles from "./ManagerDashboard.module.css";

function currency(value: number | string | null | undefined) {
  return Number(value ?? 0).toLocaleString("es", {
    style: "currency",
    currency: "USD",
  });
}

export default function ManagerDashboardPage() {
  const router = useRouter();

  const [manager, setManager] =
    useState<ManagerData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState("");

  
const [selectedCustomer, setSelectedCustomer] =
  useState<Customer | null>(null);

const [customerOrders, setCustomerOrders] =
  useState<{ order: Order; items: OrderItem[] }[]>([]);

const [ordersLoading, setOrdersLoading] = useState(false);
const [ordersError, setOrdersError] = useState("");


  useEffect(() => {
    let cancelled = false;

    async function loadManagerProfile() {
      const session = getManagerSession();

      if (!session?.accessToken) {
        router.replace("/manager/login");
        return;
      }

      try {
        const result = await getMyManagerProfile(
          session.accessToken
        );

        if (cancelled) return;

        setManager(result.data);
        
        try {
          const customersResult = await getMyManagerCustomers(
            session.accessToken
          );

          if (cancelled) return;

          setCustomers(
            Array.isArray(customersResult.data)
              ? customersResult.data
              : []
          );
        } catch (err) {
          if (cancelled) return;

          setCustomersError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los clientes."
          );
        } finally {
          if (!cancelled) {
            setCustomersLoading(false);
          }
        }

      } catch (err) {
        if (cancelled) return;

        clearManagerSession();

        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar el perfil."
        );

        router.replace("/manager/login");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadManagerProfile();

    return () => {
      cancelled = true;
    };
  }, [router]);

  function handleLogout() {
    clearManagerSession();
    router.replace("/manager/login");
  }

async function handleViewOrders(customer: Customer) {
  console.log("[Gestor] Clic en Ver pedidos:", customer.id);

  const session = getManagerSession();

  if (!session?.accessToken) {
    console.error("[Gestor] No hay sesión activa.");
    setOrdersError("La sesión del gestor no está activa.");
    return;
  }

  setSelectedCustomer(customer);
  setCustomerOrders([]);
  setOrdersError("");
  setOrdersLoading(true);

  try {
    const result = await getMyManagerCustomerOrders(
      session.accessToken,
      customer.id
    );

    console.log("[Gestor] Respuesta de pedidos:", result);

    const validOrders = Array.isArray(result.data)
          ? result.data
              .filter(
                (order: unknown): order is Record<string, unknown> =>
                  order !== null &&
                  typeof order === "object" &&
                  "id" in order &&
                  order.id != null
              )
              .map((order: Record<string, unknown>) => ({
                order: order as unknown as Order,
                items: Array.isArray(order.items)
                  ? (order.items as OrderItem[])
                  : [],
              }))
          : [];

    setCustomerOrders(validOrders);

    if (validOrders.length === 0) {
      setOrdersError("");
    }
  } catch (err) {
    console.error(
      "[Gestor] Error al consultar pedidos:",
      err
    );

    setOrdersError(
      err instanceof Error
        ? err.message
        : "No se pudieron cargar los pedidos."
    );
  } finally {
    setOrdersLoading(false);
  }
}

  if (loading) {
    return (
      <main className={styles.page}>
        <p className={styles.message}>
          Verificando sesión del gestor...
        </p>
      </main>
    );
  }

  if (!manager) {
    return (
      <main className={styles.page}>
        <p className={styles.message}>
          {error || "Redirigiendo al inicio de sesión..."}
        </p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.brand}>
            DRL Electronik
          </div>

          <p className={styles.headerSubtitle}>
            Panel de gestión
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className={styles.logoutButton}
        >
          Cerrar sesión
        </button>
      </header>

      <section className={styles.welcome}>
        <p className={styles.eyebrow}>
          PANEL DEL GESTOR
        </p>

        <h1 className={styles.welcomeTitle}>
          Bienvenido, {manager.full_name}
        </h1>

        <p className={styles.mutedText}>
          Consulta tu información y administra tu actividad.
        </p>
      </section>

      <section className={styles.statsGrid}>
        <article className={styles.card}>
          <p className={styles.cardLabel}>
            Código de gestor
          </p>

          <h2 className={styles.cardValue}>
            {manager.manager_code || "No asignado"}
          </h2>
        </article>

        <article className={styles.card}>
          <p className={styles.cardLabel}>
            Comisión
          </p>

          <h2 className={styles.cardValue}>
            {Number(manager.commission_rate).toLocaleString(
              "es",
              { maximumFractionDigits: 2 }
            )}
            %
          </h2>
        </article>

        <article className={styles.card}>
          <p className={styles.cardLabel}>
            Estado de la cuenta
          </p>

          <h2
            className={`${styles.cardValue} ${
              manager.active
                ? styles.activeStatus
                : styles.inactiveStatus
            }`}
          >
            {manager.active ? "Activa" : "Inactiva"}
          </h2>
        </article>
      </section>

      <section className={styles.card}>
        <h2 className={styles.profileTitle}>
          Mi perfil
        </h2>

        <div className={styles.detailsGrid}>
          <Detail
            label="Nombre completo"
            value={manager.full_name}
          />

          <Detail
            label="Correo electrónico"
            value={manager.email}
          />

          <Detail
            label="Teléfono"
            value={manager.phone}
          />

          <Detail
            label="Usuario"
            value={manager.username}
          />

          <Detail
            label="Carnet"
            value={manager.carnet}
          />
        </div>
      </section>
      
      <section className={styles.card}>
        <h2 className={styles.profileTitle}>
          Mis clientes
        </h2>

        {customersLoading ? (
          <p className={styles.message}>
            Cargando clientes...
          </p>
        ) : customersError ? (
          <p className={styles.message}>
            {customersError}
          </p>
        ) : customers.length === 0 ? (
          <p className={styles.message}>
            Todavía no tienes clientes asociados.
          </p>
        ) : (
          <div>
            {customers.map((customer) => (
              <article key={customer.id}>
                <h3>{customer.full_name}</h3>

                <p>
                  Identificación: {customer.identification}
                </p>

                <p>
                  Correo: {customer.email || "No especificado"}
                </p>

                <p>
                  Teléfono: {customer.phone || "No especificado"}
                </p>

                <p>
                  Ubicación:{" "}
                  {[customer.municipality, customer.province]
                    .filter(Boolean)
                    .join(", ") || "No especificada"}
                </p>

                <button
                    type="button"
                    onClick={() => void handleViewOrders(customer)}
                  >
                  Ver pedidos
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

          
{selectedCustomer && (
  <section className={`${styles.card} ${styles.ordersSection}`}>
    <div className={styles.sectionHeader}>
      <div>
        <h2 className={styles.profileTitle}>
          Pedidos de {selectedCustomer.full_name}
        </h2>
        <p className={styles.sectionSubtitle}>
          Consulta los pedidos y las comisiones registradas de este cliente.
        </p>
      </div>

      <button
        type="button"
        className={styles.secondaryButton}
        onClick={() => {
          setSelectedCustomer(null);
          setCustomerOrders([]);
          setOrdersError("");
        }}
      >
        Volver a mis clientes
      </button>
    </div>

    {ordersLoading ? (
      <p className={styles.message}>Cargando pedidos...</p>
    ) : ordersError ? (
      <p className={styles.message}>{ordersError}</p>
    ) : customerOrders.length === 0 ? (
      <p className={styles.tableEmpty}>
        Este cliente todavía no tiene pedidos.
      </p>
    ) : (
      <div className={styles.orderList}>
        {customerOrders.map(({ order, items }) => (
          <article key={order.id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <div>
                <h3 className={styles.orderTitle}>
                  Pedido {order.order_number || order.id}
                </h3>
                <p className={styles.orderMeta}>
                  {new Date(order.created_at).toLocaleString("es")}
                </p>
              </div>

              <span className={styles.tableStatus}>
                {order.status}
              </span>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.cardLabel}>Total del pedido</span>
                <strong className={styles.detailValue}>
                  {currency(order.total)}
                </strong>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.cardLabel}>
                  Comisión registrada
                </span>
                <strong className={styles.detailValue}>
                  {currency(order.commission_total)}
                </strong>
              </div>
            </div>

            <h4 className={styles.profileTitle}>Productos del pedido</h4>

            {items.length === 0 ? (
              <p className={styles.tableEmpty}>
                Este pedido no tiene artículos registrados.
              </p>
            ) : (
              <div className={styles.orderItems}>
                {items.map((item) => (
                  <div key={item.id} className={styles.orderItem}>
                    <div>
                      <p className={styles.orderItemName}>
                        {item.product_name}
                        {item.variant ? ` — ${item.variant}` : ""}
                      </p>
                      <p className={styles.orderItemDetails}>
                        Cantidad: {item.quantity} · Precio unitario:{" "}
                        {currency(item.unit_price)}
                      </p>
                    </div>

                    <div>
                      <p className={styles.orderItemName}>
                        {currency(item.subtotal)}
                      </p>
                      <p className={styles.orderItemDetails}>
                        Comisión: {currency(item.commission_total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    )}
  </section>
)}


    </main>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className={styles.detailItem}>
      <p className={styles.cardLabel}>{label}</p>

      <p className={styles.detailValue}>
        {value || "No especificado"}
      </p>
    </div>
  );
}
