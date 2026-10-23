"use client";

import { useStorefront } from "./StorefrontProvider";

export default function GlobalCartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
  } = useStorefront();

  if (!cartOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex justify-end"
      onClick={() => setCartOpen(false)}
    >
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden="true"
      />

      <div
        className="relative z-10 h-full w-full max-w-md bg-white shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-semibold">
            Mi carrito
          </h2>

          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="text-2xl"
            aria-label="Cerrar carrito"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          {cart.length === 0 ? (
            <p className="text-gray-500">
              Tu carrito está vacío.
            </p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.product.variant ?? ""}`}
                  className="border-b pb-3"
                >
                  <p className="font-medium">
                    {item.product.name}
                  </p>

                  {item.product.variant && (
                    <p className="text-sm text-gray-500">
                      Variante: {item.product.variant}
                    </p>
                  )}

                  <p className="text-sm">
                    Cantidad: {item.quantity}
                  </p>

                  <p className="text-sm">
                    $
                    {(
                      Number(item.product.price ?? 0) *
                      item.quantity
                    ).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}