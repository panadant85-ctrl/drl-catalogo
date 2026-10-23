"use client";

import styles from "./Dashboard.module.css";

const summaryCards = [
  {
    label: "Ventas",
    value: "$12,840.00",
    detail: "Este mes",
    icon: "$",
  },
  {
    label: "Pedidos",
    value: "184",
    detail: "Este mes",
    icon: "↗",
  },
  {
    label: "Clientes",
    value: "1,248",
    detail: "Registrados",
    icon: "♙",
  },
  {
    label: "Productos",
    value: "326",
    detail: "En catálogo",
    icon: "▣",
  },
];

const orders = [
  {
    id: "DRL-20260924-18452",
    customer: "Cliente de ejemplo",
    total: "$245.00",
    status: "Procesando",
  },
  {
    id: "DRL-20260924-17391",
    customer: "Cliente de ejemplo",
    total: "$89.50",
    status: "Completado",
  },
  {
    id: "DRL-20260923-62918",
    customer: "Cliente de ejemplo",
    total: "$420.00",
    status: "Pendiente",
  },
  {
    id: "DRL-20260923-31547",
    customer: "Cliente de ejemplo",
    total: "$135.00",
    status: "Completado",
  },
];

const lowStock = [
  {
    name: "CALENTADOR DE AGUA RUDENKOV 30LT",
    stock: 3,
  },
  {
    name: "CALENTADOR DE AGUA RUDENKOV 50LT",
    stock: 5,
  },
  {
    name: "Producto de ejemplo",
    stock: 2,
  },
];

export default function DashboardContent() {
  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeading}>
        <div>
          <h1>Inicio</h1>
          <p>Resumen general de tu tienda.</p>
        </div>
      </div>

      <section className={styles.cardsGrid}>
        {summaryCards.map((card) => (
          <article key={card.label} className={styles.summaryCard}>
            <div className={styles.summaryIcon}>{card.icon}</div>

            <div className={styles.summaryInfo}>
              <span className={styles.summaryLabel}>
                {card.label}
              </span>

              <strong className={styles.summaryValue}>
                {card.value}
              </strong>

              <span className={styles.summaryDetail}>
                {card.detail}
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.mainGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Ventas</h2>
              <span>Resumen de los últimos meses</span>
            </div>

            <button type="button" className={styles.periodButton}>
              Últimos 6 meses
              <span>⌄</span>
            </button>
          </div>

          <div className={styles.chartArea}>
            <div className={styles.chartYAxis}>
              <span>$15k</span>
              <span>$10k</span>
              <span>$5k</span>
              <span>$0</span>
            </div>

            <div className={styles.chart}>
              <div className={styles.chartGridLine} />
              <div className={styles.chartGridLine} />
              <div className={styles.chartGridLine} />
              <div className={styles.chartGridLine} />

              <div className={styles.chartBars}>
                <div className={styles.barGroup}>
                  <div
                    className={styles.bar}
                    style={{ height: "42%" }}
                  />
                  <span>Abr</span>
                </div>

                <div className={styles.barGroup}>
                  <div
                    className={styles.bar}
                    style={{ height: "58%" }}
                  />
                  <span>May</span>
                </div>

                <div className={styles.barGroup}>
                  <div
                    className={styles.bar}
                    style={{ height: "49%" }}
                  />
                  <span>Jun</span>
                </div>

                <div className={styles.barGroup}>
                  <div
                    className={styles.bar}
                    style={{ height: "72%" }}
                  />
                  <span>Jul</span>
                </div>

                <div className={styles.barGroup}>
                  <div
                    className={styles.bar}
                    style={{ height: "67%" }}
                  />
                  <span>Ago</span>
                </div>

                <div className={styles.barGroup}>
                  <div
                    className={styles.bar}
                    style={{ height: "86%" }}
                  />
                  <span>Sep</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Stock bajo</h2>
              <span>Productos que requieren atención</span>
            </div>

            <a href="/admin/stock" className={styles.panelLink}>
              Ver stock
            </a>
          </div>

          <div className={styles.stockList}>
            {lowStock.map((product) => (
              <div key={product.name} className={styles.stockItem}>
                <div className={styles.productPlaceholder}>
                  ▣
                </div>

                <div className={styles.stockInfo}>
                  <strong>{product.name}</strong>
                  <span>Stock disponible</span>
                </div>

                <div className={styles.stockNumber}>
                  {product.stock}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Pedidos recientes</h2>
            <span>Últimos pedidos registrados</span>
          </div>

          <a href="/admin/orders" className={styles.panelLink}>
            Ver todos
          </a>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className={styles.orderId}>
                    {order.id}
                  </td>

                  <td>{order.customer}</td>

                  <td className={styles.orderTotal}>
                    {order.total}
                  </td>

                  <td>
                    <span
                      className={`${styles.status} ${
                        order.status === "Completado"
                          ? styles.statusSuccess
                          : order.status === "Pendiente"
                          ? styles.statusWarning
                          : styles.statusProcessing
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className={styles.mockNotice}>
        <strong>Nota:</strong> estos valores son datos visuales de
        demostración. Más adelante conectaremos el dashboard con
        los datos reales de Supabase.
      </div>
    </div>
  );
}