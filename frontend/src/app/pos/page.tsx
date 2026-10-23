
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";


import { useRouter } from "next/navigation";
import { checkAdminAccess, getProducts } from "@/lib/api";
import {
  clearPosSession,
  getPosSession,
} from "@/lib/posSession";

type Product = {
  id: number;
  name: string;
  brand?: string | null;
  model?: string | null;
  sku?: string | null;
  category?: string | null;
  price: number;
  stock: number;
  images?: string[] | null;
  variant?: string | null;
  active?: boolean;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type Customer = {
  id: number;
  full_name?: string | null;
  identification?: string | null;
  email?: string | null;
  phone?: string | null;
};


type SaleReceipt = {
  orderNumber: string;
  date: string;
  cashier: string;
  customer: Customer;
  items: CartItem[];
  total: number;
};


const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const money = (value: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(value);

export default function PosPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cashier, setCashier] = useState("Vendedor");
  const [customerSearch, setCustomerSearch] = useState("");

  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState("");
  const [processingSale, setProcessingSale] = useState(false);

  const [receipt, setReceipt] = useState<SaleReceipt | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

       

    try {

      const session = getPosSession();

      if (!session?.accessToken) {
        router.replace("/pos/login");
        return;
      }

      const access = await checkAdminAccess(session.accessToken);

      if (
        access?.role?.code !== "vendedor" ||
        access?.role?.active !== true
      ) {
        clearPosSession();
        router.replace("/pos/login");
        return;
      }

      setCashier(
        session.user.user_metadata?.full_name?.toString() ||
          session.user.email ||
          "Vendedor"
      );

      const [productsResult, customersResponse] = await Promise.all([
        getProducts(),
        fetch(`${API_URL}/api/customers`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          cache: "no-store",
        }),
      ]);

      const productList = Array.isArray(productsResult)
        ? productsResult
        : Array.isArray(productsResult?.data)
          ? productsResult.data
          : [];

      setProducts(
        productList.filter(
          (product: Product) =>
            product.active !== false && Number(product.stock) > 0
        )
      );

      if (customersResponse.ok) {
        const customersResult = await customersResponse.json();
        const customerList = Array.isArray(customersResult)
          ? customersResult
          : Array.isArray(customersResult?.data)
            ? customersResult.data
            : [];

        setCustomers(customerList);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los datos de la caja."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return products;

    return products.filter((product) =>
      [
        product.name,
        product.brand,
        product.model,
        product.sku,
        product.category,
        product.variant,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [products, search]);

  const filteredCustomers = useMemo(() => {
    const term = customerSearch.trim().toLowerCase();

    if (!term) return customers;

    return customers.filter((customer) =>
      [
        customer.full_name,
        customer.identification,
        customer.email,
        customer.phone,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [customers, customerSearch]);

  const selectedCustomer = customers.find(
    (customer) => String(customer.id) === customerId
  );

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const total = cart.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find(
        (item) => item.product.id === product.id
      );

      if (existing) {
        if (existing.quantity >= product.stock) return current;

        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      if (product.stock < 1) return current;

      return [...current, { product, quantity: 1 }];
    });
  }

  function changeQuantity(productId: number, amount: number) {
    setCart((current) =>
      current
        .map((item) => {
          if (item.product.id !== productId) return item;

          const quantity = item.quantity + amount;

          if (quantity < 1) return null;
          if (quantity > item.product.stock) return item;

          return { ...item, quantity };
        })
        .filter((item): item is CartItem => item !== null)
    );
  }

  function removeFromCart(productId: number) {
    setCart((current) =>
      current.filter((item) => item.product.id !== productId)
    );
  }

  
async function handleCharge() {
    if (processingSale) return;

    setCheckoutError("");
    setCheckoutSuccess("");

    if (!customerId) {
        setCheckoutError(
        "Debes seleccionar un cliente antes de cobrar."
        );
        return;
    }

    if (!selectedCustomer) {
        setCheckoutError(
          "Selecciona un cliente válido antes de cobrar."
        );
        return;
      }

    if (cart.length === 0) {
        setCheckoutError("Añade al menos un producto a la venta.");
        return;
    }

    const session = getPosSession();

    if (!session?.accessToken) {
        clearPosSession();
        router.replace("/pos/login");
        return;
    }

    setProcessingSale(true);

    try {
        const response = await fetch(`${API_URL}/api/orders/pos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
            customer_id: Number(customerId),
            notes: null,
            items: cart.map(({ product, quantity }) => ({
            product_id: product.id,
            quantity,
            variant: product.variant ?? null,
            })),
        }),
        });

        const result = await response.json().catch(() => null);

        if (!response.ok || result?.success !== true) {
        throw new Error(
            result?.message ||
            "No se pudo registrar la venta. Revisa los datos e inténtalo de nuevo."
        );
        }

        
        const orderNumber = String(
        result.data?.order_number ||
        (result.data?.id ? `ID ${result.data.id}` : "Venta registrada")
        );

        // Guardar una copia de los datos para el comprobante.
        setReceipt({
        orderNumber,
        date: new Date().toLocaleString("es-ES"),
        cashier,
        customer: selectedCustomer,
        items: cart.map((item) => ({
            product: { ...item.product },
            quantity: item.quantity,
        })),
        total,
        });

        setCart([]);
        setCustomerId("");
        setCustomerSearch("");

        setCheckoutSuccess(
        `Venta ${orderNumber} registrada correctamente.`
        );


        await loadData();
    } catch (err) {
        setCheckoutError(
        err instanceof Error
            ? err.message
            : "Ocurrió un error al registrar la venta."
        );
    } finally {
        setProcessingSale(false);
    }
    }


  function logout() {
    clearPosSession();
    router.replace("/pos/login");
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-20 bg-slate-950 text-white shadow-lg">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 font-black">
              DRL
            </div>
            <div>
              <h1 className="text-lg font-bold">DRL Electronik</h1>
              <p className="text-xs text-slate-400">Punto de venta</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-400">Vendedor conectado</p>
              <p className="max-w-56 truncate text-sm font-semibold">
                {cashier}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-800 bg-emerald-950 px-3 py-2 text-sm text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Sesión activa
            </div>

            <button
              onClick={logout}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1800px] grid-cols-1 gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:p-6">
        <section className="min-w-0">
          <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Catálogo de productos</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Busca y selecciona los productos de la venta.
                </p>
              </div>

              <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
                {filteredProducts.length} productos
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                ⌕
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre, marca, modelo o SKU..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-white p-12 text-center text-slate-500 shadow-sm">
              Cargando caja y catálogo...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
              <p className="font-semibold text-red-700">
                No se pudo cargar el punto de venta
              </p>
              <p className="mt-2 break-words text-sm text-slate-600">
                {error}
              </p>
              <button
                onClick={() => void loadData()}
                className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Reintentar
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
              <p className="font-semibold">No hay productos disponibles</p>
              <p className="mt-2 text-sm text-slate-500">
                Prueba otra búsqueda o revisa el inventario.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  
                {Number(product.stock) >= 1 &&
                  Number(product.stock) <= 3 && (
                    <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 shrink-0 animate-[bell-ring_1s_ease-in-out_infinite]"
                        aria-hidden="true"
                      >
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                        <path d="M10 21h4" />
                      </svg>
                      ¡Casi agotado!
                    </div>
                  )}

                  <div className="flex h-36 items-center justify-center bg-slate-50 p-4">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200 text-2xl text-slate-500">
                        ▦
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                      {product.brand || product.category || "Producto"}
                    </p>

                    <h3 className="mt-1 line-clamp-2 min-h-12 font-semibold">
                      {product.name}
                    </h3>

                    {(product.model || product.variant || product.sku) && (
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {[product.model, product.variant, product.sku]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}

                    <div className="mt-auto flex items-end justify-between gap-2 pt-4">
                      <div>
                        <p className="text-xl font-bold text-slate-900">
                          {money(Number(product.price) || 0)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Existencia: {product.stock}
                        </p>
                      </div>

                      <button
                        onClick={() => addToCart(product)}
                        className="rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                        aria-label={`Agregar ${product.name}`}
                      >
                        + Añadir
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="h-fit min-w-0 rounded-2xl bg-white shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="text-xl font-bold">Venta actual</h2>
              <p className="mt-1 text-sm text-slate-500">
                {totalItems} {totalItems === 1 ? "artículo" : "artículos"}
              </p>
            </div>

            <button
              onClick={() => setCart([])}
              disabled={cart.length === 0}
              className="text-sm font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Vaciar
            </button>
          </div>

          <div className="space-y-3 border-b border-slate-100 p-5">
            <label
              htmlFor="customer-search"
              className="block text-sm font-semibold"
            >
              Cliente
            </label>

            <input
              id="customer-search"
              value={customerSearch}
              onChange={(event) => setCustomerSearch(event.target.value)}
              placeholder="Buscar cliente por nombre o teléfono..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            />

            <select
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            >
              <option value="">Venta sin cliente asignado</option>
              {filteredCustomers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name || `Cliente ${customer.id}`}
                  {customer.phone ? ` · ${customer.phone}` : ""}
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <p className="text-xs text-slate-500">
                Identificación: {selectedCustomer.identification || "No registrada"}
              </p>
            )}
          </div>

          <div className="max-h-[420px] min-h-32 space-y-3 overflow-y-auto p-5">
            {cart.length === 0 ? (
              <div className="flex min-h-32 flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                  🛒
                </div>
                <p className="font-medium text-slate-700">
                  El carrito está vacío
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Añade productos del catálogo.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 border-b border-slate-100 pb-3 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold">
                      {item.product.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {money(Number(item.product.price) || 0)} por unidad
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => changeQuantity(item.product.id, -1)}
                        className="h-7 w-7 rounded-md border border-slate-200 hover:bg-slate-100"
                        aria-label="Reducir cantidad"
                      >
                        −
                      </button>
                      <span className="min-w-5 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => changeQuantity(item.product.id, 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="h-7 w-7 rounded-md border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <p className="whitespace-nowrap text-sm font-bold">
                      {money(
                        (Number(item.product.price) || 0) * item.quantity
                      )}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-3 rounded-b-2xl bg-slate-50 p-5">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Artículos</span>
              <span>{totalItems}</span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <span className="text-base font-semibold">TOTAL</span>
              <span className="text-3xl font-black text-slate-900">
                {money(total)}
              </span>
            </div>

                        
            <button
                disabled={
                    cart.length === 0 ||
                    loading ||
                    !customerId ||
                    processingSale
                }
                onClick={() => void handleCharge()}
                className="w-full rounded-xl bg-emerald-600 px-4 py-4 text-base font-black tracking-wide text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                {processingSale ? "REGISTRANDO VENTA..." : "COBRAR"}
            </button>

                {checkoutError && (
                <p
                    role="alert"
                    className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                    {checkoutError}
                </p>
                )}

                {checkoutSuccess && (
                <p
                    role="status"
                    className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"
                >
                    {checkoutSuccess}
                </p>
                )}

                <p className="text-center text-xs text-slate-400">
                Selecciona un cliente para registrar la venta.
                </p>

          </div>
        </aside>
      </div>

      
{receipt && (
  <>
    
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-title"
        className="pos-receipt-print my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-slate-200 bg-slate-950 px-6 py-6 text-center text-white">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-xl font-black">
            DRL
          </div>

          <h2 id="receipt-title" className="text-2xl font-black">
            DRL Electronik
          </h2>

          <p className="mt-1 text-sm text-slate-300">
            Comprobante de venta
          </p>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Número de pedido
              </p>
              <p className="mt-1 break-all text-lg font-bold text-slate-950">
                {receipt.orderNumber}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Fecha
              </p>
              <p className="mt-1 text-sm font-medium">
                {receipt.date}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Cliente
            </p>

            <p className="mt-1 font-bold text-slate-900">
              {receipt.customer.full_name ||
                `Cliente ${receipt.customer.id}`}
            </p>

            {receipt.customer.identification && (
              <p className="mt-1 text-sm text-slate-600">
                Identificación: {receipt.customer.identification}
              </p>
            )}

            {receipt.customer.phone && (
              <p className="mt-1 text-sm text-slate-600">
                Teléfono: {receipt.customer.phone}
              </p>
            )}

            {receipt.customer.email && (
              <p className="mt-1 break-all text-sm text-slate-600">
                Correo: {receipt.customer.email}
              </p>
            )}
          </div>

          <div>
            <h3 className="mb-3 font-bold text-slate-900">
              Detalle de productos
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                    <th className="py-2 pr-2">Producto</th>
                    <th className="px-2 py-2 text-center">Cant.</th>
                    <th className="py-2 pl-2 text-right">Importe</th>
                  </tr>
                </thead>

                <tbody>
                  {receipt.items.map((item) => (
                    <tr
                      key={item.product.id}
                      className="border-b border-slate-100"
                    >
                      <td className="py-3 pr-2">
                        <p className="font-semibold text-slate-900">
                          {item.product.name}
                        </p>

                        {(item.product.model ||
                          item.product.variant ||
                          item.product.sku) && (
                          <p className="mt-1 text-xs text-slate-500">
                            {[
                              item.product.model,
                              item.product.variant,
                              item.product.sku,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </td>

                      <td className="px-2 py-3 text-center">
                        {item.quantity}
                      </td>

                      <td className="whitespace-nowrap py-3 pl-2 text-right font-semibold">
                        {money(
                          Number(item.product.price) * item.quantity
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t-2 border-slate-900 pt-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-lg font-bold text-slate-900">
                TOTAL
              </span>

              <span className="text-3xl font-black text-slate-950">
                {money(receipt.total)}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-center">
            <p className="font-bold text-emerald-800">
              Venta registrada correctamente
            </p>
            <p className="mt-1 text-sm text-emerald-700">
              Atendido por: {receipt.cashier}
            </p>
          </div>

          <p className="text-center text-xs text-slate-500">
            Gracias por confiar en DRL Electronik.
          </p>

          <div className="pos-no-print flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-700"
            >
              Imprimir comprobante
            </button>

            <button
              type="button"
              onClick={() => setReceipt(null)}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Continuar vendiendo
            </button>
          </div>
        </div>
      </section>
    </div>
  </>
)}

    </main>
  );
}
