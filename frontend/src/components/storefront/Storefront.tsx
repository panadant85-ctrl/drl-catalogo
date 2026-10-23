"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCustomerCart,
  addCustomerCartItem,
  updateCustomerCartItem,
  removeCustomerCartItem,
  clearCustomerCart,
} from "@/lib/api";

import Hero from "./Hero";
import CategoryNav from "./CategoryNav";
import ProductGrid from "./ProductGrid";
import CategoryCarousel from "./CategoryCarousel";
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

type StorefrontProps = {
  products: Product[];
};


export default function Storefront({
  products,
}: StorefrontProps) {
  const router = useRouter();

  const {
  searchQuery,
  setSearchQuery,
  cart,
  setCart,
  addToCartGlobal,
  updateCartQuantityGlobal,
  loggedIn,
  setLoggedIn,
  cartOpen,
  setCartOpen,
} = useStorefront();
  
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
      sessionData?.session?.accessToken ||
      null
    );
  } catch (error) {
    console.error(
      "No se pudo obtener el accessToken:",
      error
    );

    return null;
  }
}

  
  /*
   * Permite regresar desde checkout
   * directamente con ?cart=1
   */

  useEffect(() => {
            const savedSession = localStorage.getItem(
              "drl_electronik_session"
            );

            if (!savedSession) {
              setLoggedIn(false);
              return;
            }

            try {
              const sessionData = JSON.parse(savedSession);

              if (sessionData?.user?.id) {
                setLoggedIn(true);
              } else {
                setLoggedIn(false);
              }
            } catch (error) {
              console.error(
                "No se pudo leer la sesión:",
                error
              );

              setLoggedIn(false);
            }
          }, []);

      async function loadCustomerCartFromBackend() {
        const savedSession = localStorage.getItem(
          "drl_electronik_session"
        );

        if (!savedSession) {
          return;
        }

        try {
          const sessionData = JSON.parse(savedSession);

          const accessToken =
            sessionData?.session?.accessToken;

          if (!accessToken) {
            console.error(
              "La sesión no contiene accessToken."
            );
            return;
          }

          const response =
            await getCustomerCart(accessToken);
console.log(
  "CARRITO RECIBIDO DEL BACKEND:",
  response
);
          const backendItems = Array.isArray(
            response?.data
          )
            ? response.data
            : [];
console.log(
  "PRODUCTOS DEL CARRITO:",
  backendItems
);
          const frontendCart = backendItems.map(
            (item: any) => ({
              product: {
                id: item.product.id,
                name: item.product.name,
                brand: item.product.brand,
                model: item.product.model,
                sku: item.product.sku,
                category: item.product.category,
                price: item.product.price,
                stock: item.product.stock,
                description: item.product.description,
                images: item.product.images,
                family_id: item.product.family_id,
                variant: item.product.variant,
              },
              quantity: item.quantity,
            })
          );

          setCart(frontendCart);
          
        } catch (error) {
          console.error(
            "No se pudo cargar el carrito desde el backend:",
            error
          );
        }
      }
      
   

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.search.includes("cart=1")
    ) {
      setCartOpen(true);

      window.history.replaceState(
        {},
        "",
        window.location.pathname
      );
    }
  }, []);

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
        Number(item.product.price || 0) *
          item.quantity,
      0
    );
  }, [cart]);

  async function addToCart(product: Product) {
  const stock = Number(product.stock || 0);

  if (stock <= 0) {
    return;
  }

  await addToCartGlobal(
    product,
    1,
    product.variant
  );
}
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

  async function removeFromCart(productId: number)
            {
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
                      cartItem.product.id !== productId
                  )
                );

                return;
              }

              /*
              * Cliente conectado:
              * eliminar desde Supabase.
              */
              const accessToken = getAccessToken();

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

                await loadCustomerCartFromBackend();
              } catch (error) {
                console.error(
                  "No se pudo eliminar el producto del carrito:",
                  error
                );
              }
            }

  async function clearCart() 
          {
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
            const accessToken = getAccessToken();

            if (!accessToken) {
              console.error(
                "No se encontró accessToken para vaciar el carrito."
              );
              return;
            }

            try {
              await clearCustomerCart(accessToken);

              await loadCustomerCartFromBackend();
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
  
  return (
    <>
      

      <main>
        <Hero />

        <CategoryNav />
      
          {/* =========================================
            CARRUSELES POR CATEGORÍA
            ========================================= */}
        {/*<div id="carruseles-categorias">

            <CategoryCarousel
                category="Electrodomésticos"
                categories={[
                "ARTICULOS ELECTRODOMESTICO",
                "Electrodoméstico",
                ]}
                products={products}
                onAddToCart={addToCart}
            />

            <CategoryCarousel
                category="Ferretería"
                categories={[
                "ARTICULOS DE FERRETERIA",
                ]}
                products={products}
                onAddToCart={addToCart}
            />

            <CategoryCarousel
                category="Iluminación"
                categories={[
                "ILUMINARIAS",
                ]}
                products={products}
                onAddToCart={addToCart}
            />

            <CategoryCarousel
                category="Hogar"
                categories={[
                "UTILES DEL HOGAR",
                ]}
                products={products}
                onAddToCart={addToCart}
            />

            <CategoryCarousel
                category="Electricidad"
                categories={[
                "ELECTRICIDAD",
                ]}
                products={products}
                onAddToCart={addToCart}
            />

         </div>*/}
        
        {/* =========================================
            CATÁLOGO COMPLETO
            ========================================= */}

        <section
          id="catalogo"
          className="drl-section"
        >
          <div className="drl-container">
            <div
              id="destacados"
              className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
            >
              <div>
                <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-red-600">
                  Nuestro catálogo
                </p>

                <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
                  Productos para ti
                </h1>

                <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-500">
                  Encuentra electrodomésticos,
                  herramientas, iluminación,
                  productos para el hogar y
                  soluciones eléctricas.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Productos disponibles
                </p>

                <p className="mt-1 text-2xl font-black text-neutral-900">
                  {products.length}
                </p>
              </div>
            </div>

            <ProductGrid
              products={products}
              searchQuery={searchQuery}
              onAddToCart={addToCart}
            />
          </div>
        </section>
      </main>

      {/* =========================================
          CARRITO
          ========================================= */}
      
    </>
  );
}