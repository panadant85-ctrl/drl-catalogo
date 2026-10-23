"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  removeCustomerCartItem,
  clearCustomerCart,
} from "@/lib/api";
import { useStorefront } from "@/components/storefront/StorefrontProvider";

export default function CartPage() {
  const router = useRouter();

  const {
    cart,
    setCart,
    loggedIn,
    updateCartQuantityGlobal,
  } = useStorefront();

  const cartCount = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(item.product.price || 0) * item.quantity,
      0
    );
  }, [cart]);

  function getAccessToken() {
    const savedSession = localStorage.getItem(
      "drl_electronik_session"
    );

    if (!savedSession) {
      return null;
    }

    try {
      const sessionData = JSON.parse(savedSession);

      return (
        sessionData?.session?.accessToken || null
      );
    } catch {
      return null;
    }
  }

  async function removeFromCart(
    productId: number,
    variant?: string | null
  ) {
    if (!loggedIn) {
      setCart((currentCart) =>
        currentCart.filter(
          (item) =>
            !(
              item.product.id === productId &&
              item.product.variant === variant
            )
        )
      );

      return;
    }

    const accessToken = getAccessToken();

    if (!accessToken) {
      console.error(
        "No se encontró accessToken."
      );
      return;
    }

    try {
      await removeCustomerCartItem(
        accessToken,
        productId,
        variant ?? null
      );

      setCart((currentCart) =>
        currentCart.filter(
          (item) =>
            !(
              item.product.id === productId &&
              item.product.variant === variant
            )
        )
      );
    } catch (error) {
      console.error(
        "No se pudo eliminar el producto:",
        error
      );
    }
  }

  async function clearCart() {
    if (cart.length === 0) {
      return;
    }

    if (!loggedIn) {
      setCart([]);
      return;
    }

    const accessToken = getAccessToken();

    if (!accessToken) {
      console.error(
        "No se encontró accessToken."
      );
      return;
    }

    try {
      await clearCustomerCart(accessToken);
      setCart([]);
    } catch (error) {
      console.error(
        "No se pudo vaciar el carrito:",
        error
      );
    }
  }

  function goToCheckout() {
    if (cart.length === 0) {
      return;
    }

    router.push("/checkout");
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ENCABEZADO */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
            Tu compra
          </p>

          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-neutral-900 sm:text-4xl">
                Mi carrito
              </h1>

              <p className="mt-2 text-sm text-neutral-500">
                {cartCount === 0
                  ? "No tienes productos en el carrito."
                  : `${cartCount} ${
                      cartCount === 1
                        ? "producto"
                        : "productos"
                    } en tu carrito.`}
              </p>
            </div>

            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
              >
                Vaciar carrito
              </button>
            )}
          </div>
        </div>

        {/* CARRITO VACÍO */}
        {cart.length === 0 ? (
          <section className="rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
              <svg
                viewBox="0 0 24 24"
                className="h-9 w-9 text-neutral-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H6" />
                <circle cx="10" cy="20" r="1.3" />
                <circle cx="18" cy="20" r="1.3" />
              </svg>
            </div>

            <h2 className="mt-5 text-xl font-black text-neutral-900">
              Tu carrito está vacío
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              Agrega productos del catálogo para comenzar tu compra.
            </p>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-6 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Ir al catálogo
            </button>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

            {/* PRODUCTOS */}
            <section className="space-y-4">
              {cart.map((item) => {
                const product = item.product;

                const image =
                  Array.isArray(product.images) &&
                  product.images.length > 0
                    ? product.images[0]
                    : null;

                return (
                  <article
                    key={`${product.id}-${product.variant ?? ""}`}
                    className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5"
                  >
                    <div className="flex gap-4">

                      {/* IMAGEN */}
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-50 sm:h-28 sm:w-28">
                        {image ? (
                          <img
                            src={image}
                            alt={product.name}
                            className="h-full w-full object-contain p-2"
                          />
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-9 w-9 text-neutral-300"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <rect
                              x="3"
                              y="4"
                              width="18"
                              height="16"
                              rx="2"
                            />
                            <circle
                              cx="8.5"
                              cy="9"
                              r="1.5"
                            />
                            <path d="m3 17 5-5 4 4 3-3 6 5" />
                          </svg>
                        )}
                      </div>

                      {/* INFORMACIÓN */}
                      <div className="min-w-0 flex-1">
                        <h2 className="text-base font-bold leading-6 text-neutral-900 sm:text-lg">
                          {product.name}
                        </h2>

                        {product.variant && (
                          <p className="mt-1 text-sm font-bold text-red-600">
                            Variante: {product.variant}
                          </p>
                        )}

                        {(product.brand || product.model) && (
                          <p className="mt-1 text-sm text-neutral-500">
                            {product.brand}
                            {product.brand && product.model
                              ? " · "
                              : ""}
                            {product.model}
                          </p>
                        )}

                        {product.sku && (
                          <p className="mt-1 text-xs text-neutral-400">
                            SKU: {product.sku}
                          </p>
                        )}

                        <p className="mt-3 text-lg font-black text-neutral-900">
                          $
                          {Number(
                            product.price || 0
                          ).toFixed(2)}
                        </p>
                      </div>

                      {/* ELIMINAR */}
                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(
                            product.id,
                            product.variant
                          )
                        }
                        aria-label={`Eliminar ${product.name}`}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="m19 6-1 15H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                        </svg>
                      </button>
                    </div>

                    {/* CANTIDAD */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-100 pt-4">

                      <div className="flex items-center rounded-xl border border-neutral-200">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantityGlobal(
                              product.id,
                              item.quantity - 1,
                              product.variant
                            )
                          }
                          disabled={item.quantity <= 1}
                          className="flex h-10 w-10 items-center justify-center text-lg text-neutral-600 transition hover:bg-neutral-100 disabled:text-neutral-300"
                        >
                          −
                        </button>

                        <span className="flex h-10 min-w-12 items-center justify-center border-x border-neutral-200 text-sm font-bold text-neutral-900">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantityGlobal(
                              product.id,
                              item.quantity + 1,
                              product.variant
                            )
                          }
                          disabled={
                            item.quantity >=
                            Number(product.stock || 1)
                          }
                          className="flex h-10 w-10 items-center justify-center text-lg text-neutral-600 transition hover:bg-neutral-100 disabled:text-neutral-300"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-semibold text-neutral-400">
                          Subtotal
                        </p>

                        <p className="mt-1 text-lg font-black text-neutral-900">
                          $
                          {(
                            Number(product.price || 0) *
                            item.quantity
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* RESUMEN */}
            <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
              <h2 className="text-xl font-black text-neutral-900">
                Resumen de compra
              </h2>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">
                    Productos
                  </span>

                  <span className="text-sm font-bold text-neutral-900">
                    {cartCount}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                  <span className="text-sm text-neutral-500">
                    Subtotal
                  </span>

                  <span className="text-sm font-bold text-neutral-900">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-bold text-neutral-900">
                    Total
                  </span>

                  <span className="text-2xl font-black text-neutral-900">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={goToCheckout}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
              >
                Continuar para finalizar la compra

                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50"
              >
                Seguir comprando
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}