"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  removeCustomerCartItem,
  clearCustomerCart,
} from "@/lib/api";
import { useStorefront } from "./StorefrontProvider";

type Product = {
  id: number;
  name: string;
  brand?: string | null;
  model?: string | null;
  sku?: string | null;
  category?: string | null;
  price?: number | null;
  stock?: number | null;
  description?: string | null;
  images?: string[] | null;
  family_id?: string | null;
  variant?: string | null;
};

type CartItem = {
  product: Product;
  quantity: number;
};

function getAccessToken() {
  const savedSession = localStorage.getItem(
    "drl_electronik_session"
  );

  if (!savedSession) {
    return null;
  }

  try {
    const sessionData = JSON.parse(
      savedSession
    );

    return (
      sessionData?.session?.accessToken ||
      null
    );
  } catch {
    return null;
  }
}

export default function CartDrawer() {
  const router = useRouter();

  const {
    cart,
    setCart,
    loggedIn,
    cartOpen,
    setCartOpen,
    updateCartQuantityGlobal,
  } = useStorefront();

  const cartCount = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(item.product.price || 0) *
          item.quantity,
      0
    );
  }, [cart]);

  async function updateCartQuantity(
    productId: number,
    quantity: number
  ) {
    const item = cart.find(
      (cartItem) =>
        cartItem.product.id === productId
    );

    if (!item) {
      return;
    }

    await updateCartQuantityGlobal(
      productId,
      quantity,
      item.product.variant
    );
  }

  async function removeFromCart(
    productId: number
  ) {
    const item = cart.find(
      (cartItem) =>
        cartItem.product.id === productId
    );

    if (!item) {
      return;
    }

    /*
     * Cliente anónimo:
     * eliminar solamente del carrito local.
     */
    if (!loggedIn) {
      setCart((currentCart) =>
        currentCart.filter(
          (cartItem) =>
            cartItem.product.id !==
            productId
        )
      );

      return;
    }

    /*
     * Cliente conectado:
     * eliminar desde Supabase.
     */
    const accessToken =
      getAccessToken();

    if (!accessToken) {
      console.error(
        "No se encontró accessToken para eliminar el producto."
      );
      return;
    }

    try {
      await removeCustomerCartItem(
        accessToken,
        productId,
        item.product.variant ?? null
      );

      /*
       * El StorefrontProvider ya mantiene
       * el estado global del carrito.
       *
       * Quitamos solamente el producto
       * eliminado del estado local/global.
       */
      setCart((currentCart) =>
        currentCart.filter(
          (cartItem) =>
            cartItem.product.id !==
            productId
        )
      );
    } catch (error) {
      console.error(
        "No se pudo eliminar el producto del carrito:",
        error
      );
    }
  }

  async function clearCart() {
    /*
     * Cliente anónimo:
     * vaciar solamente el carrito local.
     */
    if (!loggedIn) {
      setCart([]);
      return;
    }

    /*
     * Cliente conectado:
     * vaciar el carrito desde Supabase.
     */
    const accessToken =
      getAccessToken();

    if (!accessToken) {
      console.error(
        "No se encontró accessToken para vaciar el carrito."
      );
      return;
    }

    try {
      await clearCustomerCart(
        accessToken
      );

      setCart([]);
    } catch (error) {
      console.error(
        "No se pudo vaciar el carrito:",
        error
      );
    }
  }

  function openCheckout() {
    if (cart.length === 0) {
      return;
    }

    setCartOpen(false);

    router.push("/checkout");
  }

  if (!cartOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9998]">
      {/* Fondo */}
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={() =>
          setCartOpen(false)
        }
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Panel */}
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header carrito */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
              Tu compra
            </p>

            <h2 className="mt-1 text-2xl font-black text-neutral-900">
              Carrito
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              setCartOpen(false)
            }
            aria-label="Cerrar carrito"
            className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {/* Carrito vacío */}
        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
              <svg
                viewBox="0 0 24 24"
                className="h-9 w-9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H6" />

                <circle
                  cx="10"
                  cy="20"
                  r="1.3"
                />

                <circle
                  cx="18"
                  cy="20"
                  r="1.3"
                />
              </svg>
            </div>

            <h3 className="mt-5 text-lg font-bold text-neutral-900">
              Tu carrito está vacío
            </h3>

            <p className="mt-2 max-w-xs text-sm leading-6 text-neutral-500">
              Agrega productos del catálogo
              para comenzar tu compra.
            </p>

            <button
              type="button"
              onClick={() =>
                setCartOpen(false)
              }
              className="mt-6 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Seguir comprando
            </button>
          </div>
        ) : (
          <>
            {/* Productos */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                {cart.map((item) => {
                  const product =
                    item.product;

                  const image =
                    Array.isArray(
                      product.images
                    ) &&
                    product.images.length > 0
                      ? product.images[0]
                      : null;

                  return (
                    <div
                      key={product.id}
                      className="rounded-2xl border border-neutral-200 p-4"
                    >
                      <div className="flex gap-4">
                        {/* Imagen */}
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-50">
                          {image ? (
                            <img
                              src={image}
                              alt={
                                product.name
                              }
                              className="h-full w-full object-contain p-2"
                            />
                          ) : (
                            <svg
                              viewBox="0 0 24 24"
                              className="h-8 w-8 text-neutral-300"
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

                        {/* Información */}
                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-2 text-sm font-bold leading-5 text-neutral-900">
                            {product.name}
                          </h3>

                          {product.variant && (
                            <p className="mt-1 text-xs font-bold text-red-600">
                              Variante:{" "}
                              {
                                product.variant
                              }
                            </p>
                          )}

                          {(
                            product.brand ||
                            product.model
                          ) && (
                            <p className="mt-1 text-xs text-neutral-500">
                              {
                                product.brand
                              }

                              {product.brand &&
                              product.model
                                ? " · "
                                : ""}

                              {
                                product.model
                              }
                            </p>
                          )}

                          {product.sku && (
                            <p className="mt-1 text-[11px] text-neutral-400">
                              SKU:{" "}
                              {product.sku}
                            </p>
                          )}

                          <p className="mt-2 text-base font-black text-neutral-900">
                            $
                            {Number(
                              product.price ||
                                0
                            ).toFixed(2)}
                          </p>
                        </div>

                        {/* Eliminar */}
                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(
                              product.id
                            )
                          }
                          aria-label={`Eliminar ${product.name}`}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
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

                      {/* Cantidad */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center rounded-xl border border-neutral-200">
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(
                                product.id,
                                item.quantity -
                                  1
                              )
                            }
                            disabled={
                              item.quantity <=
                              1
                            }
                            className="flex h-9 w-9 items-center justify-center text-neutral-600 transition hover:bg-neutral-100 disabled:text-neutral-300"
                          >
                            −
                          </button>

                          <span className="flex h-9 min-w-10 items-center justify-center border-x border-neutral-200 text-sm font-bold text-neutral-900">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(
                                product.id,
                                item.quantity +
                                  1
                              )
                            }
                            disabled={
                              item.quantity >=
                              Number(
                                product.stock ||
                                  1
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center text-neutral-600 transition hover:bg-neutral-100 disabled:text-neutral-300"
                          >
                            +
                          </button>
                        </div>

                        <p className="text-sm font-black text-neutral-900">
                          $
                          {(
                            Number(
                              product.price ||
                                0
                            ) *
                            item.quantity
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-500">
                  Productos
                </span>

                <span className="text-sm font-bold text-neutral-900">
                  {cartCount}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-base font-bold text-neutral-900">
                  Total
                </span>

                <span className="text-2xl font-black text-neutral-900">
                  $
                  {cartTotal.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                onClick={clearCart}
                disabled={
                  cart.length === 0
                }
                className="cart-clear-button"
              >
                <span className="cart-clear-icon">
                  🗑️
                </span>

                <span>
                  Vaciar carrito
                </span>
              </button>

              <button
                type="button"
                onClick={openCheckout}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
              >
                Continuar para finalizar
                la compra

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
            </div>
          </>
        )}
      </aside>
    </div>
  );
}