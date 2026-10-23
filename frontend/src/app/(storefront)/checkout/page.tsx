"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Checkout from "@/components/storefront/Checkout";

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
};

type CartItem = {
  product: Product;
  quantity: number;
};

const CART_KEY = "drl_electronik_cart";

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedCart =
        localStorage.getItem(CART_KEY);

      if (savedCart) {
        const parsedCart =
          JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }
    } catch (error) {
      console.error(
        "No se pudo cargar el carrito:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  function backToCart() {
    router.push("/?cart=1");
  }

  function backToStore() {
    router.push("/");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-red-600" />

          <p className="mt-4 text-sm font-semibold text-neutral-500">
            Cargando tu carrito...
          </p>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
        <div className="w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
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

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-red-600">
            DRL Electronik
          </p>

          <h1 className="mt-2 text-3xl font-black text-neutral-900">
            Tu carrito está vacío
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
            Agrega productos al carrito antes
            de continuar con la compra.
          </p>

          <button
            type="button"
            onClick={backToStore}
            className="mt-7 rounded-xl bg-red-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
          >
            Volver a la tienda
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <Checkout
        cart={cart}
        onBackToCart={backToCart}
        onBackToStore={backToStore}
      />
    </main>
  );
}