
"use client";

import { useState } from "react";

import {
  createPosOrder,
} from "@/lib/api";

import {
  getAdminAccessToken,
} from "@/lib/adminSession";

export default function PosPage() {
  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function handleTestSale() {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const accessToken =
        getAdminAccessToken();

      const result =
        await createPosOrder(
          accessToken,
          {
            customer_id: 6,
            items: [
              {
                product_id: 77,
                quantity: 1,
              },
            ],
            notes:
              "Prueba venta POS DRL",
          }
        );

        setMessage(
        `Venta creada correctamente. Pedido: ${
          result?.data?.order_number ||
          result?.data?.id ||
          "OK"
        }`
      );
    } catch (err) {
      
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar la venta."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        padding: "40px",
      }}
    >
      <h1>
        POS — DRL Electronik
      </h1>

      <p>
        Prueba de registro de venta
      </p>

      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          maxWidth: "500px",
        }}
      >
        <p>
          <strong>Cliente:</strong>{" "}
          Cliente de Prueba DRL
        </p>

        <p>
          <strong>Producto:</strong>{" "}
          PRODUCTO PRUEBA INVENTARIO
        </p>

        <p>
          <strong>Cantidad:</strong> 1
        </p>

        <p>
          <strong>Precio:</strong>{" "}
          $10.00
        </p>

        <button
          type="button"
          onClick={handleTestSale}
          disabled={loading}
          style={{
            marginTop: "20px",
            padding: "12px 20px",
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {loading
            ? "Registrando..."
            : "PROBAR VENTA POS"}
        </button>

        {message && (
          <p
            style={{
              marginTop: "20px",
              color: "green",
              fontWeight: 600,
            }}
          >
            {message}
          </p>
        )}

        {error && (
          <p
            style={{
              marginTop: "20px",
              color: "red",
              fontWeight: 600,
            }}
          >
            {error}
          </p>
        )}
      </div>
    </main>
  );
}