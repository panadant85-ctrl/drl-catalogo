"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getCustomerCart,
  addCustomerCartItem,
  updateCustomerCartItem,
  removeCustomerCartItem,
  clearCustomerCart,
  refreshCustomerSession,
} from "@/lib/api";

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
  family_id?: number | string | null;
  variant?: string | null;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type StorefrontContextType = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  clearCartGlobal: () => Promise<void>;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
    addToCartGlobal: (
                      product: Product,
                      quantity: number,
                      variant?: string | null
                      ) => Promise<void>;
    updateCartQuantityGlobal: (
                      productId: number,
                      quantity: number,
                      variant?: string | null
                    ) => Promise<void>;

  cartCount: number;
  setCartCount: (value: number) => void;

  cartOpen: boolean;
  setCartOpen: (value: boolean) => void;

  loggedIn: boolean;
  setLoggedIn: (value: boolean) => void;
};


const StorefrontContext =
  createContext<StorefrontContextType | null>(null);

export function StorefrontProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  
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
              "No se pudo leer la sesión del cliente:",
              error
            );

            setLoggedIn(false);
          }
        }, []);


useEffect(() => {
  if (!loggedIn) {
    return;
  }

  let refreshTimer: ReturnType<typeof setTimeout> | null = null;

  async function refreshSession() {
    const savedSession = localStorage.getItem(
      "drl_electronik_session"
    );

    if (!savedSession) {
      return;
    }

    try {
      const sessionData = JSON.parse(savedSession);

      const refreshToken =
        sessionData?.session?.refreshToken;

      const expiresAt =
        sessionData?.session?.expiresAt;

      if (!refreshToken) {
        console.error(
          "La sesión no contiene refreshToken."
        );
        return;
      }

      if (!expiresAt) {
        console.error(
          "La sesión no contiene expiresAt."
        );
        return;
      }

      const expiresAtMs =
        Number(expiresAt) * 1000;

      const now = Date.now();

      /*
       * Si faltan más de 5 minutos:
       * esperamos hasta 5 minutos antes.
       *
       * Si ya estamos dentro de los últimos 5 minutos:
       * renovamos en 30 segundos.
      */
      const refreshIn =
        Math.max(
          expiresAtMs - now - 5 * 60 * 1000,
          30 * 1000
        );
      
      
      refreshTimer = setTimeout(
        async () => {
          try {
            const result =
              await refreshCustomerSession(
                refreshToken
              );

            if (
              !result?.session?.accessToken ||
              !result?.session?.refreshToken
            ) {
              throw new Error(
                "La renovación no devolvió una sesión válida."
              );
            }

            const updatedSession = {
              ...sessionData,

              session: {
                ...sessionData.session,

                accessToken:
                  result.session.accessToken,

                refreshToken:
                  result.session.refreshToken,

                expiresAt:
                  result.session.expiresAt,

                expiresIn:
                  result.session.expiresIn,
              },
            };

            localStorage.setItem(
              "drl_electronik_session",
              JSON.stringify(updatedSession)
            );

            console.log(
              "Sesión renovada correctamente."
            );

            // Programar nuevamente la próxima renovación.
            refreshSession();
          } catch (error) {
            console.error(
              "No se pudo renovar automáticamente la sesión:",
              error
            );
          }
        },
        refreshIn
      );
    } catch (error) {
      console.error(
        "No se pudo preparar la renovación de sesión:",
        error
      );
    }
  }

  refreshSession();

  return () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }
  };
}, [loggedIn]);
        
 
useEffect(() => {
  let cancelled = false;

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
        sessionData?.session?.accessToken ??
        sessionData?.accessToken;

      if (!accessToken) {
        console.warn(
          "No se cargó el carrito: falta el token de sesión."
        );
        return;
      }

      const response = await getCustomerCart(accessToken);

      if (cancelled) return;

      const backendItems = Array.isArray(response?.data)
        ? response.data
        : [];

      const frontendCart = backendItems
        .filter((item: any) => item?.product)
        .map((item: any) => ({
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
        }));

      setCart(frontendCart);
    } catch (error) {
      if (cancelled) return;

      console.error(
        "No se pudo cargar el carrito desde el backend:",
        error
      );
    }
  }

  if (loggedIn) {
    void loadCustomerCartFromBackend();
  }

  return () => {
    cancelled = true;
  };
}, [loggedIn, setCart]);


  useEffect(() => {
        const totalItems = cart.reduce(
          (total, item) => total + item.quantity,
          0
        );

        setCartCount(totalItems);
      }, [cart]);

  /*inicio adToCart */
  async function addToCartGlobal(
        product: Product,
        quantity: number,
        variant?: string | null
      ) {
    if (!loggedIn) {
      setCart((currentCart) => {
        const existingItem = currentCart.find(
          (item) =>
            item.product.id === product.id &&
            item.product.variant === variant
        );

        if (existingItem) {
          return currentCart.map((item) =>
            item.product.id === product.id &&
            item.product.variant === variant
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                }
              : item
          );
        }

        return [
          ...currentCart,
          {
            product,
            quantity,
          },
        ];
      });

      setCartOpen(true);
      return;
    }

    try {
      const savedSession = localStorage.getItem(
        "drl_electronik_session"
      );

      if (!savedSession) return;

      const sessionData = JSON.parse(savedSession);
      const accessToken =
        sessionData?.session?.accessToken;

      if (!accessToken) return;

      await addCustomerCartItem(
          accessToken,
          product.id,
          quantity,
          variant ?? null
        );

      const response =
        await getCustomerCart(accessToken);

      const backendItems = Array.isArray(
        response?.data
      )
        ? response.data
        : [];

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
      setCartOpen(true);
    } catch (error) {
      console.error(
        "No se pudo agregar el producto al carrito:",
        error
      );
    }
  }
  /*fin addToCartGlobal */

  /*inivio update */
  async function updateCartQuantityGlobal(
    productId: number,
    quantity: number,
    variant?: string | null
  ) {
    if (!loggedIn) {
      setCart((currentCart) => {
        if (quantity <= 0) {
          return currentCart.filter(
            (item) =>
              !(
                item.product.id === productId &&
                item.product.variant === variant
              )
          );
        }

        return currentCart.map((item) => {
          if (
            item.product.id !== productId ||
            item.product.variant !== variant
          ) {
            return item;
          }

          const stock = Number(
            item.product.stock || 1
          );

          return {
            ...item,
            quantity: Math.min(quantity, stock),
          };
        });
      });

      return;
    }

    try {
      const savedSession = localStorage.getItem(
        "drl_electronik_session"
      );

      if (!savedSession) return;

      const sessionData = JSON.parse(savedSession);

      const accessToken =
        sessionData?.session?.accessToken;

      if (!accessToken) return;

      if (quantity <= 0) {
        return;
      }

      await updateCustomerCartItem(
        accessToken,
        productId,
        quantity,
        variant ?? null
      );

      const response =
        await getCustomerCart(accessToken);

      const backendItems = Array.isArray(
        response?.data
      )
        ? response.data
        : [];

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
        "No se pudo actualizar la cantidad del carrito:",
        error
      );
    }
  }
  /*fin update */

  async function clearCartGlobal() {
        if (loggedIn) {
          const savedSession = localStorage.getItem(
            "drl_electronik_session"
          );

          if (!savedSession) {
            throw new Error(
              "No se encontró la sesión del cliente."
            );
          }

          const sessionData = JSON.parse(savedSession);

          const accessToken =
            sessionData?.session?.accessToken ??
            sessionData?.accessToken;

          if (!accessToken) {
            throw new Error(
              "No se encontró el token de acceso."
            );
          }

          await clearCustomerCart(accessToken);
        }

        setCart([]);
        setCartCount(0);
      }

  return (
    <StorefrontContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        
        clearCartGlobal,
        
        cart,
        setCart,
        addToCartGlobal,
        updateCartQuantityGlobal,

        cartCount,
        setCartCount,

        cartOpen,
        setCartOpen,

        loggedIn,
        setLoggedIn,
      }}
    >
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const context = useContext(StorefrontContext);

  if (!context) {
    throw new Error(
      "useStorefront debe utilizarse dentro de StorefrontProvider"
    );
  }

  return context;
}