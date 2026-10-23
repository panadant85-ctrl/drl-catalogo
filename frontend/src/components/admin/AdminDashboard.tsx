"use client";
import DashboardShell from "./dashboard/DashboardShell";

const summaryCards = [
  {
    title: "Ventas",
    value: "$12,840.00",
    detail: "+8.4% este mes",
    icon: "$",
    type: "sales",
  },
  {
    title: "Pedidos",
    value: "184",
    detail: "+12 nuevos hoy",
    icon: "#",
    type: "orders",
  },
  {
    title: "Clientes",
    value: "1,248",
    detail: "+38 este mes",
    icon: "♙",
    type: "customers",
  },
  {
    title: "Productos",
    value: "326",
    detail: "18 con stock bajo",
    icon: "▦",
    type: "products",
  },
];

const orders = [
  {
    number: "DRL-20260924-18452",
    customer: "Cliente de Prueba",
    date: "24 Sep 2026",
    total: "$485.00",
    status: "Pagado",
  },
  {
    number: "DRL-20260924-17231",
    customer: "Carlos Rodríguez",
    date: "24 Sep 2026",
    total: "$1,240.00",
    status: "Procesando",
  },
  {
    number: "DRL-20260923-95421",
    customer: "María González",
    date: "23 Sep 2026",
    total: "$89.50",
    status: "Entregado",
  },
  {
    number: "DRL-20260923-81294",
    customer: "José Pérez",
    date: "23 Sep 2026",
    total: "$720.00",
    status: "Pendiente",
  },
];

const lowStock = [
  {
    name: "CALENTADOR DE AGUA RUDENKOV 30LT",
    stock: 2,
    variant: "30 L",
  },
  {
    name: "CALENTADOR DE AGUA RUDENKOV 50LT",
    stock: 3,
    variant: "50 L",
  },
  {
    name: "Producto con stock limitado",
    stock: 4,
    variant: "Único",
  },
];

export default function AdminDashboard() {
  return (
    <DashboardShell>
    <div className="admin-dashboard">
      <div className="admin-page-heading">
        <div>
          <h1>Inicio</h1>

          <div className="admin-page-path">
            <span>Dashboard</span>
            <span>/</span>
            <strong>Inicio</strong>
          </div>
        </div>

        <button type="button" className="admin-primary-button">
          + Nuevo pedido
        </button>
      </div>

      <section className="admin-summary-grid">
        {summaryCards.map((card) => (
          <article
            key={card.title}
            className={`admin-summary-card ${card.type}`}
          >
            <div className="admin-summary-top">
              <div>
                <span className="admin-summary-title">
                  {card.title}
                </span>

                <strong className="admin-summary-value">
                  {card.value}
                </strong>
              </div>

              <div className="admin-summary-icon">
                {card.icon}
              </div>
            </div>

            <div className="admin-summary-detail">
              {card.detail}
            </div>
          </article>
        ))}
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-panel admin-sales-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Ventas</h2>
              <p>Resumen de ventas de los últimos meses</p>
            </div>

            <select defaultValue="6">
              <option value="6">Últimos 6 meses</option>
              <option value="12">Últimos 12 meses</option>
            </select>
          </div>

          <div className="admin-chart">
            <div className="admin-chart-y">
              <span>$15k</span>
              <span>$10k</span>
              <span>$5k</span>
              <span>$0</span>
            </div>

            <div className="admin-chart-area">
              <div className="admin-chart-grid-line line-1" />
              <div className="admin-chart-grid-line line-2" />
              <div className="admin-chart-grid-line line-3" />
              <div className="admin-chart-grid-line line-4" />

              <div className="admin-chart-bars">
                <span style={{ height: "42%" }} />
                <span style={{ height: "55%" }} />
                <span style={{ height: "48%" }} />
                <span style={{ height: "67%" }} />
                <span style={{ height: "58%" }} />
                <span style={{ height: "76%" }} />
                <span style={{ height: "70%" }} />
                <span style={{ height: "88%" }} />
                <span style={{ height: "64%" }} />
                <span style={{ height: "82%" }} />
                <span style={{ height: "73%" }} />
                <span style={{ height: "94%" }} />
              </div>

              <div className="admin-chart-months">
                <span>Abr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Ago</span>
                <span>Sep</span>
              </div>
            </div>
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Actividad reciente</h2>
              <p>Últimas operaciones</p>
            </div>

            <button type="button" className="admin-link-button">
              Ver todo
            </button>
          </div>

          <div className="admin-activity-list">
            <div className="admin-activity-item">
              <div className="admin-activity-icon">+</div>
              <div>
                <strong>Nuevo pedido recibido</strong>
                <span>Hace 12 minutos</span>
              </div>
            </div>

            <div className="admin-activity-item">
              <div className="admin-activity-icon">♙</div>
              <div>
                <strong>Nuevo cliente registrado</strong>
                <span>Hace 36 minutos</span>
              </div>
            </div>

            <div className="admin-activity-item">
              <div className="admin-activity-icon">▦</div>
              <div>
                <strong>Producto actualizado</strong>
                <span>Hace 1 hora</span>
              </div>
            </div>

            <div className="admin-activity-item">
              <div className="admin-activity-icon">✓</div>
              <div>
                <strong>Pedido entregado</strong>
                <span>Hace 2 horas</span>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="admin-bottom-grid">
        <article className="admin-panel admin-orders-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Pedidos recientes</h2>
              <p>Últimos pedidos registrados</p>
            </div>

            <button type="button" className="admin-link-button">
              Ver pedidos
            </button>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.number}>
                    <td>
                      <strong>{order.number}</strong>
                    </td>

                    <td>{order.customer}</td>

                    <td>{order.date}</td>

                    <td>
                      <strong>{order.total}</strong>
                    </td>

                    <td>
                      <span
                        className={`admin-status ${order.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Stock bajo</h2>
              <p>Productos que requieren atención</p>
            </div>

            <button type="button" className="admin-link-button">
              Ver stock
            </button>
          </div>

          <div className="admin-stock-list">
            {lowStock.map((product) => (
              <div className="admin-stock-item" key={product.name}>
                <div className="admin-stock-image">▦</div>

                <div className="admin-stock-info">
                  <strong>{product.name}</strong>
                  <span>Variante: {product.variant}</span>
                </div>

                <div className="admin-stock-number">
                  <strong>{product.stock}</strong>
                  <span>unid.</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
   </DashboardShell>
  );
}