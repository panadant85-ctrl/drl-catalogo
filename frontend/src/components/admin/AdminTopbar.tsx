"use client";

import { useEffect, useState } from "react";

export default function AdminTopbar() {
  const [dateTime, setDateTime] = useState<Date | null>(null);

  useEffect(() => {
    setDateTime(new Date());

    const timer = window.setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const currentDate = dateTime ?? new Date();

  const formattedDate = currentDate.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const formattedTime = currentDate.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="admin-header-wrapper">
      {/* Barra fina superior blanca */}
      <div className="admin-datetime-bar">
        <span className="admin-datetime-date">
          {formattedDate}
        </span>

        <span className="admin-datetime-time">
          {formattedTime}
        </span>
      </div>

      {/* Barra oscura */}
      <div className="admin-topbar">
        <div className="admin-topbar-actions">
          <button
            type="button"
            className="admin-topbar-icon-button"
            aria-label="Notificaciones"
            title="Notificaciones"
          >
            <span className="admin-notification-icon">
              🔔
            </span>

            <span className="admin-notification-badge">
              3
            </span>
          </button>

          <button
            type="button"
            className="admin-user-button"
            aria-label="Usuario"
            title="Usuario"
          >
            <span className="admin-user-avatar">
              A
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}